import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyRunId() {
    const supabase = createAgentClient();

    console.log('--- Verifying run_id column in audit_logs ---');

    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('id, run_id, step, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('\nLatest audit logs with run_id:');
    for (const log of logs || []) {
        console.log(`  [${log.step}] run_id: ${log.run_id || 'NULL'}`);
    }

    // Check if run_id is populated
    const hasRunId = logs?.some(l => l.run_id !== null);
    console.log(`\n✅ run_id column is ${hasRunId ? 'WORKING' : 'NOT populated'}`);
}

verifyRunId();
