import { NextResponse } from 'next/server'
import { ObservationEngine } from '@/lib/agent/observations'
import { Reasoner } from '@/lib/agent/reasoner'
import { createAgentClient } from '@/lib/supabase/agent-client'
import { RiskEngine } from '@/lib/agent/risk'
import { Classifier } from '@/lib/agent/classifier'
import { CommunicationTools } from '@/lib/tools/communication'
import { EngineeringTools } from '@/lib/tools/engineering'

/**
 * Self-Healing Agent Loop
 * 
 * Implements the 7-step pipeline:
 * 1. OBSERVE - Fetch & cluster anomalies
 * 2. SYNTHESIZE - Attach context (Migration Stage, History)
 * 3. HYPOTHESIZE - Call Mistral API
 * 4. EVALUATE RISK - Apply scoring rules
 * 5. DECIDE - Classify & threshold check
 * 6. RECOMMEND/ACT - Route to appropriate tool
 * 7. LEARN - Log outcome
 */

export async function GET() {
    const supabase = createAgentClient()
    const runId = crypto.randomUUID()
    const startTime = Date.now()

    try {
        // ============================================
        // STEP 1: OBSERVE
        // Fetch & cluster unprocessed events into observations
        // ============================================
        const obsResult = await ObservationEngine.processNewEvents()
        await logStep(supabase, runId, 'observe', {
            processed: obsResult.processed,
            clusters: obsResult.clusters,
            timestamp: new Date().toISOString()
        })

        if (obsResult.processed === 0) {
            return NextResponse.json({
                status: 'idle',
                runId,
                message: 'No new events to process',
                durationMs: Date.now() - startTime
            })
        }

        // Fetch active observations that need analysis
        // Only fetch observations that don't have recent decisions
        const { data: activeObservations } = await supabase
            .from('observations')
            .select('*')
            .eq('status', 'active')
            .order('last_seen', { ascending: false })
            .limit(5)

        const results = {
            processed: obsResult.processed,
            analyzed: 0,
            decisions: 0,
            actions: 0,
            autoExecuted: 0
        }

        for (const rawObs of activeObservations || []) {
            // ============================================
            // STEP 2: SYNTHESIZE
            // Enrich observation with migration context and history
            // ============================================
            const obs = await ObservationEngine.synthesize(rawObs)
            await logStep(supabase, runId, 'synthesize', {
                obsId: obs.id,
                fingerprint: obs.fingerprint,
                migrationStage: obs.migration_stage,
                historicalPattern: obs.historical_pattern,
                timeSinceFirst: obs.time_since_first,
                merchantCount: obs.merchant_count
            })

            // ============================================
            // STEP 3: HYPOTHESIZE
            // Generate root cause hypotheses using Mistral AI
            // ============================================
            const aiResult = await Reasoner.generateHypotheses(obs)
            await logStep(supabase, runId, 'hypothesize', {
                obsId: obs.id,
                hypothesesCount: aiResult?.hypotheses?.length || 0,
                hasAI: !!aiResult
            })

            if (!aiResult?.hypotheses?.length) {
                // No hypotheses generated - log and continue
                await logStep(supabase, runId, 'skip', {
                    obsId: obs.id,
                    reason: 'No hypotheses generated'
                })
                continue
            }

            results.analyzed++

            // Process each hypothesis and find the highest risk one
            let highestRiskScore = 0
            let bestHypothesis: any = null
            let bestRiskAssessment: any = null

            for (const hypothesis of aiResult.hypotheses) {
                // Save hypothesis to database
                const { data: savedHypo, error: hypoError } = await supabase
                    .from('hypotheses')
                    .insert({
                        observation_id: obs.id,
                        cause: hypothesis.cause,
                        confidence: hypothesis.confidence,
                        assumptions: hypothesis.assumptions || []
                    })
                    .select()
                    .single()

                if (hypoError || !savedHypo) {
                    console.error('Hypothesis insert error:', hypoError)
                    continue
                }

                // ============================================
                // STEP 4: EVALUATE RISK
                // Apply scoring rules (+5 Checkout, x2 Multi-merchant)
                // ============================================
                const riskAssessment = RiskEngine.evaluate(obs, hypothesis)

                const { data: savedRisk, error: riskError } = await supabase
                    .from('risk_assessments')
                    .insert({
                        hypothesis_id: savedHypo.id,
                        score: riskAssessment.score,
                        factors: riskAssessment.factors
                    })
                    .select()
                    .single()

                if (riskError) {
                    console.error('Risk assessment insert error:', riskError)
                }

                await logStep(supabase, runId, 'evaluate_risk', {
                    hypoId: savedHypo.id,
                    score: riskAssessment.score,
                    factors: riskAssessment.factors,
                    reversibility: riskAssessment.reversibility,
                    urgency: riskAssessment.urgency
                })

                // Track highest risk hypothesis
                if (riskAssessment.score > highestRiskScore) {
                    highestRiskScore = riskAssessment.score
                    bestHypothesis = {
                        ...hypothesis,
                        dbId: savedHypo.id,
                        riskId: savedRisk?.id
                    }
                    bestRiskAssessment = riskAssessment
                }
            }

            if (!bestHypothesis || !bestRiskAssessment) {
                continue
            }

            // ============================================
            // STEP 5: DECIDE
            // Classify & threshold check (<0.6 Human, >0.9 Auto-Low-Risk)
            // ============================================
            const decision = Classifier.classify(obs, bestHypothesis, bestRiskAssessment)
            const requiresHumanApproval = RiskEngine.requiresHumanApproval(
                highestRiskScore,
                decision.confidence,
                decision.type
            )
            const canAutoExecute = RiskEngine.shouldAutoExecute(
                highestRiskScore,
                decision.confidence,
                decision.type
            )

            const { data: savedDecision, error: decisionError } = await supabase
                .from('decisions')
                .insert({
                    risk_id: bestHypothesis.riskId,
                    classification: decision.type,
                    confidence: decision.confidence
                })
                .select()
                .single()

            if (decisionError || !savedDecision) {
                console.error('Decision insert error:', decisionError)
                continue
            }

            results.decisions++

            await logStep(supabase, runId, 'decide', {
                decisionId: savedDecision.id,
                type: decision.type,
                confidence: decision.confidence,
                reasoning: decision.reasoning,
                requiresHumanApproval,
                canAutoExecute,
                risk: highestRiskScore
            })

            // ============================================
            // STEP 6: RECOMMEND/ACT
            // Route to appropriate tool based on classification
            // ============================================
            const actionResult = await executeAction(
                supabase,
                runId,
                obs,
                bestHypothesis,
                decision,
                savedDecision.id,
                highestRiskScore,
                requiresHumanApproval,
                canAutoExecute
            )

            results.actions++
            if (actionResult.autoExecuted) {
                results.autoExecuted++
            }

            // ============================================
            // STEP 7: LEARN
            // Log outcome and update observation status if resolved
            // ============================================
            await logStep(supabase, runId, 'learn', {
                obsId: obs.id,
                decisionId: savedDecision.id,
                outcome: actionResult.status,
                actionType: actionResult.actionType,
                autoExecuted: actionResult.autoExecuted,
                toolResult: actionResult.toolResult
            })

            // Update observation status if auto-executed
            if (actionResult.autoExecuted && actionResult.status === 'executed') {
                await supabase
                    .from('observations')
                    .update({ status: 'investigating' })
                    .eq('id', obs.id)
            }
        }

        return NextResponse.json({
            status: 'success',
            runId,
            results,
            durationMs: Date.now() - startTime
        })

    } catch (err: any) {
        console.error('Agent Loop Error:', err)

        await logStep(supabase, runId, 'error', {
            message: err.message,
            stack: err.stack
        })

        return NextResponse.json({
            status: 'error',
            runId,
            error: err.message,
            durationMs: Date.now() - startTime
        }, { status: 500 })
    }
}

/**
 * Execute the appropriate action based on classification
 */
async function executeAction(
    supabase: any,
    runId: string,
    obs: any,
    hypothesis: any,
    decision: any,
    decisionId: string,
    riskScore: number,
    requiresHumanApproval: boolean,
    canAutoExecute: boolean
) {
    let actionType = decision.suggestedAction
    let payload: any = {}
    let toolResult: any = null
    let status = 'pending'
    let autoExecuted = false

    // Build action payload based on classification
    switch (decision.type) {
        case 'platform_regression':
            actionType = 'create_engineering_incident'
            payload = {
                summary: `Platform Issue: ${obs.fingerprint}`,
                evidence: {
                    observationId: obs.id,
                    fingerprint: obs.fingerprint,
                    hypothesisCause: hypothesis.cause,
                    affectedMerchants: obs.affected_merchants
                },
                risk: riskScore
            }
            // Platform regressions always create incidents immediately
            toolResult = await EngineeringTools.createEngineeringIncident(
                payload.summary,
                payload.evidence,
                riskScore
            )
            status = 'executed'
            autoExecuted = true
            break

        case 'migration_error':
            actionType = 'email_engineering'
            payload = {
                subject: `Migration Alert: ${obs.fingerprint}`,
                body: `Hypothesis: ${hypothesis.cause}\n\nAffected merchants: ${obs.merchant_count}`,
                observationId: obs.id
            }
            // Email engineering for migration errors
            toolResult = await CommunicationTools.emailEngineering(
                payload.subject,
                payload.body,
                { risk: riskScore, observationId: obs.id, fingerprint: obs.fingerprint }
            )
            status = 'executed'
            autoExecuted = true
            break

        case 'documentation_gap':
            actionType = 'request_doc_update'
            payload = {
                section: obs.migration_stage || 'general',
                suggestion: hypothesis.cause,
                observationId: obs.id
            }
            // Create doc update request
            toolResult = await EngineeringTools.requestDocUpdate(
                payload.section,
                payload.suggestion,
                { observationId: obs.id, fingerprint: obs.fingerprint }
            )
            status = 'executed'
            autoExecuted = true
            break

        case 'merchant_misconfiguration':
        default:
            // Check if we can auto-send or need to draft
            if (canAutoExecute && !requiresHumanApproval) {
                actionType = 'send_support_response'
                payload = {
                    ticketId: obs.metadata?.ticket_id || 'UNKNOWN',
                    message: `Based on our analysis, this appears to be a configuration issue.\n\nLikely cause: ${hypothesis.cause}\n\nPlease verify your integration settings.`,
                    confidence: decision.confidence,
                    risk: riskScore
                }
                toolResult = await CommunicationTools.sendSupportResponse(
                    payload.ticketId,
                    payload.message,
                    { confidence: decision.confidence, risk: riskScore, observationId: obs.id }
                )
                status = toolResult.success ? 'executed' : 'failed'
                autoExecuted = toolResult.success
            } else {
                actionType = 'draft_ticket_reply'
                payload = {
                    ticketId: obs.metadata?.ticket_id || 'UNKNOWN',
                    message: `Likely cause: ${hypothesis.cause}`,
                    hypothesisCause: hypothesis.cause,
                    confidence: decision.confidence
                }
                toolResult = await CommunicationTools.draftTicketResponse(
                    payload.ticketId,
                    payload.message,
                    { confidence: decision.confidence, hypothesisCause: hypothesis.cause, observationId: obs.id }
                )
                status = requiresHumanApproval ? 'pending_approval' : 'pending'
            }
            break
    }

    // Save action proposal
    const { data: proposal, error: proposalError } = await supabase
        .from('action_proposals')
        .insert({
            decision_id: decisionId,
            action_type: actionType,
            payload,
            status
        })
        .select()
        .single()

    if (proposalError) {
        console.error('Proposal insert error:', proposalError)
    }

    await logStep(supabase, runId, 'recommend', {
        proposalId: proposal?.id,
        actionType,
        status,
        requiresHumanApproval,
        canAutoExecute,
        toolSuccess: toolResult?.success
    })

    if (autoExecuted) {
        await logStep(supabase, runId, 'act', {
            proposalId: proposal?.id,
            executed: true,
            tool: actionType,
            result: toolResult
        })
    }

    return {
        actionType,
        status,
        autoExecuted,
        toolResult,
        proposalId: proposal?.id
    }
}

/**
 * Log a step to the audit log
 */
async function logStep(supabase: any, runId: string, step: string, details: any) {
    const { error } = await supabase.from('audit_logs').insert({
        run_id: runId,
        step,
        details,
        agent_version: 'v1.1'
    })
    if (error) {
        console.error(`Audit Log Error (${step}):`, error)
    }
}
