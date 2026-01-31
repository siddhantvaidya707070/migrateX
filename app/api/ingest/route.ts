/**
 * Signal Ingestion API - /api/ingest
 * 
 * PURPOSE:
 * This is the single entry point for ALL signals into the agent pipeline.
 * Both real production signals AND simulation signals flow through here.
 * This ensures the agent processes all data consistently.
 * 
 * ACCEPTED SIGNAL TYPES:
 * - checkout_failure: Payment/checkout flow errors
 * - webhook_failure: Webhook delivery failures
 * - api_error: API call errors
 * - support_ticket: Customer support ticket created
 * - migration_event: Migration state change events
 * 
 * NORMALIZATION:
 * Every ingested event is normalized to a consistent shape:
 * {
 *   id: uuid,
 *   event_type: string,
 *   merchant_id: string,
 *   payload: jsonb,
 *   fingerprint: string,
 *   source: string,
 *   source_origin: "simulation" | "real",
 *   created_at: timestamptz
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAgentClient } from '@/lib/supabase/agent-client'

// Accepted event types - these map to different failure scenarios
const VALID_EVENT_TYPES = [
    'checkout_failure',
    'webhook_failure',
    'api_error',
    'support_ticket',
    'migration_event',
    'log_error',
    'timeout_error',
    'schema_error'
] as const

// Valid source channels
const VALID_SOURCES = [
    'ticket',      // Support ticket system
    'log',         // Application logs
    'webhook',     // Webhook delivery system
    'api',         // Direct API calls
    'migration_state', // Migration tracking
    'simulation'   // Simulation endpoints
] as const

type EventType = typeof VALID_EVENT_TYPES[number]
type SourceType = typeof VALID_SOURCES[number]

interface IngestPayload {
    // Required fields
    event_type: EventType
    payload: Record<string, any>

    // Optional but recommended
    merchant_id?: string
    source?: SourceType

    // Auto-computed if not provided
    fingerprint?: string

    // Simulation metadata
    source_origin?: 'simulation' | 'real'
    simulation_run_id?: string
}

/**
 * Generate a deterministic fingerprint for clustering
 * 
 * FINGERPRINT RULES:
 * 1. Same error type + key payload fields → same fingerprint
 * 2. Used by ObservationEngine to cluster related events
 * 3. Must be stable (same input always = same output)
 * 4. Must be meaningful (not random, captures error essence)
 */
function generateFingerprint(eventType: string, payload: Record<string, any>): string {
    // Priority-based fingerprint generation
    // We check fields in order of specificity

    const parts: string[] = [eventType]

    // Error code is most specific
    if (payload.error_code) {
        parts.push(`err:${payload.error_code}`)
    }
    // Error type is next
    else if (payload.error_type) {
        parts.push(`type:${payload.error_type}`)
    }
    // Event name for webhooks
    else if (payload.event) {
        parts.push(`event:${payload.event}`)
    }
    // Reason for failures
    else if (payload.reason) {
        parts.push(`reason:${normalizeReason(payload.reason)}`)
    }
    // HTTP status for API errors
    else if (payload.status_code) {
        parts.push(`status:${payload.status_code}`)
    }
    // Message hash for logs
    else if (payload.message) {
        parts.push(`msg:${normalizeMessage(payload.message)}`)
    }

    // Add migration stage context if present
    if (payload.migration_stage) {
        parts.push(`stage:${payload.migration_stage}`)
    }

    // Add version context if present (for version mismatch errors)
    if (payload.api_version) {
        parts.push(`v:${payload.api_version}`)
    }

    return parts.join(':')
}

/**
 * Normalize error reason for consistent fingerprinting
 * Removes dynamic parts (IDs, timestamps) to group similar errors
 */
function normalizeReason(reason: string): string {
    return reason
        .toLowerCase()
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
        .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
        .replace(/\d+/g, 'N')
        .replace(/\s+/g, '_')
        .slice(0, 30)
}

/**
 * Normalize log message for consistent fingerprinting
 */
function normalizeMessage(message: string): string {
    return message
        .toLowerCase()
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
        .replace(/\d+\.\d+\.\d+\.\d+/g, 'IP')
        .replace(/\d+/g, 'N')
        .replace(/\s+/g, '_')
        .slice(0, 40)
}

/**
 * POST /api/ingest
 * 
 * Accepts signals from any source and normalizes them into raw_events.
 * This is the unified entry point for the agent's observation layer.
 */
export async function POST(req: NextRequest) {
    try {
        const body: IngestPayload = await req.json()

        // === VALIDATION ===

        // Event type is required
        if (!body.event_type) {
            return NextResponse.json(
                { error: 'Missing required field: event_type' },
                { status: 400 }
            )
        }

        // Validate event type
        if (!VALID_EVENT_TYPES.includes(body.event_type as EventType)) {
            return NextResponse.json(
                {
                    error: `Invalid event_type: ${body.event_type}`,
                    valid_types: VALID_EVENT_TYPES
                },
                { status: 400 }
            )
        }

        // Payload is required
        if (!body.payload || typeof body.payload !== 'object') {
            return NextResponse.json(
                { error: 'Missing or invalid payload (must be object)' },
                { status: 400 }
            )
        }

        // === NORMALIZATION ===

        // Determine source (default to 'api' for direct calls)
        const source = body.source && VALID_SOURCES.includes(body.source as SourceType)
            ? body.source
            : 'api'

        // Generate fingerprint if not provided
        const fingerprint = body.fingerprint || generateFingerprint(body.event_type, body.payload)

        // Determine source origin
        const sourceOrigin = body.source_origin || 'real'

        // Extract or generate merchant_id
        // WHY: Merchant ID is critical for multi-merchant impact detection
        const merchantId = body.merchant_id
            || body.payload.merchant_id
            || body.payload.merchantId
            || 'unknown'

        // === INSERT INTO DATABASE ===

        const supabase = createAgentClient()

        const { data, error } = await supabase
            .from('raw_events')
            .insert({
                source,
                event_type: body.event_type,
                merchant_id: merchantId,
                fingerprint,
                payload: body.payload,
                source_origin: sourceOrigin,
                simulation_run_id: body.simulation_run_id || null,
                processed: false
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase ingest error:', error)
            return NextResponse.json(
                { error: 'Database error', details: error.message },
                { status: 500 }
            )
        }

        // Return normalized event data
        return NextResponse.json({
            success: true,
            event: {
                id: data.id,
                event_type: body.event_type,
                merchant_id: merchantId,
                fingerprint,
                source,
                source_origin: sourceOrigin,
                created_at: data.created_at
            }
        }, { status: 201 })

    } catch (err: any) {
        console.error('Ingest API error:', err)
        return NextResponse.json(
            { error: 'Internal Server Error', details: err.message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/ingest
 * 
 * Returns API documentation and health check
 */
export async function GET() {
    return NextResponse.json({
        service: 'Signal Ingestion API',
        version: '1.0',
        status: 'healthy',
        endpoints: {
            'POST /api/ingest': {
                description: 'Ingest a signal into the agent pipeline',
                required_fields: ['event_type', 'payload'],
                optional_fields: ['merchant_id', 'source', 'fingerprint', 'source_origin'],
                valid_event_types: VALID_EVENT_TYPES,
                valid_sources: VALID_SOURCES
            }
        },
        example: {
            event_type: 'checkout_failure',
            merchant_id: 'merchant_123',
            payload: {
                error_code: 'PAYMENT_FAILED',
                message: 'Card declined',
                amount: 99.99
            }
        }
    })
}
