/**
 * Documentation Gap Simulation - /api/simulate/doc_gap
 * 
 * PURPOSE:
 * Simulate a documentation gap causing merchant confusion.
 * This is a LOW RISK scenario that should trigger:
 * - Lower risk score (no checkout impact, but multi-merchant)
 * - Documentation gap classification
 * - Support ticket draft (not engineering escalation)
 * 
 * SCENARIO CONTEXT:
 * During migration, the new API has a parameter that's documented
 * inconsistently. Merchants keep hitting the same error, filing
 * similar support tickets, and getting API errors about invalid parameters.
 * This ISN'T a platform outage - it's a docs/UX issue.
 * 
 * WHY THIS MATTERS:
 * This scenario demonstrates the agent's ability to:
 * 1. Distinguish docs issues from platform regressions
 * 2. NOT over-escalate (avoid false P1s)
 * 3. Recognize patterns across support tickets AND API errors
 * 4. Suggest documentation updates, not engineering fixes
 * 
 * CONTRAST WITH CHECKOUT_FAILURE:
 * - checkout_failure: High risk, checkout impact, engineering escalation
 * - doc_gap: Low risk, confusion-based, support + docs update
 * 
 * DEFAULT BEHAVIOR:
 * - Generates mix of API errors and support tickets
 * - Lower event volume than checkout failures
 * - Spread over longer time window (1 hour)
 * - Clearly docs-related error messages
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

// Support ticket templates for doc gap scenarios
const SUPPORT_TICKET_TEMPLATES = [
    {
        subject: 'API parameter not working as documented',
        body: 'I followed the migration guide but the "checkout_mode" parameter returns an error. The docs say to use "hosted" but that gives a 400 error.',
        category: 'api_issue'
    },
    {
        subject: 'Confused about required fields in v2 API',
        body: 'The docs show shipping_address as optional but my requests fail without it. Is this a bug or is the documentation wrong?',
        category: 'documentation'
    },
    {
        subject: 'Date format error but docs dont specify format',
        body: 'Getting "Invalid date format" errors. I tried YYYY-MM-DD but it wants something else. Documentation doesnt show the required format.',
        category: 'documentation'
    },
    {
        subject: 'Webhook signature failing after migration',
        body: 'We migrated to v2 webhooks but signature verification fails. The docs show both SHA256 and HMAC-SHA256 - which one should we use?',
        category: 'integration'
    },
    {
        subject: 'Cant find checkout_session_complete event',
        body: 'Docs mention a checkout_session_complete webhook event but I only see checkout.session.completed. Is the naming different in v2?',
        category: 'documentation'
    }
]

interface DocGapParams {
    // Number of merchants affected
    merchant_count?: number

    // Support tickets per merchant
    tickets_per_merchant?: number

    // API errors per merchant
    api_errors_per_merchant?: number

    // Error type from templates
    error_type?: keyof typeof ERROR_TEMPLATES.docs

    // Time window for spread (longer for doc issues - they build up slowly)
    time_window_minutes?: number
}

export async function POST(req: NextRequest) {
    try {
        const params: DocGapParams = await req.json().catch(() => ({}))

        // === CONFIGURATION ===
        const config = {
            merchant_count: params.merchant_count || SCENARIO_DEFAULTS.doc_gap.merchant_count,
            tickets_per_merchant: params.tickets_per_merchant || SCENARIO_DEFAULTS.doc_gap.tickets_per_merchant,
            api_errors_per_merchant: params.api_errors_per_merchant || SCENARIO_DEFAULTS.doc_gap.api_errors_per_merchant,
            error_type: params.error_type || SCENARIO_DEFAULTS.doc_gap.error_type,
            time_window_minutes: params.time_window_minutes || SCENARIO_DEFAULTS.doc_gap.time_window_minutes
        }

        const runId = generateSimulationRunId('doc_gap')
        const merchants = getRandomMerchants(config.merchant_count)

        // Get error template
        const errorTemplate = ERROR_TEMPLATES.docs[config.error_type]

        // Fingerprint for clustering
        // Note: Different from checkout - includes "docs" context
        const fingerprint = `doc_gap:${config.error_type}:api_confusion`

        // Calculate total events
        const ticketCount = config.merchant_count * config.tickets_per_merchant
        const errorCount = config.merchant_count * config.api_errors_per_merchant
        const totalEvents = ticketCount + errorCount

        // Generate timestamps over longer window
        // WHY: Doc issues build up slowly as more merchants hit the same confusion
        const timestamps = generateTimestamps(totalEvents, config.time_window_minutes)

        // === GENERATE EVENTS ===
        const events: IngestEventParams[] = []
        let timestampIndex = 0

        for (const merchant of merchants) {
            // Generate support tickets for this merchant
            // WHY: Doc gaps often surface as support tickets first
            for (let i = 0; i < config.tickets_per_merchant; i++) {
                const template = SUPPORT_TICKET_TEMPLATES[
                    Math.floor(Math.random() * SUPPORT_TICKET_TEMPLATES.length)
                ]

                const payload = {
                    // Ticket metadata
                    ticket_id: `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                    ticket_status: 'open',
                    ticket_priority: 'normal',
                    ticket_category: template.category,

                    // Ticket content
                    subject: template.subject,
                    description: template.body,

                    // Merchant context
                    merchant_id: merchant.id,
                    merchant_name: merchant.name,
                    merchant_tier: merchant.tier,

                    // Contact info
                    submitter_email: `developer@${merchant.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    submitter_role: 'developer',

                    // Doc-specific context
                    related_docs: ['migration-guide', 'api-reference-v2', 'webhooks-guide'],
                    api_version: 'v2',

                    // Timestamp
                    submitted_at: timestamps[timestampIndex]?.toISOString() || new Date().toISOString()
                }

                events.push({
                    event_type: 'support_ticket',
                    merchant_id: merchant.id,
                    payload,
                    fingerprint,
                    source_origin: 'simulation',
                    simulation_run_id: runId,
                    source: 'ticket'
                })

                timestampIndex++
            }

            // Generate API errors for this merchant
            // WHY: API errors often accompany support tickets
            // Same merchants hitting the same doc-related issue
            for (let i = 0; i < config.api_errors_per_merchant; i++) {
                const payload = {
                    // Error details
                    error_code: errorTemplate.error_code,
                    error_message: errorTemplate.message,
                    error_hint: errorTemplate.hint || 'Check documentation for correct usage',

                    // Merchant context
                    merchant_id: merchant.id,
                    merchant_name: merchant.name,

                    // Request context (not checkout - lower impact)
                    endpoint: '/api/v2/products/sync',
                    http_method: 'POST',
                    http_status: 400,
                    request_id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

                    // Parameter that caused confusion
                    problematic_parameter: config.error_type === 'parameter_confusion'
                        ? 'checkout_mode'
                        : 'format',
                    provided_value: config.error_type === 'parameter_confusion'
                        ? 'hosted'  // User used deprecated value
                        : '2024-01-31',  // User used wrong date format
                    expected_format: config.error_type === 'parameter_confusion'
                        ? 'embedded | redirect'
                        : 'ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)',

                    // Doc reference - explicitly shows this is a docs issue
                    documentation_link: 'https://docs.example.com/v2/api-reference',

                    // Timestamp
                    occurred_at: timestamps[timestampIndex]?.toISOString() || new Date().toISOString()
                }

                events.push({
                    event_type: 'api_error',
                    merchant_id: merchant.id,
                    payload,
                    fingerprint,
                    source_origin: 'simulation',
                    simulation_run_id: runId,
                    source: 'api'
                })

                timestampIndex++
            }
        }

        // === BATCH INSERT ===
        const result = await batchIngestEvents(events)

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: 'Failed to ingest simulation events',
                run_id: runId
            }, { status: 500 })
        }

        // === RESPONSE ===
        return NextResponse.json({
            success: true,
            scenario: 'doc_gap',
            description: 'Simulated documentation gap causing merchant confusion',

            simulation: {
                run_id: runId,
                fingerprint,
                timestamp: new Date().toISOString()
            },

            generated: {
                total_events: result.inserted,
                support_tickets: ticketCount,
                api_errors: errorCount,
                merchants_affected: merchants.length,
                time_window_minutes: config.time_window_minutes
            },

            config: {
                error_type: config.error_type,
                error_code: errorTemplate.error_code,
                tickets_per_merchant: config.tickets_per_merchant,
                api_errors_per_merchant: config.api_errors_per_merchant
            },

            merchants: merchants.map(m => ({
                id: m.id,
                name: m.name,
                tier: m.tier
            })),

            // CONTRAST with checkout_failure
            expected_outcome: {
                risk_level: 'LOW-MEDIUM',
                expected_score: '2-5',
                expected_classification: 'documentation_gap',
                expected_action: 'draft_ticket_reply + request_doc_update',
                reasoning: 'No checkout impact, consistent confusion pattern across merchants suggests docs issue'
            },

            // Contrast explanation for judges
            scenario_contrast: {
                vs_checkout_failure: 'Unlike checkout_failure, this scenario has no payment impact. The agent should recognize this is a UX/docs problem, not a platform outage.',
                key_signals: [
                    'Support tickets with docs-related keywords',
                    'API errors about parameters/format (not timeouts/500s)',
                    'No checkout or payment context',
                    'Error hints point to documentation'
                ]
            },

            next_steps: [
                'Call GET /api/agent-loop to trigger agent processing',
                'Compare risk score with checkout_failure scenario',
                'Verify classification is documentation_gap (not platform_regression)',
                'Check that action is ticket draft, not engineering incident'
            ]
        })

    } catch (err: any) {
        console.error('Doc gap simulation error:', err)
        return NextResponse.json({
            success: false,
            error: 'Simulation failed',
            details: err.message
        }, { status: 500 })
    }
}

/**
 * GET /api/simulate/doc_gap
 * Returns scenario documentation
 */
export async function GET() {
    return NextResponse.json({
        scenario: 'doc_gap',
        risk_level: 'LOW',
        description: 'Simulates a documentation gap causing merchant confusion (no outage)',

        context: {
            problem: 'API parameter documentation is inconsistent or unclear',
            impact: 'Merchants confused, filing support tickets, getting API errors',
            urgency: 'Low - frustrating but not revenue-impacting'
        },

        parameters: {
            merchant_count: {
                type: 'number',
                default: 3,
                description: 'Number of confused merchants'
            },
            tickets_per_merchant: {
                type: 'number',
                default: 2,
                description: 'Support tickets per merchant'
            },
            api_errors_per_merchant: {
                type: 'number',
                default: 3,
                description: 'API errors per merchant'
            },
            error_type: {
                type: 'string',
                default: 'parameter_confusion',
                options: Object.keys(ERROR_TEMPLATES.docs),
                description: 'Type of documentation issue'
            },
            time_window_minutes: {
                type: 'number',
                default: 60,
                description: 'Time window (longer - doc issues build slowly)'
            }
        },

        example_request: {
            method: 'POST',
            body: {
                merchant_count: 3,
                tickets_per_merchant: 2,
                error_type: 'parameter_confusion'
            }
        },

        expected_agent_behavior: {
            observation: 'Mix of support tickets and API errors with shared fingerprint',
            hypothesis: 'Documentation unclear about parameter usage',
            risk_score: '2-5 (no checkout impact)',
            classification: 'documentation_gap',
            action: 'draft_ticket_reply with suggestion to update docs'
        },

        contrast_with_checkout_failure: {
            checkout_failure: 'HIGH risk, checkout impact, P1 engineering escalation',
            doc_gap: 'LOW risk, confusion only, support ticket + docs update'
        }
    })
}
