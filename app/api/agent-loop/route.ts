import { NextResponse } from 'next/server'
import { ObservationEngine as ObsEngine } from '@/lib/agent/observations'
import { Reasoner } from '@/lib/agent/reasoner'
import { createAgentClient } from '@/lib/supabase/agent-client'
import { RiskEngine } from '@/lib/agent/risk'
import { Classifier } from '@/lib/agent/classifier'
import { CommunicationTools } from '@/lib/tools/communication'

export async function GET() {
    // This is the CRON entry point
    const supabase = createAgentClient()
    const runId = crypto.randomUUID()

    try {
        // 1. Observe
        const obsResult = await ObsEngine.processNewEvents()
        await logStep(supabase, runId, 'observe', obsResult)

        if (obsResult.processed === 0) {
            return NextResponse.json({ status: 'idle', runId })
        }

        // 2. Synthesize & Hypothesize Loop
        // Fetch active observations that need analysis
        const { data: newObservations } = await supabase
            .from('observations')
            .select('*')
            .eq('status', 'active')
            // In a real app, only pick ones without recent hypotheses
            .limit(5)

        for (const obs of newObservations || []) {
            // 3. Hypothesize
            const aiResult = await Reasoner.generateHypotheses(obs)
            await logStep(supabase, runId, 'hypothesize', { obsId: obs.id, aiResult })

            if (aiResult?.hypotheses) {
                // Persist Hypotheses
                let highestRiskScore = 0
                let bestHypothesis: any = null

                for (const h of aiResult.hypotheses) {
                    const { data: savedHypo } = await supabase.from('hypotheses').insert({
                        observation_id: obs.id,
                        cause: h.cause,
                        confidence: h.confidence,
                        assumptions: h.assumptions
                    }).select().single()

                    // 4. Evaluate Risk (Per hypothesis)
                    if (savedHypo) {
                        const { score, factors } = RiskEngine.evaluate(obs, h)
                        const { data: savedRisk } = await supabase.from('risk_assessments').insert({
                            hypothesis_id: savedHypo.id,
                            score,
                            factors: JSON.stringify(factors)
                        }).select().single()

                        await logStep(supabase, runId, 'evaluate_risk', { hypoId: savedHypo.id, score, factors })

                        if (score > highestRiskScore) {
                            highestRiskScore = score
                            bestHypothesis = { ...h, dbId: savedHypo.id, riskId: savedRisk?.id }
                        }
                    }
                }

                // 5. Decide (Based on best hypothesis)
                if (bestHypothesis) {
                    const { type, confidence } = Classifier.classify(obs, bestHypothesis, highestRiskScore)
                    const { data: decision } = await supabase.from('decisions').insert({
                        risk_id: bestHypothesis.riskId,
                        classification: type,
                        confidence
                    }).select().single()

                    await logStep(supabase, runId, 'decide', { type, confidence, risk: highestRiskScore })

                    // 6. Recommend / Act (Create Proposal)
                    let actionType = 'draft_ticket_reply'
                    let payload: any = { ticket_id: 'unknown', msg: `Likely cause: ${bestHypothesis.cause}` }

                    if (type === 'platform_regression') {
                        actionType = 'email_engineering'
                        payload = { subject: `CRITICAL: ${obs.fingerprint}`, body: JSON.stringify(bestHypothesis) }
                    } else if (type === 'documentation_gap') {
                        actionType = 'update_docs'
                        payload = { section: 'checkout', suggestion: bestHypothesis.cause }
                    }

                    // Create Proposal
                    const { data: proposal } = await supabase.from('action_proposals').insert({
                        decision_id: decision.id,
                        action_type: actionType,
                        payload,
                        status: 'pending'
                    }).select().single()

                    await logStep(supabase, runId, 'recommend', { proposalId: proposal.id, type: actionType })

                    // Auto-Execute (If Low Risk & High Confidence)
                    if (highestRiskScore < 4 && confidence > 0.8 && type === 'merchant_misconfiguration') {
                        // Simulate Auto-Act
                        await CommunicationTools.draftTicketResponse('T-123', payload.msg, {})
                        await supabase.from('action_proposals').update({ status: 'executed' }).eq('id', proposal.id)
                        await logStep(supabase, runId, 'act', { executed: true, tool: actionType })
                    }
                }
            }
        }

        return NextResponse.json({ status: 'success', runId, processed: obsResult.processed })

    } catch (err: any) {
        console.error("Agent Loop Error:", err)
        return NextResponse.json({ error: 'Agent Failed', details: err.message, stack: err.stack }, { status: 200 })
    }
}

async function logStep(supabase: any, runId: string, step: string, details: any) {
    const { error } = await supabase.from('audit_logs').insert({
        run_id: runId,
        step,
        details
    })
    if (error) console.error(`Audit Log Error (${step}):`, error)
}
