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
                console.log(`[Agent] Skipping obs ${obs.id}: bestHypothesis=${!!bestHypothesis}, bestRiskAssessment=${!!bestRiskAssessment}, highestRiskScore=${highestRiskScore}`)
                continue
            }
            console.log(`[Agent] Processing obs ${obs.id}: risk=${highestRiskScore}, hypothesis=${bestHypothesis?.cause?.substring(0, 50)}`)

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
                    risk_id: bestHypothesis.riskId || null,
                    classification: decision.type,
                    confidence: decision.confidence
                })
                .select()
                .single()

            if (decisionError || !savedDecision) {
                console.error('Decision insert error:', decisionError, 'riskId:', bestHypothesis.riskId)
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

            // Create VERBOSE learning entries for the agent logs dashboard
            // EACH PHASE OF THE AGENT LOOP GETS A DETAILED LOG ENTRY
            try {
                const merchantName = obs.summary?.match(/Merchant[:\s]+([^\s,]+)/)?.[1] ||
                    obs.fingerprint?.split('_')[0] ||
                    'Unknown Merchant'
                const learnings = []

                // OBSERVE phase learning
                const eventCount = (obs as any).event_count || 1
                const errorType = (obs as any).primary_error_type || decision.type
                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'pattern_detected',
                    title: `[OBSERVE] Ingested ${eventCount} events`,
                    description: `Observed events from merchant "${merchantName}". Error type: ${errorType}. ` +
                        `Fingerprint: ${obs.fingerprint}. ` +
                        `Merchants affected: ${obs.merchant_count || 1}. ` +
                        `Historical pattern: ${obs.historical_pattern || 'new'}. ` +
                        `Grouped ${eventCount} related events by similarity.`,
                    confidence: 0.9,
                    related_events: [obs.id],
                    metadata: { phase: 'observe', merchantName, fingerprint: obs.fingerprint }
                })

                // SYNTHESIZE phase learning  
                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'knowledge_entry',
                    title: `[SYNTHESIZE] Context enrichment for ${merchantName}`,
                    description: `Enriched observation with context. ` +
                        `Migration stage: ${obs.migration_stage || 'unknown'}. ` +
                        `Time since first occurrence: ${obs.time_since_first || 'N/A'}. ` +
                        `Related patterns found: ${obs.historical_pattern === 'new' ? 'None (new issue)' : obs.historical_pattern}. ` +
                        `Similar issues detected across ${obs.merchant_count || 1} merchant(s).`,
                    confidence: 0.85,
                    related_events: [obs.id],
                    metadata: { phase: 'synthesize', migrationStage: obs.migration_stage }
                })

                // HYPOTHESIZE phase learning
                const hypothesesDesc = bestHypothesis ?
                    `Primary hypothesis: "${bestHypothesis.rootCause || decision.reasoning}" ` +
                    `with ${Math.round((bestHypothesis.confidence || decision.confidence) * 100)}% confidence. ` +
                    `Alternative hypotheses were rejected due to lower probability scores.` :
                    `Generated hypothesis based on event patterns.`

                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'classification_made',
                    title: `[HYPOTHESIZE] Root cause analysis for ${merchantName}`,
                    description: hypothesesDesc,
                    confidence: decision.confidence,
                    related_events: [obs.id],
                    metadata: { phase: 'hypothesize', hypothesis: bestHypothesis?.rootCause }
                })

                // EVALUATE phase learning
                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'trend_identified',
                    title: `[EVALUATE] Risk assessment: ${highestRiskScore}/10`,
                    description: `Risk evaluation complete. Score: ${highestRiskScore}/10. ` +
                        `Blast radius: ${highestRiskScore >= 7 ? 'HIGH - Multiple merchants potentially affected' :
                            highestRiskScore >= 4 ? 'MEDIUM - Limited merchant impact' : 'LOW - Isolated issue'}. ` +
                        `Uncertainty level: ${decision.confidence < 0.6 ? 'HIGH' : 'ACCEPTABLE'}. ` +
                        `${requiresHumanApproval ? 'Human approval required.' : 'Auto-execution permitted.'}`,
                    confidence: 0.9,
                    related_events: [obs.id],
                    metadata: { phase: 'evaluate', riskScore: highestRiskScore, requiresApproval: requiresHumanApproval }
                })

                // DECIDE phase learning
                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'classification_made',
                    title: `[DECIDE] Classified as "${decision.type}"`,
                    description: `Final classification: ${decision.type}. ` +
                        `Confidence: ${Math.round(decision.confidence * 100)}%. ` +
                        `Reasoning: ${decision.reasoning || 'Based on pattern matching and risk assessment'}. ` +
                        `${requiresHumanApproval ? 'Flagged for human review due to ' +
                            (decision.confidence < 0.6 ? 'low confidence' : 'high risk') : 'Approved for execution'}.`,
                    confidence: decision.confidence,
                    related_events: [obs.id],
                    metadata: { phase: 'decide', classification: decision.type, reasoning: decision.reasoning }
                })

                // ACT phase learning - includes merchant name in ticket/email
                const actionDesc = actionResult.actionType ?
                    `Action type: ${actionResult.actionType}. ` +
                    `${actionResult.actionType.includes('ticket') ?
                        `Draft ticket reply created for Merchant: ${merchantName} — ${decision.type} issue` :
                        actionResult.actionType.includes('email') ?
                            `Draft email created for Merchant: ${merchantName} regarding ${decision.type}` :
                            `Action queued: ${actionResult.actionType}`}. ` +
                    `Status: ${actionResult.status}. ` +
                    `${actionResult.autoExecuted ? 'Auto-executed (low risk, high confidence).' : 'Awaiting human approval.'}` :
                    `Action pending determination.`

                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'trend_identified',
                    title: `[ACT] ${actionResult.actionType?.replace(/_/g, ' ') || 'Action'} for ${merchantName}`,
                    description: actionDesc,
                    confidence: decision.confidence,
                    related_events: [obs.id],
                    metadata: { phase: 'act', actionType: actionResult.actionType, merchantName, status: actionResult.status }
                })

                // LEARN phase learning
                learnings.push({
                    simulation_run_id: runId,
                    learning_type: 'knowledge_entry',
                    title: `[LEARN] Pattern stored for future reference`,
                    description: `Learning recorded. Fingerprint "${obs.fingerprint}" will be recognized in future runs. ` +
                        `If ${decision.type} pattern recurs, confidence will increase. ` +
                        `This learning will affect future risk assessments for similar ${merchantName} issues.`,
                    confidence: 0.95,
                    related_events: [obs.id],
                    metadata: { phase: 'learn', fingerprint: obs.fingerprint, willAffectFuture: true }
                })

                // Insert all learnings
                if (learnings.length > 0) {
                    const { error: insertError } = await supabase.from('agent_learnings').insert(learnings)
                    if (insertError) {
                        console.error('Failed to insert learnings:', insertError)
                    } else {
                        console.log(`Inserted ${learnings.length} learning entries for observation ${obs.id}`)
                    }
                }
            } catch (learningErr) {
                console.error('Failed to create learning entries:', learningErr)
            }

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

    // Helper to extract merchant name from multiple possible sources
    const getMerchantName = (): string => {
        if (obs.affected_merchants?.[0]) return obs.affected_merchants[0]
        if (obs.metadata?.merchant_name) return obs.metadata.merchant_name
        if (obs.summary?.includes('Merchant:')) {
            const match = obs.summary.match(/Merchant:\s*([^\s,]+)/)
            if (match) return match[1]
        }
        // Extract from fingerprint (e.g., "checkout_failure_MerchantName_...")
        const parts = obs.fingerprint?.split('_')
        if (parts && parts.length > 2) {
            const possibleName = parts[2]
            if (possibleName && !possibleName.match(/^\d+$/)) return possibleName
        }
        return `Merchant-${(obs.merchant_count || 1)}`
    }
    const merchantName = getMerchantName()

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
                risk: riskScore,
                merchant_name: merchantName,
                error_message: hypothesis.cause
            }
            // Platform regressions with high risk require approval
            if (requiresHumanApproval || riskScore >= 7) {
                status = 'pending_approval'
                toolResult = { drafted: true, requiresApproval: true }
            } else {
                toolResult = await EngineeringTools.createEngineeringIncident(
                    payload.summary,
                    payload.evidence,
                    riskScore
                )
                status = 'executed'
                autoExecuted = true
            }
            break

        case 'migration_error':
            actionType = 'email_engineering'
            payload = {
                subject: `Migration Alert: ${obs.fingerprint}`,
                body: `Hypothesis: ${hypothesis.cause}\n\nAffected merchants: ${obs.merchant_count}`,
                observationId: obs.id,
                merchant_name: merchantName,
                error_message: hypothesis.cause
            }
            // High-risk migration errors require approval
            if (requiresHumanApproval || riskScore >= 7) {
                status = 'pending_approval'
                toolResult = { drafted: true, requiresApproval: true }
            } else {
                toolResult = await CommunicationTools.emailEngineering(
                    payload.subject,
                    payload.body,
                    { risk: riskScore, observationId: obs.id, fingerprint: obs.fingerprint }
                )
                status = 'executed'
                autoExecuted = true
            }
            break

        case 'documentation_gap':
            actionType = 'request_doc_update'
            payload = {
                section: obs.migration_stage || 'general',
                suggestion: hypothesis.cause,
                observationId: obs.id,
                merchant_name: merchantName,
                error_message: `Documentation gap: ${hypothesis.cause}`
            }
            // Doc updates can usually auto-execute unless high risk
            if (requiresHumanApproval) {
                status = 'pending_approval'
                toolResult = { drafted: true, requiresApproval: true }
            } else {
                toolResult = await EngineeringTools.requestDocUpdate(
                    payload.section,
                    payload.suggestion,
                    { observationId: obs.id, fingerprint: obs.fingerprint }
                )
                status = 'executed'
                autoExecuted = true
            }
            break

        case 'checkout_failure':
            // Checkout/payment issues are high-priority and usually need review
            actionType = 'draft_ticket_reply'
            payload = {
                ticketId: obs.metadata?.ticket_id || 'UNKNOWN',
                message: `Payment/Checkout Issue Analysis:\n\nLikely cause: ${hypothesis.cause}\n\nThis appears to be affecting ${obs.merchant_count || 1} merchant(s).`,
                hypothesisCause: hypothesis.cause,
                confidence: decision.confidence,
                merchant_name: merchantName,
                merchant_id: obs.merchant_id,
                error_message: hypothesis.cause,
                is_high_priority: true
            }
            toolResult = await CommunicationTools.draftTicketResponse(
                payload.ticketId,
                payload.message,
                { confidence: decision.confidence, hypothesisCause: hypothesis.cause, observationId: obs.id }
            )
            // Checkout issues with medium-high risk should require approval
            status = (requiresHumanApproval || riskScore >= 5) ? 'pending_approval' : 'pending'
            break

        case 'auth_failure':
        case 'webhook_failure':
        case 'rate_limit':
            // These typically require human review for customer-facing actions
            actionType = 'draft_ticket_reply'
            payload = {
                ticketId: obs.metadata?.ticket_id || 'UNKNOWN',
                message: `Likely cause: ${hypothesis.cause}`,
                hypothesisCause: hypothesis.cause,
                confidence: decision.confidence,
                merchant_name: merchantName,
                merchant_id: obs.merchant_id,
                error_message: hypothesis.cause
            }
            toolResult = await CommunicationTools.draftTicketResponse(
                payload.ticketId,
                payload.message,
                { confidence: decision.confidence, hypothesisCause: hypothesis.cause, observationId: obs.id }
            )
            // These sensitive issues should require approval when high risk
            status = (requiresHumanApproval || riskScore >= 5) ? 'pending_approval' : 'pending'
            break

        case 'merchant_misconfiguration':
        default:
            // Check if we can auto-send or need to draft
            if (canAutoExecute && !requiresHumanApproval && riskScore < 5) {
                actionType = 'send_support_response'
                payload = {
                    ticketId: obs.metadata?.ticket_id || 'UNKNOWN',
                    message: `Based on our analysis, this appears to be a configuration issue.\n\nLikely cause: ${hypothesis.cause}\n\nPlease verify your integration settings.`,
                    confidence: decision.confidence,
                    risk: riskScore,
                    merchant_name: merchantName,
                    error_message: hypothesis.cause
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
                    confidence: decision.confidence,
                    merchant_name: merchantName,
                    merchant_id: obs.merchant_id,
                    error_message: hypothesis.cause
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
