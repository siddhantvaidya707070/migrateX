/**
 * Simulation Utilities
 * 
 * PURPOSE:
 * Shared utilities for generating realistic simulation data.
 * Used by all simulation endpoints to ensure consistency.
 * 
 * DESIGN PRINCIPLES:
 * 1. Realistic: Data should look indistinguishable from production
 * 2. Deterministic: Same inputs produce same outputs where appropriate
 * 3. Controllable: Parameters allow fine-tuning scenarios
 * 4. Documented: Every field has a purpose
 */

import { createAgentClient } from '@/lib/supabase/agent-client'

// ============================================
// MERCHANT DATA
// Realistic merchant names for simulation
// ============================================

const MERCHANT_POOL = [
    { id: 'merch_artisan_coffee', name: 'Artisan Coffee Co', tier: 'enterprise' },
    { id: 'merch_urban_threads', name: 'Urban Threads Fashion', tier: 'growth' },
    { id: 'merch_tech_gadgets', name: 'TechGadgets Pro', tier: 'enterprise' },
    { id: 'merch_home_essentials', name: 'Home Essentials Plus', tier: 'starter' },
    { id: 'merch_fitness_first', name: 'Fitness First Store', tier: 'growth' },
    { id: 'merch_organic_market', name: 'Organic Market', tier: 'enterprise' },
    { id: 'merch_pet_paradise', name: 'Pet Paradise', tier: 'growth' },
    { id: 'merch_book_haven', name: 'Book Haven', tier: 'starter' },
    { id: 'merch_sports_zone', name: 'Sports Zone', tier: 'enterprise' },
    { id: 'merch_beauty_box', name: 'Beauty Box', tier: 'growth' },
    { id: 'merch_kids_world', name: 'Kids World', tier: 'starter' },
    { id: 'merch_outdoor_gear', name: 'Outdoor Gear Co', tier: 'enterprise' },
]

/**
 * Get a random subset of merchants
 * WHY: Multi-merchant scenarios are critical for demonstrating 
 * the agent's ability to detect widespread issues
 */
export function getRandomMerchants(count: number): typeof MERCHANT_POOL {
    const shuffled = [...MERCHANT_POOL].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, MERCHANT_POOL.length))
}

// ============================================
// ERROR TEMPLATES
// Realistic error messages by category
// ============================================

export const ERROR_TEMPLATES = {
    checkout: {
        schema_mismatch: {
            error_code: 'CHECKOUT_SCHEMA_MISMATCH',
            message: 'Request body does not match expected schema for checkout v2 API',
            hint: 'Check migration guide for required fields in new API version'
        },
        payment_timeout: {
            error_code: 'PAYMENT_GATEWAY_TIMEOUT',
            message: 'Payment provider did not respond within timeout threshold',
            hint: 'This may indicate upstream payment provider issues'
        },
        session_expired: {
            error_code: 'SESSION_EXPIRED',
            message: 'Checkout session has expired, customer must restart',
            hint: 'Sessions expire after 30 minutes of inactivity'
        },
        inventory_sync: {
            error_code: 'INVENTORY_SYNC_FAILED',
            message: 'Failed to validate inventory during checkout',
            hint: 'Inventory service may be experiencing delays'
        }
    },
    webhook: {
        delivery_failed: {
            error_code: 'WEBHOOK_DELIVERY_FAILED',
            message: 'Webhook endpoint returned non-2xx status code',
            status_code: 500
        },
        timeout: {
            error_code: 'WEBHOOK_TIMEOUT',
            message: 'Webhook endpoint did not respond within 30 seconds',
            status_code: null
        },
        invalid_signature: {
            error_code: 'WEBHOOK_SIGNATURE_INVALID',
            message: 'HMAC signature verification failed',
            status_code: null
        }
    },
    api: {
        rate_limited: {
            error_code: 'RATE_LIMIT_EXCEEDED',
            message: 'API rate limit exceeded, please retry after cooldown',
            status_code: 429
        },
        auth_failed: {
            error_code: 'AUTHENTICATION_FAILED',
            message: 'Invalid API key or token expired',
            status_code: 401
        },
        deprecated_endpoint: {
            error_code: 'DEPRECATED_ENDPOINT',
            message: 'This endpoint is deprecated, please migrate to v2 API',
            status_code: 410
        }
    },
    docs: {
        parameter_confusion: {
            error_code: 'INVALID_PARAMETER',
            message: 'Parameter "checkout_mode" is not recognized',
            hint: 'See documentation for valid parameter names'
        },
        missing_field: {
            error_code: 'MISSING_REQUIRED_FIELD',
            message: 'Required field "shipping_address" is missing from request',
            hint: 'Check API documentation for required fields'
        },
        format_error: {
            error_code: 'INVALID_FORMAT',
            message: 'Date format does not match expected ISO-8601',
            hint: 'Please use format: YYYY-MM-DDTHH:mm:ssZ'
        }
    }
}

// ============================================
// TIME UTILITIES
// Generate realistic timestamps across a time window
// ============================================

/**
 * Generate timestamps spread across a time window
 * WHY: Real production issues don't all happen at the same instant.
 * Spreading events over time makes the simulation more realistic
 * and allows the agent to observe patterns evolving.
 * 
 * @param count Number of timestamps to generate
 * @param windowMinutes Time window in minutes (default: 15)
 * @returns Array of Date objects spread across the window
 */
export function generateTimestamps(count: number, windowMinutes: number = 15): Date[] {
    const now = new Date()
    const windowMs = windowMinutes * 60 * 1000

    const timestamps: Date[] = []
    for (let i = 0; i < count; i++) {
        // Spread events across the window with some randomness
        // Events tend to cluster (bursts) which is realistic
        const baseOffset = (i / count) * windowMs
        const jitter = Math.random() * (windowMs / count) * 0.5
        const offset = baseOffset + jitter

        timestamps.push(new Date(now.getTime() - windowMs + offset))
    }

    return timestamps.sort((a, b) => a.getTime() - b.getTime())
}

/**
 * Generate a single timestamp with realistic jitter
 */
export function generateJitteredTimestamp(baselineMs: number = 0, jitterMs: number = 5000): Date {
    const jitter = Math.random() * jitterMs - (jitterMs / 2)
    return new Date(Date.now() - baselineMs + jitter)
}

// ============================================
// SIMULATION TRACKING
// Track simulation runs for debugging
// ============================================

export interface SimulationRun {
    id: string
    scenario: string
    started_at: Date
    event_count: number
    merchants: string[]
    fingerprint: string
}

/**
 * Generate a unique simulation run ID
 * WHY: Allows tracking which events came from which simulation trigger
 * Useful for debugging and demonstrating to judges
 */
export function generateSimulationRunId(scenario: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2, 6)
    return `sim_${scenario}_${timestamp}_${random}`
}

// ============================================
// INGESTION HELPER
// Reuse the ingestion logic for simulations
// ============================================

export interface IngestEventParams {
    event_type: string
    merchant_id: string
    payload: Record<string, any>
    fingerprint: string
    source_origin: 'simulation' | 'real'
    simulation_run_id: string
    source?: string
}

/**
 * Ingest an event directly into the database
 * WHY: Simulation endpoints should use the same data path as real events.
 * This function provides a direct database insert when we need to 
 * control timing (for generating events with spread timestamps).
 */
export async function ingestEvent(params: IngestEventParams): Promise<{ id: string } | null> {
    const supabase = createAgentClient()

    const { data, error } = await supabase
        .from('raw_events')
        .insert({
            source: params.source || 'simulation',
            event_type: params.event_type,
            merchant_id: params.merchant_id,
            fingerprint: params.fingerprint,
            payload: params.payload,
            source_origin: params.source_origin,
            simulation_run_id: params.simulation_run_id,
            processed: false
        })
        .select('id')
        .single()

    if (error) {
        console.error('Ingest error:', error)
        return null
    }

    return { id: data.id }
}

/**
 * Batch ingest multiple events
 * WHY: More efficient than individual inserts for simulation scenarios
 */
export async function batchIngestEvents(events: IngestEventParams[]): Promise<{
    success: boolean
    inserted: number
    errors: number
}> {
    const supabase = createAgentClient()

    const records = events.map(e => ({
        source: e.source || 'simulation',
        event_type: e.event_type,
        merchant_id: e.merchant_id,
        fingerprint: e.fingerprint,
        payload: e.payload,
        source_origin: e.source_origin,
        simulation_run_id: e.simulation_run_id,
        processed: false
    }))

    const { data, error } = await supabase
        .from('raw_events')
        .insert(records)
        .select('id')

    if (error) {
        console.error('Batch ingest error:', error)
        return { success: false, inserted: 0, errors: events.length }
    }

    return {
        success: true,
        inserted: data?.length || 0,
        errors: events.length - (data?.length || 0)
    }
}

// ============================================
// SCENARIO CONFIGURATION
// Default parameters for simulation scenarios
// ============================================

export const SCENARIO_DEFAULTS = {
    checkout_failure: {
        merchant_count: 5,
        events_per_merchant: 6,
        time_window_minutes: 15,
        error_type: 'schema_mismatch' as keyof typeof ERROR_TEMPLATES.checkout
    },
    doc_gap: {
        merchant_count: 3,
        tickets_per_merchant: 2,
        api_errors_per_merchant: 3,
        time_window_minutes: 60,
        error_type: 'parameter_confusion' as keyof typeof ERROR_TEMPLATES.docs
    }
}
