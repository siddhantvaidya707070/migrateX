/**
 * End-to-End Dashboard Test
 * 
 * Tests the full flow:
 * 1. Trigger simulation via dashboard API
 * 2. Verify events are created
 * 3. Verify agent loop processed them
 * 4. Verify stats and activity are populated
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
}

async function runE2ETest() {
    console.log('\n' + '='.repeat(60));
    console.log('  END-TO-END DASHBOARD TEST');
    console.log('='.repeat(60) + '\n');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Step 1: Get initial stats
    console.log('1. INITIAL STATE');
    console.log('-'.repeat(40));

    const { data: initialStats } = await makeRequest('/api/dashboard/stats');
    console.log(`   Events: ${initialStats.events?.total || 0}`);
    console.log(`   Observations: ${initialStats.observations?.total || 0}`);
    console.log(`   Decisions: ${initialStats.decisions?.total || 0}`);
    console.log(`   Actions: ${initialStats.actions?.executed || 0} executed, ${initialStats.actions?.pending || 0} pending`);
    console.log();

    // Step 2: Trigger simulation
    console.log('2. TRIGGERING SIMULATION');
    console.log('-'.repeat(40));

    const simConfig = {
        scenario: 'checkout_failure',
        risk_profile: 'high',
        event_count: 15,
        merchant_count: 3,
        timing: 'burst',
        auto_trigger_agent: true
    };

    console.log(`   Config: ${JSON.stringify(simConfig)}`);

    const { status: simStatus, data: simResult } = await makeRequest('/api/dashboard/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simConfig)
    });

    if (simStatus !== 200 || !simResult.success) {
        console.log(`   ❌ Simulation FAILED: ${simResult.error || 'Unknown error'}`);
        return;
    }

    console.log(`   ✅ Simulation SUCCESS`);
    console.log(`   Run ID: ${simResult.simulation.run_id}`);
    console.log(`   Events generated: ${simResult.simulation.events_generated}`);
    console.log(`   Merchants affected: ${simResult.simulation.merchants_affected}`);
    console.log();

    // Step 3: Verify agent loop ran
    console.log('3. AGENT LOOP RESULTS');
    console.log('-'.repeat(40));

    if (simResult.agent_loop) {
        console.log(`   Observations processed: ${simResult.agent_loop.observations_processed || 'N/A'}`);
        console.log(`   Run ID: ${simResult.agent_loop.run_id || 'N/A'}`);

        // Check stages
        const stages = simResult.agent_loop.stages || [];
        console.log(`   Stages completed: ${stages.length}`);
        stages.forEach((s: any) => {
            console.log(`     - ${s.step}: ${s.status || 'done'}`);
        });
    } else {
        console.log(`   ⚠️ Agent loop data not returned`);
    }
    console.log();

    // Step 4: Get final stats
    console.log('4. FINAL STATE');
    console.log('-'.repeat(40));

    const { data: finalStats } = await makeRequest('/api/dashboard/stats');
    console.log(`   Events: ${finalStats.events?.total || 0} (+${(finalStats.events?.total || 0) - (initialStats.events?.total || 0)} new)`);
    console.log(`   Observations: ${finalStats.observations?.total || 0} (+${(finalStats.observations?.total || 0) - (initialStats.observations?.total || 0)} new)`);
    console.log(`   Decisions: ${finalStats.decisions?.total || 0} (+${(finalStats.decisions?.total || 0) - (initialStats.decisions?.total || 0)} new)`);
    console.log(`   High Risk: ${finalStats.risk_distribution?.high || 0}`);
    console.log(`   Actions: ${finalStats.actions?.executed || 0} executed, ${finalStats.actions?.pending || 0} pending`);
    console.log();

    // Step 5: Check activity feed
    console.log('5. ACTIVITY FEED');
    console.log('-'.repeat(40));

    const { data: activity } = await makeRequest(`/api/dashboard/activity?run_id=${simResult.simulation.run_id}&limit=10`);
    console.log(`   Activities: ${activity.activities?.length || 0}`);
    console.log(`   Recent observations: ${activity.observations?.length || 0}`);
    console.log(`   Recent decisions: ${activity.decisions?.length || 0}`);
    console.log(`   Pending actions: ${activity.actions?.filter((a: any) => a.status === 'pending' || a.status === 'pending_approval').length || 0}`);
    console.log();

    // Step 6: Database verification
    console.log('6. DATABASE VERIFICATION');
    console.log('-'.repeat(40));

    // Check raw_events
    const { count: eventCount } = await supabase
        .from('raw_events')
        .select('*', { count: 'exact', head: true })
        .eq('simulation_run_id', simResult.simulation.run_id);
    console.log(`   Events with this run_id: ${eventCount}`);

    // Check observations
    const { data: obs } = await supabase
        .from('observations')
        .select('id, fingerprint, summary, merchant_count, status')
        .order('last_seen', { ascending: false })
        .limit(3);
    console.log(`   Recent observations:`);
    obs?.forEach((o: any) => {
        console.log(`     - ${o.fingerprint?.slice(0, 30)}... (${o.merchant_count} merchants, ${o.status})`);
    });

    // Check decisions
    const { data: decisions } = await supabase
        .from('decisions')
        .select('id, classification, confidence')
        .order('created_at', { ascending: false })
        .limit(3);
    console.log(`   Recent decisions:`);
    decisions?.forEach((d: any) => {
        console.log(`     - ${d.classification} (${Math.round(d.confidence * 100)}% confidence)`);
    });

    // Check audit logs
    const { data: logs } = await supabase
        .from('audit_logs')
        .select('id, step, run_id')
        .eq('run_id', simResult.agent_loop?.run_id || '')
        .order('created_at', { ascending: true });
    console.log(`   Audit logs for this run: ${logs?.length || 0}`);
    logs?.forEach((l: any) => {
        console.log(`     - ${l.step}`);
    });

    console.log();
    console.log('='.repeat(60));
    console.log('  TEST COMPLETE');
    console.log('='.repeat(60));
}

runE2ETest().catch(console.error);
