import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    const supabase = createAgentClient();

    console.log('--- Raw Events ---');
    const { data: events } = await supabase.from('raw_events').select('id, processed');
    console.log(events);

    console.log('--- Observations ---');
    const { data: obs } = await supabase.from('observations').select('*');
    console.log(obs);

    console.log('--- Hypotheses ---');
    const { data: hypos } = await supabase.from('hypotheses').select('*');
    console.log(hypos);

    console.log('--- Audit Logs ---');
    const { data: logs } = await supabase.from('audit_logs').select('*');
    console.log(logs);
}

check();
