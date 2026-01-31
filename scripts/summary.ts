import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function summary() {
    const s = createAgentClient();

    // Get counts
    const counts: Record<string, number> = {};
    for (const t of ['raw_events', 'observations', 'hypotheses', 'risk_assessments', 'decisions', 'action_proposals', 'audit_logs']) {
        const { count } = await s.from(t).select('*', { count: 'exact', head: true });
        counts[t] = count || 0;
    }

    // Get risk distribution
    const { data: risks } = await s.from('risk_assessments').select('score');
    const scores = (risks || []).map(r => r.score);

    // Get classifications
    const { data: decs } = await s.from('decisions').select('classification');
    const cls: Record<string, number> = {};
    for (const d of decs || []) { cls[d.classification] = (cls[d.classification] || 0) + 1; }

    // Get actions
    const { data: acts } = await s.from('action_proposals').select('action_type, status');
    const executed = (acts || []).filter(a => a.status === 'executed').length;
    const pending = (acts || []).filter(a => a.status === 'pending').length;

    // Print summary
    console.log('');
    console.log('='.repeat(60));
    console.log('  COMPREHENSIVE END-TO-END TEST RESULTS');
    console.log('  Self-Healing Support Agent - Stages 1-4');
    console.log('='.repeat(60));
    console.log('');
    console.log('TABLE COUNTS:');
    console.log('  raw_events:       ' + counts.raw_events);
    console.log('  observations:     ' + counts.observations);
    console.log('  hypotheses:       ' + counts.hypotheses);
    console.log('  risk_assessments: ' + counts.risk_assessments);
    console.log('  decisions:        ' + counts.decisions);
    console.log('  action_proposals: ' + counts.action_proposals);
    console.log('  audit_logs:       ' + counts.audit_logs);
    console.log('');
    console.log('RISK SCORES:');
    console.log('  High (7-10):  ' + scores.filter(s => s >= 7).length);
    console.log('  Medium (4-6): ' + scores.filter(s => s >= 4 && s < 7).length);
    console.log('  Low (1-3):    ' + scores.filter(s => s < 4).length);
    console.log('');
    console.log('CLASSIFICATIONS:');
    for (const [c, n] of Object.entries(cls)) {
        console.log('  ' + c + ': ' + n);
    }
    console.log('');
    console.log('ACTIONS:');
    console.log('  Executed:     ' + executed);
    console.log('  Pending:      ' + pending);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
}

summary().catch(console.error);
