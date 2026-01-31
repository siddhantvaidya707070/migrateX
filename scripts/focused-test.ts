/**
 * Focused Test Results - Stage 1-4 Analysis
 */

import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function focusedTest() {
    const supabase = createAgentClient();

    // Get counts
    const { count: rawCount } = await supabase.from('raw_events').select('*', { count: 'exact', head: true });
    const { count: obsCount } = await supabase.from('observations').select('*', { count: 'exact', head: true });
    const { count: hypoCount } = await supabase.from('hypotheses').select('*', { count: 'exact', head: true });
    const { count: riskCount } = await supabase.from('risk_assessments').select('*', { count: 'exact', head: true });
    const { count: decCount } = await supabase.from('decisions').select('*', { count: 'exact', head: true });
    const { count: actCount } = await supabase.from('action_proposals').select('*', { count: 'exact', head: true });
    const { count: logCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true });

    console.log('\n=== TABLE COUNTS ===');
    console.log(`raw_events: ${rawCount}`);
    console.log(`observations: ${obsCount}`);
    console.log(`hypotheses: ${hypoCount}`);
    console.log(`risk_assessments: ${riskCount}`);
    console.log(`decisions: ${decCount}`);
    console.log(`action_proposals: ${actCount}`);
    console.log(`audit_logs: ${logCount}`);

    // Get observations detail
    const { data: observations } = await supabase.from('observations').select('id, fingerprint, merchant_count, status').order('last_seen', { ascending: false });
    console.log('\n=== OBSERVATIONS ===');
    for (const obs of observations || []) {
        console.log(`  [${obs.status}] ${obs.fingerprint} (${obs.merchant_count} merchants)`);
    }

    // Get risk scores
    const { data: risks } = await supabase.from('risk_assessments').select('score, factors').order('created_at', { ascending: false });
    console.log('\n=== RISK SCORES ===');
    for (const r of risks || []) {
        console.log(`  Score: ${r.score}/10 | Factors: ${JSON.stringify(r.factors)}`);
    }

    // Get decisions
    const { data: decisions } = await supabase.from('decisions').select('classification, confidence').order('created_at', { ascending: false });
    console.log('\n=== CLASSIFICATIONS ===');
    for (const d of decisions || []) {
        console.log(`  ${d.classification} (${(d.confidence * 100).toFixed(0)}% confidence)`);
    }

    // Get actions
    const { data: actions } = await supabase.from('action_proposals').select('action_type, status').order('created_at', { ascending: false });
    console.log('\n=== ACTIONS ===');
    for (const a of actions || []) {
        console.log(`  ${a.action_type} -> ${a.status}`);
    }

    // Get audit log steps
    const { data: logs } = await supabase.from('audit_logs').select('step, run_id').order('created_at', { ascending: false }).limit(30);
    const steps: Record<string, number> = {};
    for (const l of logs || []) {
        steps[l.step] = (steps[l.step] || 0) + 1;
    }
    console.log('\n=== AUDIT LOG STEPS ===');
    for (const [step, count] of Object.entries(steps)) {
        console.log(`  ${step}: ${count}`);
    }

    console.log('\n=== DONE ===');
}

focusedTest().catch(console.error);
