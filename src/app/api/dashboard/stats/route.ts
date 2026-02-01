/**
 * Dashboard Stats API - /api/dashboard/stats
 * Returns real-time statistics computed from database
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL DASHBOARD COUNTERS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAgentClient } from '@/lib/supabase/agent-client'

export async function GET(req: NextRequest) {
    const supabase = createAgentClient()
    const runId = req.nextUrl.searchParams.get('run_id')

    try {
        // ALL COUNTS COME FROM DATABASE - NO CACHING, NO MOCKING

        // 1. Events ingested (total raw_events for this run or all)
        let eventsQuery = supabase
            .from('raw_events')
            .select('id', { count: 'exact', head: true })

        if (runId) {
            eventsQuery = eventsQuery.eq('simulation_run_id', runId)
        }

        const { count: eventsIngested } = await eventsQuery

        // 2. Observations count
        const { count: observations } = await supabase
            .from('observations')
            .select('id', { count: 'exact', head: true })

        // 3. Total decisions
        const { count: decisions } = await supabase
            .from('decisions')
            .select('id', { count: 'exact', head: true })

        // 4. Learnings count
        let learningsQuery = supabase
            .from('agent_learnings')
            .select('id', { count: 'exact', head: true })

        if (runId) {
            learningsQuery = learningsQuery.eq('simulation_run_id', runId)
        }

        let learningsCount = 0
        try {
            const { count } = await learningsQuery
            learningsCount = count || 0
        } catch (e) {
            // Table may not exist yet
            console.log('agent_learnings table may not exist yet')
        }

        // 5. Tickets drafted (action_proposals with action_type containing 'ticket')
        const { count: ticketsDrafted } = await supabase
            .from('action_proposals')
            .select('id', { count: 'exact', head: true })
            .ilike('action_type', '%ticket%')

        // 6. Emails drafted (action_proposals with action_type containing 'email')
        const { count: emailsDrafted } = await supabase
            .from('action_proposals')
            .select('id', { count: 'exact', head: true })
            .ilike('action_type', '%email%')

        // 7. Pending approvals
        const { count: pendingApprovals } = await supabase
            .from('action_proposals')
            .select('id', { count: 'exact', head: true })
            .in('status', ['pending', 'pending_approval'])

        // Return all stats - EVERY NUMBER IS FROM DATABASE
        return NextResponse.json({
            eventsIngested: eventsIngested || 0,
            observations: observations || 0,
            decisions: decisions || 0,
            learningsCount: learningsCount || 0,
            ticketsDrafted: ticketsDrafted || 0,
            emailsDrafted: emailsDrafted || 0,
            pendingApprovals: pendingApprovals || 0,
            runId,
            timestamp: new Date().toISOString()
        })

    } catch (err: any) {
        console.error('Stats API error:', err)
        return NextResponse.json({
            error: 'Failed to fetch stats',
            details: err.message,
            eventsIngested: 0,
            observations: 0,
            decisions: 0,
            learningsCount: 0,
            ticketsDrafted: 0,
            emailsDrafted: 0,
            pendingApprovals: 0
        }, { status: 500 })
    }
}
