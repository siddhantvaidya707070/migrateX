import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runSim() {
    const supabase = createAgentClient();

    // 1. Reset
    console.log('--- 1. Resetting DB ---');
    await supabase.from('raw_events').update({ processed: false }).neq('id', '0');
    await supabase.from('observations').delete().neq('id', '0');
    await supabase.from('hypotheses').delete().neq('id', '0');
    await supabase.from('risk_assessments').delete().neq('id', '0');
    await supabase.from('decisions').delete().neq('id', '0');
    await supabase.from('action_proposals').delete().neq('id', '0');

    // 2. Ingest
    console.log('--- 2. Ingesting Signal ---');
    const payload = { event: 'checkout.failure', reason: 'timeout_500' };
    await supabase.from('raw_events').insert({ source: 'webhook', payload, processed: false });

    // 3. User needs to trigger Agent Loop
    console.log('--- 3. Ready for Agent Loop ---');
    console.log('Run: Invoke-RestMethod -Uri "http://localhost:3000/api/agent-loop" -Method Get');
}

runSim();
