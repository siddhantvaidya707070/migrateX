import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function quickTest() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Test table access
    const { count, error } = await supabase
        .from('raw_events')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.log('SUPABASE: FAIL -', error.message);
    } else {
        console.log('SUPABASE: OK -', count, 'events');
    }
}

quickTest();
