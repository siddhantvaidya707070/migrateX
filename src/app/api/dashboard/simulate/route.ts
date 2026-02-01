/**
 * Simulation Runner API - /api/dashboard/simulate
 * SIMPLIFIED: No spread distribution, immediate injection, hard limits
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAgentClient } from '@/lib/supabase/agent-client'
import { generateEventBatch, ErrorType } from '@/lib/simulation/event-generator'

// HARD LIMITS - ENFORCED
const MAX_MERCHANTS = 10
const MAX_EVENTS = 50

interface SimulationConfig {
    errorTypes?: string[]
    riskProfiles?: ('low' | 'medium' | 'high')[]
    eventCount?: number
    merchantCount?: number
    auto_trigger_agent?: boolean
}

function generateSimulationRunId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `sim_${timestamp}_${random}`
}

export async function POST(req: NextRequest) {
    const supabase = createAgentClient()

    try {
        const config: SimulationConfig = await req.json()

        // Normalize config with HARD LIMITS
        const errorTypes: ErrorType[] = config.errorTypes?.map(t => t as ErrorType) || ['checkout_failure']
        const riskProfiles = config.riskProfiles || ['medium']
        const eventCount = Math.min(config.eventCount || 25, MAX_EVENTS)
        const merchantCount = Math.min(config.merchantCount || 5, MAX_MERCHANTS)
        const autoTrigger = config.auto_trigger_agent !== false

        const runId = generateSimulationRunId()

        console.log(`[Simulation] Starting: ${eventCount} events, ${merchantCount} merchants, run_id=${runId}`)

        // Generate events
        const generatedEvents = generateEventBatch(
            errorTypes,
            riskProfiles as ('low' | 'medium' | 'high')[],
            eventCount,
            merchantCount
        )

        // Convert to database format
        const records = generatedEvents.map(event => ({
            source: 'simulation',
            event_type: event.type,
            merchant_id: event.merchant.id,
            fingerprint: event.fingerprint,
            payload: {
                error_code: event.details.errorCode,
                error_message: event.details.errorMessage,
                merchant_id: event.merchant.id,
                merchant_name: event.merchant.name,
                merchant_tier: event.merchant.size,
                endpoint: event.details.endpoint,
                http_status: event.details.httpStatus,
                request_id: event.details.requestId,
                affected_feature: event.details.affectedFeature,
                occurred_at: event.timestamp,
                simulation_run_id: runId
            },
            source_origin: 'simulation' as const,
            simulation_run_id: runId,
            processed: false
        }))

        // INSERT ALL EVENTS IMMEDIATELY - NO SPREADING
        const { error: insertError } = await supabase
            .from('raw_events')
            .insert(records)

        if (insertError) {
            console.error('[Simulation] Insert error:', insertError)
            throw new Error(`Insert error: ${insertError.message}`)
        }

        console.log(`[Simulation] Inserted ${records.length} events successfully`)

        const result: any = {
            success: true,
            runId,
            eventsGenerated: eventCount,
            merchantsAffected: merchantCount,
            errorTypes,
            riskProfiles,
            timestamp: new Date().toISOString()
        }

        // Auto-trigger agent loop
        if (autoTrigger) {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                const agentResponse = await fetch(`${baseUrl}/api/agent-loop`, {
                    method: 'GET',
                    cache: 'no-store'
                })
                const agentResult = await agentResponse.json()
                result.agentLoop = {
                    triggered: true,
                    ...agentResult
                }
                console.log(`[Simulation] Agent loop triggered, processed ${agentResult.processed || 0} observations`)
            } catch (agentErr: any) {
                console.error('[Simulation] Agent loop error:', agentErr)
                result.agentLoop = {
                    triggered: false,
                    error: agentErr.message
                }
            }
        }

        return NextResponse.json(result)

    } catch (err: any) {
        console.error('[Simulation] Error:', err)
        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 })
    }
}

// GET endpoint for validation info
export async function GET() {
    return NextResponse.json({
        limits: {
            maxMerchants: MAX_MERCHANTS,
            maxEvents: MAX_EVENTS
        },
        features: {
            spreadDistribution: false,
            immediateInjection: true
        }
    })
}
