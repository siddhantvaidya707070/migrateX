import { createAgentClient } from '../lib/supabase/agent-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Testing Supabase Connection...');
    const supabase = createAgentClient();
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const payload = { test: 'data' };
    const { data, error } = await supabase
        .from('raw_events')
        .insert({
            source: 'log',
            payload,
            processed: false
        })
        .select()
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Data:', data);
    }
}

test();
