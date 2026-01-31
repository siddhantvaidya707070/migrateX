/**
 * Checkout Failure Simulation - /api/simulate/checkout_failure
 * 
 * PURPOSE:
 * Simulate a silent checkout regression during migration.
 * This is a HIGH RISK scenario that should trigger:
 * - High risk score (checkout + multi-merchant = high priority)
 * - Platform regression classification
 * - Immediate engineering escalation
 * 
 * SCENARIO CONTEXT:
 * During the migration from hosted → headless architecture,
 * a schema change in the checkout API causes validation failures.
 * Multiple merchants start experiencing payment failures simultaneously.
 * The shared fingerprint across merchants indicates a platform issue,
 * not individual merchant misconfiguration.
 * 
 * WHY THIS MATTERS:
 * This scenario demonstrates the agent's ability to:
 * 1. Detect patterns across multiple merchants
 * 2. Recognize platform-level issues vs individual errors
 * 3. Escalate appropriately (engineering, not support)
 * 4. Calculate high risk score based on checkout + multi-merchant
 * 
 * DEFAULT BEHAVIOR:
 * - Generates 30 checkout failure events (5 merchants × 6 events each)
 * - Spread over 15-minute window
 * - Same fingerprint for clustering
 * - Includes migration context
 */

import { NextRequest, NextResponse } from 'next/server'
import {
    getRandomMerchants,
    generateTimestamps,
    generateSimulationRunId,
    batchIngestEvents,
    ERROR_TEMPLATES,
    SCENARIO_DEFAULTS,
    IngestEventParams
} from '@/lib/simulation/utils'

interface CheckoutFailureParams {
    // Number of merchants affected (default: 5)
    // WHY: Multi-merchant is critical for triggering x2 risk multiplier
    merchant_count?: number

    // Events per merchant (default: 6)
    // WHY: Multiple events per merchant shows pattern, not one-off
    events_per_merchant?: number

    // Error type from templates (default: 'schema_mismatch')
    // WHY: Different error types trigger different agent responses
    error_type?: keyof typeof ERROR_TEMPLATES.checkout

    // Payment provider simulation
    payment_provider?: string

    // Time window for event spread (default: 15 minutes)
    time_window_minutes?: number

    // API version mismatch context
    api_version?: string

    // Frontend version context
    frontend_version?: string
}

export async function POST(req: NextRequest) {
    try {
        const params: CheckoutFailureParams = await req.json().catch(() => ({}))

        // === CONFIGURATION ===
        // Apply defaults with overrides
        const config = {
            merchant_count: params.merchant_count || SCENARIO_DEFAULTS.checkout_failure.merchant_count,
            events_per_merchant: params.events_per_merchant || SCENARIO_DEFAULTS.checkout_failure.events_per_merchant,
            error_type: params.error_type || SCENARIO_DEFAULTS.checkout_failure.error_type,
            time_window_minutes: params.time_window_minutes || SCENARIO_DEFAULTS.checkout_failure.time_window_minutes,
            payment_provider: params.payment_provider || 'stripe_headless',
            api_version: params.api_version || 'v2.1.0',
            frontend_version: params.frontend_version || '3.4.2'
        }

        // Generate simulation run ID for tracking
        const runId = generateSimulationRunId('checkout_failure')

        // Get merchants for this simulation
        const merchants = getRandomMerchants(config.merchant_count)

        // Calculate total events
        const totalEvents = config.merchant_count * config.events_per_merchant

        // Generate error template
        const errorTemplate = ERROR_TEMPLATES.checkout[config.error_type]

        // Generate deterministic fingerprint
        // WHY: Same fingerprint across all events enables clustering
        // This is how the agent detects "this is one issue affecting many merchants"
        const fingerprint = `checkout_failure:${config.error_type}:${config.api_version}`

        // Generate spread timestamps
        // WHY: Real failures don't all happen at once
        // Spreading across time window makes simulation realistic
        const timestamps = generateTimestamps(totalEvents, config.time_window_minutes)

        // === GENERATE EVENTS ===
        const events: IngestEventParams[] = []
        let timestampIndex = 0

        for (const merchant of merchants) {
            for (let i = 0; i < config.events_per_merchant; i++) {
                // Generate realistic payload
                // WHY: Rich payloads give the agent more context to reason about
                const payload = {
                    // Error details from template
                    error_code: errorTemplate.error_code,
                    error_message: errorTemplate.message,
                    error_hint: errorTemplate.hint,

                    // Merchant context
                    merchant_id: merchant.id,
                    merchant_name: merchant.name,
                    merchant_tier: merchant.tier,

                    // Checkout context - critical for risk scoring
                    checkout_session_id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    cart_value: Math.floor(Math.random() * 500) + 50, // $50-$550
                    currency: 'USD',
                    payment_method: 'card',

                    // Migration context - triggers migration_error classification
                    migration_stage: 'checkout_migration',
                    api_version: config.api_version,
                    frontend_version: config.frontend_version,
                    payment_provider: config.payment_provider,

                    // Technical context
                    request_id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    endpoint: '/api/v2/checkout/complete',
                    http_method: 'POST',
                    http_status: 400,

                    // Timestamp of original failure
                    occurred_at: timestamps[timestampIndex]?.toISOString() || new Date().toISOString()
                }

                events.push({
                    event_type: 'checkout_failure',
                    merchant_id: merchant.id,
                    payload,
                    fingerprint,
                    source_origin: 'simulation',
                    simulation_run_id: runId,
                    source: 'webhook'
                })

                timestampIndex++
            }
        }

        // === BATCH INSERT ===
        // WHY: Single batch insert is more efficient and atomic
        const result = await batchIngestEvents(events)

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: 'Failed to ingest simulation events',
                run_id: runId
            }, { status: 500 })
        }

        // === RESPONSE ===
        // Detailed response for judge visibility
        return NextResponse.json({
            success: true,
            scenario: 'checkout_failure',
            description: 'Simulated checkout regression during headless migration',

            // Simulation metadata
            simulation: {
                run_id: runId,
                fingerprint,
                timestamp: new Date().toISOString()
            },

            // What was generated
            generated: {
                total_events: result.inserted,
                merchants_affected: merchants.length,
                events_per_merchant: config.events_per_merchant,
                time_window_minutes: config.time_window_minutes
            },

            // Configuration used
            config: {
                error_type: config.error_type,
                error_code: errorTemplate.error_code,
                api_version: config.api_version,
                payment_provider: config.payment_provider
            },

            // Affected merchants list
            merchants: merchants.map(m => ({
                id: m.id,
                name: m.name,
                tier: m.tier
            })),

            // Expected agent behavior
            expected_outcome: {
                risk_level: 'HIGH',
                expected_score: '7-10',
                expected_classification: 'platform_regression OR migration_error',
                expected_action: 'create_engineering_incident',
                reasoning: 'Multi-merchant checkout failures during migration = platform issue'
            },

            // Next steps for demo
            next_steps: [
                'Call GET /api/agent-loop to trigger agent processing',
                'Check raw_events table for ingested events',
                'Check observations table for clustered pattern',
                'Check audit_logs for agent reasoning steps'
            ]
        })

    } catch (err: any) {
        console.error('Checkout failure simulation error:', err)
        return NextResponse.json({
            success: false,
            error: 'Simulation failed',
            details: err.message
        }, { status: 500 })
    }
}

/**
 * GET /api/simulate/checkout_failure
 * Returns scenario documentation
 */
export async function GET() {
    return NextResponse.json({
        scenario: 'checkout_failure',
        risk_level: 'HIGH',
        description: 'Simulates a checkout regression affecting multiple merchants during headless migration',

        context: {
            problem: 'Schema change in checkout API causes validation failures',
            impact: 'Multiple merchants experiencing payment failures',
            urgency: 'High - revenue-impacting failure'
        },

        parameters: {
            merchant_count: {
                type: 'number',
                default: 5,
                description: 'Number of merchants to affect (triggers multi-merchant risk multiplier)'
            },
            events_per_merchant: {
                type: 'number',
                default: 6,
                description: 'Failure events per merchant'
            },
            error_type: {
                type: 'string',
                default: 'schema_mismatch',
                options: Object.keys(ERROR_TEMPLATES.checkout),
                description: 'Type of checkout error to simulate'
            },
            time_window_minutes: {
                type: 'number',
                default: 15,
                description: 'Time window over which events are spread'
            },
            api_version: {
                type: 'string',
                default: 'v2.1.0',
                description: 'API version context'
            }
        },

        example_request: {
            method: 'POST',
            body: {
                merchant_count: 5,
                events_per_merchant: 6,
                error_type: 'schema_mismatch',
                payment_provider: 'stripe_headless'
            }
        },

        expected_agent_behavior: {
            observation: 'Multiple checkout failures clustered by fingerprint',
            hypothesis: 'Schema mismatch during migration causing checkout failures',
            risk_score: '7-10 (checkout + multi-merchant)',
            classification: 'platform_regression',
            action: 'create_engineering_incident with P1/P2 severity'
        }
    })
}
