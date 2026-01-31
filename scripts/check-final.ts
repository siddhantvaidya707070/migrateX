import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkFinal() {
    const supabase = createAgentClient();

    const { data: prop } = await supabase.from('action_proposals').select('*');
    console.log('--- Action Proposals ---');
    console.log(JSON.stringify(prop, null, 2));

    const { data: decisions } = await supabase.from('decisions').select('*');
    console.log('--- Decisions ---');
    console.log(decisions);

    const { data: risks } = await supabase.from('risk_assessments').select('*');
    console.log('--- Risks ---');
    console.log(risks);
}

checkFinal();
