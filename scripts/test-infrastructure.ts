/**
 * Infrastructure Test Script
 * Tests Supabase connection, table access, and Mistral API
 */

import { createClient } from '@supabase/supabase-js';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testInfrastructure() {
    console.log('='.repeat(60));
    console.log('  INFRASTRUCTURE TEST');
    console.log('='.repeat(60));
    console.log();

    // 1. Test Environment Variables
    console.log('1. ENVIRONMENT VARIABLES');
    console.log('-'.repeat(40));
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const mistralKey = process.env.MISTRAL_API_KEY;

    console.log(`  Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`  Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`  Mistral Key: ${mistralKey ? '✅ Set' : '❌ Missing'}`);
    console.log();

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Cannot proceed without Supabase credentials');
        return;
    }

    // 2. Test Supabase Connection
    console.log('2. SUPABASE CONNECTION');
    console.log('-'.repeat(40));

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // Test each table
    const tables = [
        'raw_events',
        'observations',
        'hypotheses',
        'risk_assessments',
        'decisions',
        'action_proposals',
        'audit_logs',
        'human_approvals'
    ];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`  ${table}: ❌ ${error.message}`);
        } else {
            console.log(`  ${table}: ✅ ${count} records`);
        }
    }
    console.log();

    // 3. Test Mistral API
    console.log('3. MISTRAL API');
    console.log('-'.repeat(40));

    if (!mistralKey) {
        console.log('  ❌ Mistral API key not configured');
    } else {
        try {
            const client = new Mistral({ apiKey: mistralKey });
            const response = await client.chat.complete({
                model: 'mistral-small-latest',
                messages: [{ role: 'user', content: 'Say "test successful" in JSON: {"status": "..."}' }],
                responseFormat: { type: 'json_object' }
            });
            const content = response.choices![0].message.content;
            console.log(`  ✅ Mistral API working: ${content}`);
        } catch (err: any) {
            console.log(`  ❌ Mistral API error: ${err.message}`);
        }
    }
    console.log();

    // 4. Test Simulation Data Insert
    console.log('4. SIMULATION INSERT TEST');
    console.log('-'.repeat(40));

    const testEvent = {
        source: 'simulation',
        event_type: 'test_event',
        merchant_id: 'test_merchant',
        fingerprint: 'test:infrastructure',
        payload: { test: true, timestamp: new Date().toISOString() },
        source_origin: 'simulation',
        simulation_run_id: 'test_infra_' + Date.now(),
        processed: false
    };

    const { data: insertData, error: insertError } = await supabase
        .from('raw_events')
        .insert(testEvent)
        .select()
        .single();

    if (insertError) {
        console.log(`  ❌ Insert failed: ${insertError.message}`);
    } else {
        console.log(`  ✅ Insert successful: ${insertData.id}`);

        // Clean up test data
        await supabase.from('raw_events').delete().eq('id', insertData.id);
        console.log(`  ✅ Cleanup successful`);
    }
    console.log();

    console.log('='.repeat(60));
    console.log('  TEST COMPLETE');
    console.log('='.repeat(60));
}

testInfrastructure().catch(console.error);
