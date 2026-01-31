/**
 * Comprehensive Test Script
 * Analyzes all data from Stage 1 through Stage 4
 */

import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function comprehensiveTest() {
    const supabase = createAgentClient();

    console.log('='.repeat(70));
    console.log('    COMPREHENSIVE END-TO-END TEST RESULTS');
    console.log('    Self-Healing Support Agent - Stages 1-4');
    console.log('='.repeat(70));
    console.log();

    // ============================================
    // STAGE 1: Foundation & State
    // ============================================
    console.log('📦 STAGE 1: FOUNDATION & STATE');
    console.log('-'.repeat(50));

    const tables = ['raw_events', 'observations', 'hypotheses', 'risk_assessments', 'decisions', 'action_proposals', 'audit_logs', 'human_approvals'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`  ❌ ${table}: ERROR - ${error.message}`);
        } else {
            console.log(`  ✅ ${table}: ${count} records`);
        }
    }
    console.log();

    // ============================================
    // STAGE 4: Raw Events Analysis
    // ============================================
    console.log('📥 STAGE 4: RAW EVENTS ANALYSIS');
    console.log('-'.repeat(50));

    const { data: rawEvents } = await supabase
        .from('raw_events')
        .select('*')
        .order('created_at', { ascending: false });

    // Count by event type
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byFingerprint: Record<string, number> = {};
    const merchants = new Set<string>();

    for (const event of rawEvents || []) {
        byType[event.event_type || 'unknown'] = (byType[event.event_type || 'unknown'] || 0) + 1;
        bySource[event.source_origin || 'unknown'] = (bySource[event.source_origin || 'unknown'] || 0) + 1;
        byFingerprint[event.fingerprint || 'none'] = (byFingerprint[event.fingerprint || 'none'] || 0) + 1;
        if (event.merchant_id) merchants.add(event.merchant_id);
    }

    console.log('  By Event Type:');
    for (const [type, count] of Object.entries(byType)) {
        console.log(`    - ${type}: ${count}`);
    }
    console.log('  By Source Origin:');
    for (const [source, count] of Object.entries(bySource)) {
        console.log(`    - ${source}: ${count}`);
    }
    console.log(`  Unique Merchants: ${merchants.size}`);
    console.log('  Fingerprints:');
    for (const [fp, count] of Object.entries(byFingerprint)) {
        console.log(`    - ${fp}: ${count} events`);
    }
    console.log();

    // ============================================
    // OBSERVATIONS
    // ============================================
    console.log('👁️ OBSERVATIONS (Clustered Patterns)');
    console.log('-'.repeat(50));

    const { data: observations } = await supabase
        .from('observations')
        .select('*')
        .order('last_seen', { ascending: false });

    for (const obs of observations || []) {
        console.log(`  📌 ${obs.fingerprint}`);
        console.log(`     ID: ${obs.id}`);
        console.log(`     Summary: ${obs.summary?.substring(0, 60) || 'N/A'}...`);
        console.log(`     Merchant Count: ${obs.merchant_count}`);
        console.log(`     Status: ${obs.status}`);
        console.log(`     First Seen: ${obs.first_seen}`);
        console.log(`     Last Seen: ${obs.last_seen}`);
        console.log();
    }

    // ============================================
    // HYPOTHESES
    // ============================================
    console.log('🧠 HYPOTHESES (AI-Generated Root Causes)');
    console.log('-'.repeat(50));

    const { data: hypotheses } = await supabase
        .from('hypotheses')
        .select('*, observations(*)')
        .order('created_at', { ascending: false })
        .limit(10);

    for (const hypo of hypotheses || []) {
        console.log(`  💡 Hypothesis: ${hypo.cause?.substring(0, 70)}...`);
        console.log(`     Confidence: ${(hypo.confidence * 100).toFixed(1)}%`);
        console.log(`     For Observation: ${hypo.observation_id}`);
        console.log();
    }

    // ============================================
    // RISK ASSESSMENTS
    // ============================================
    console.log('⚠️ RISK ASSESSMENTS');
    console.log('-'.repeat(50));

    const { data: risks } = await supabase
        .from('risk_assessments')
        .select('*, hypotheses(*)')
        .order('created_at', { ascending: false })
        .limit(10);

    for (const risk of risks || []) {
        console.log(`  🎯 Risk Score: ${risk.score}/10`);
        console.log(`     Factors: ${JSON.stringify(risk.factors)}`);
        console.log(`     Hypothesis ID: ${risk.hypothesis_id}`);
        console.log();
    }

    // ============================================
    // DECISIONS
    // ============================================
    console.log('✅ DECISIONS (Classifications)');
    console.log('-'.repeat(50));

    const { data: decisions } = await supabase
        .from('decisions')
        .select('*, risk_assessments(*)')
        .order('created_at', { ascending: false })
        .limit(10);

    const classificationCounts: Record<string, number> = {};
    for (const dec of decisions || []) {
        classificationCounts[dec.classification] = (classificationCounts[dec.classification] || 0) + 1;
        console.log(`  📋 Classification: ${dec.classification}`);
        console.log(`     Confidence: ${(dec.confidence * 100).toFixed(1)}%`);
        console.log(`     Risk ID: ${dec.risk_id}`);
        console.log();
    }

    console.log('  Summary of Classifications:');
    for (const [cls, count] of Object.entries(classificationCounts)) {
        console.log(`    - ${cls}: ${count}`);
    }
    console.log();

    // ============================================
    // ACTION PROPOSALS
    // ============================================
    console.log('🚀 ACTION PROPOSALS');
    console.log('-'.repeat(50));

    const { data: actions } = await supabase
        .from('action_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    const actionTypes: Record<string, number> = {};
    const actionStatuses: Record<string, number> = {};

    for (const action of actions || []) {
        actionTypes[action.action_type] = (actionTypes[action.action_type] || 0) + 1;
        actionStatuses[action.status] = (actionStatuses[action.status] || 0) + 1;

        console.log(`  🔧 Action: ${action.action_type}`);
        console.log(`     Status: ${action.status}`);
        console.log(`     Decision ID: ${action.decision_id}`);
        console.log();
    }

    console.log('  Action Types Summary:');
    for (const [type, count] of Object.entries(actionTypes)) {
        console.log(`    - ${type}: ${count}`);
    }
    console.log('  Status Summary:');
    for (const [status, count] of Object.entries(actionStatuses)) {
        console.log(`    - ${status}: ${count}`);
    }
    console.log();

    // ============================================
    // AUDIT LOGS
    // ============================================
    console.log('📝 AUDIT LOGS (Agent Reasoning Trace)');
    console.log('-'.repeat(50));

    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    // Group by run_id
    const runIds = new Set((logs || []).map(l => l.run_id).filter(Boolean));
    console.log(`  Total Runs: ${runIds.size}`);

    // Steps per run
    const stepCounts: Record<string, number> = {};
    for (const log of logs || []) {
        stepCounts[log.step] = (stepCounts[log.step] || 0) + 1;
    }
    console.log('  Steps Executed:');
    for (const [step, count] of Object.entries(stepCounts)) {
        console.log(`    - ${step}: ${count}`);
    }
    console.log();

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('='.repeat(70));
    console.log('    FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log();
    console.log(`  📊 Total Raw Events Ingested: ${rawEvents?.length || 0}`);
    console.log(`  📊 Observations Created: ${observations?.length || 0}`);
    console.log(`  📊 Hypotheses Generated: ${hypotheses?.length || 0}`);
    console.log(`  📊 Risk Assessments: ${risks?.length || 0}`);
    console.log(`  📊 Decisions Made: ${decisions?.length || 0}`);
    console.log(`  📊 Actions Proposed: ${actions?.length || 0}`);
    console.log(`  📊 Unique Merchants: ${merchants.size}`);
    console.log();

    // Verify expected behaviors
    console.log('  VERIFICATION:');

    // Check if checkout failures triggered high risk
    const highRiskCount = (risks || []).filter(r => r.score >= 7).length;
    console.log(`  ${highRiskCount > 0 ? '✅' : '❌'} High-risk scenarios detected: ${highRiskCount}`);

    // Check if doc gap triggered low risk
    const lowRiskCount = (risks || []).filter(r => r.score <= 4).length;
    console.log(`  ${lowRiskCount > 0 ? '✅' : '❌'} Low-risk scenarios detected: ${lowRiskCount}`);

    // Check classifications
    const hasPlatformRegression = (decisions || []).some(d => d.classification === 'platform_regression' || d.classification === 'migration_error');
    const hasDocGap = (decisions || []).some(d => d.classification === 'documentation_gap');
    console.log(`  ${hasPlatformRegression ? '✅' : '❌'} Platform/Migration issues classified`);
    console.log(`  ${hasDocGap ? '✅' : '❌'} Documentation gaps classified`);

    // Check auto-execution
    const autoExecuted = (actions || []).filter(a => a.status === 'executed').length;
    console.log(`  ${autoExecuted > 0 ? '✅' : '❌'} Actions auto-executed: ${autoExecuted}`);

    console.log();
    console.log('='.repeat(70));
    console.log('    TEST COMPLETE');
    console.log('='.repeat(70));
}

comprehensiveTest().catch(console.error);
