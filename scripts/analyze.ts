import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function analyze() {
    const s = createAgentClient();

    // Count simulation vs legacy events
    const { count: simCount } = await s.from('raw_events').select('*', { count: 'exact', head: true }).eq('source_origin', 'simulation');
    const { count: legacyCount } = await s.from('raw_events').select('*', { count: 'exact', head: true }).neq('source_origin', 'simulation');

    console.log('========================================');
    console.log('       COMPREHENSIVE TEST RESULTS       ');
    console.log('========================================');
    console.log();
    console.log('--- RAW EVENTS ---');
    console.log(`Simulation events: ${simCount}`);
    console.log(`Legacy events: ${legacyCount}`);

    // Get unique fingerprints from simulation
    const { data: fps } = await s.from('raw_events').select('fingerprint, event_type').eq('source_origin', 'simulation');
    const fpCounts: Record<string, number> = {};
    for (const f of fps || []) {
        fpCounts[f.fingerprint] = (fpCounts[f.fingerprint] || 0) + 1;
    }
    console.log('\nSimulation Fingerprints:');
    for (const [fp, count] of Object.entries(fpCounts)) {
        console.log(`  ${fp}: ${count} events`);
    }

    // Get risk score distribution
    const { data: risks } = await s.from('risk_assessments').select('score');
    const scores = (risks || []).map(r => r.score);
    const high = scores.filter(s => s >= 7).length;
    const med = scores.filter(s => s >= 4 && s < 7).length;
    const low = scores.filter(s => s < 4).length;

    console.log('\n--- RISK DISTRIBUTION ---');
    console.log(`High (7-10): ${high}`);
    console.log(`Medium (4-6): ${med}`);
    console.log(`Low (1-3): ${low}`);

    // Get classification summary
    const { data: decs } = await s.from('decisions').select('classification, confidence');
    const clsCounts: Record<string, number> = {};
    for (const d of decs || []) {
        clsCounts[d.classification] = (clsCounts[d.classification] || 0) + 1;
    }

    console.log('\n--- CLASSIFICATIONS ---');
    for (const [c, n] of Object.entries(clsCounts)) {
        console.log(`${c}: ${n}`);
    }

    // Get action summary
    const { data: acts } = await s.from('action_proposals').select('action_type, status');
    const actSummary: Record<string, number> = {};
    for (const a of acts || []) {
        const key = `${a.action_type} [${a.status}]`;
        actSummary[key] = (actSummary[key] || 0) + 1;
    }

    console.log('\n--- ACTIONS TAKEN ---');
    for (const [k, n] of Object.entries(actSummary)) {
        console.log(`${k}: ${n}`);
    }

    // Get audit log summary
    const { data: logs } = await s.from('audit_logs').select('step, run_id');
    const runIds = new Set((logs || []).map(l => l.run_id).filter(Boolean));
    const stepCounts: Record<string, number> = {};
    for (const l of logs || []) {
        stepCounts[l.step] = (stepCounts[l.step] || 0) + 1;
    }

    console.log('\n--- AGENT PIPELINE STEPS ---');
    console.log(`Total agent runs: ${runIds.size}`);
    for (const [step, count] of Object.entries(stepCounts)) {
        console.log(`  ${step}: ${count}`);
    }

    // Get observations
    const { data: observations } = await s.from('observations').select('*');
    console.log('\n--- OBSERVATIONS ---');
    for (const o of observations || []) {
        console.log(`[${o.status}] ${o.fingerprint} - ${o.merchant_count} merchant(s)`);
    }

    console.log('\n========================================');
    console.log('              SUMMARY                   ');
    console.log('========================================');
    console.log(`✅ ${simCount} simulation events ingested`);
    console.log(`✅ ${observations?.length || 0} observations created (clustered patterns)`);
    console.log(`✅ ${risks?.length || 0} risk assessments (${high} high, ${med} med, ${low} low)`);
    console.log(`✅ ${decs?.length || 0} decisions made`);
    console.log(`✅ ${acts?.length || 0} actions proposed`);
    console.log(`✅ ${runIds.size} agent pipeline runs completed`);
    console.log();
}

analyze().catch(console.error);
