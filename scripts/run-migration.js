// Run migrations directly via Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
    console.log('Running database migrations...')

    const migrations = [
        // Add simulation_run_id to agent_learnings
        `ALTER TABLE agent_learnings ADD COLUMN IF NOT EXISTS simulation_run_id TEXT`,

        // Create pending_simulation_events table
        `CREATE TABLE IF NOT EXISTS pending_simulation_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            simulation_run_id TEXT NOT NULL,
            event_data JSONB NOT NULL,
            scheduled_at TIMESTAMPTZ NOT NULL,
            injected BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,

        // Create index for pending events
        `CREATE INDEX IF NOT EXISTS idx_pending_events_run ON pending_simulation_events(simulation_run_id, injected)`,

        // Create index for learnings
        `CREATE INDEX IF NOT EXISTS idx_learnings_run ON agent_learnings(simulation_run_id)`,

        // Create simulation_schedules table
        `CREATE TABLE IF NOT EXISTS simulation_schedules (
            id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            total_events INT NOT NULL,
            distribution TEXT NOT NULL,
            duration_seconds INT NOT NULL,
            status TEXT DEFAULT 'active',
            events_injected INT DEFAULT 0,
            started_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`
    ]

    for (const sql of migrations) {
        console.log('Executing:', sql.substring(0, 60) + '...')
        try {
            const { error } = await supabase.rpc('exec_sql', { sql_string: sql })
            if (error) {
                console.error('Migration error:', error.message)
                // Try direct approach using raw query if RPC fails
                // Note: This won't work in Supabase client, need to use dashboard
                console.log('  (May need to run manually in Supabase SQL Editor)')
            } else {
                console.log('  ✓ Success')
            }
        } catch (err) {
            console.error('Error:', err.message)
        }
    }

    console.log('\nMigration complete. If any failed, please run the SQL in Supabase SQL Editor:')
    console.log('File: supabase/migrations/20260201_add_run_id_isolation.sql')
}

runMigration().catch(console.error)
