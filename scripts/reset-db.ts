import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function reset() {
    const supabase = createAgentClient();
    await supabase.from('raw_events').update({ processed: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // update all
    await supabase.from('observations').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // clear obs
    console.log('Reset complete');
}

reset();
