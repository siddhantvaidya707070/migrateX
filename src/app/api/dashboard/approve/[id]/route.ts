/**
 * Action Approval API - /api/dashboard/approve/[id]
 * Handles human-in-the-loop approval/rejection of actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAgentClient } from '@/lib/supabase/agent-client'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createAgentClient()
    const { id: proposalId } = await params

    try {
        const body = await req.json()
        const decision = body.decision as 'approve' | 'reject'
        const notes = body.notes || ''

        if (!decision || !['approve', 'reject'].includes(decision)) {
            return NextResponse.json({
                error: 'Invalid decision. Must be "approve" or "reject"'
            }, { status: 400 })
        }

        // Get the proposal
        const { data: proposal, error: fetchErr } = await supabase
            .from('action_proposals')
            .select('*')
            .eq('id', proposalId)
            .single()

        if (fetchErr || !proposal) {
            return NextResponse.json({
                error: 'Proposal not found'
            }, { status: 404 })
        }

        // Update proposal status
        const newStatus = decision === 'approve' ? 'approved' : 'rejected'
        const { error: updateErr } = await supabase
            .from('action_proposals')
            .update({ status: newStatus })
            .eq('id', proposalId)

        if (updateErr) {
            throw new Error(`Update error: ${updateErr.message}`)
        }

        // Record the approval in human_approvals table
        const { error: approvalErr } = await supabase
            .from('human_approvals')
            .insert({
                proposal_id: proposalId,
                decision,
                notes
            })

        if (approvalErr) {
            console.error('Failed to record approval:', approvalErr)
        }

        // If approved, execute the action (mock execution)
        let executionResult = null
        if (decision === 'approve') {
            // Update status to executed
            await supabase
                .from('action_proposals')
                .update({ status: 'executed' })
                .eq('id', proposalId)

            executionResult = {
                executed: true,
                action_type: proposal.action_type,
                payload: proposal.payload,
                executed_at: new Date().toISOString()
            }
        }

        return NextResponse.json({
            success: true,
            proposal_id: proposalId,
            decision,
            notes,
            execution: executionResult,
            timestamp: new Date().toISOString()
        })

    } catch (err: any) {
        console.error('Approval error:', err)
        return NextResponse.json({
            error: 'Approval failed',
            details: err.message
        }, { status: 500 })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createAgentClient()
    const { id: proposalId } = await params

    try {
        const { data: proposal, error } = await supabase
            .from('action_proposals')
            .select(`
                *,
                decisions (
                    classification,
                    confidence,
                    risk_assessments (
                        score,
                        factors
                    )
                )
            `)
            .eq('id', proposalId)
            .single()

        if (error || !proposal) {
            return NextResponse.json({
                error: 'Proposal not found'
            }, { status: 404 })
        }

        return NextResponse.json(proposal)

    } catch (err: any) {
        return NextResponse.json({
            error: 'Failed to fetch proposal',
            details: err.message
        }, { status: 500 })
    }
}
