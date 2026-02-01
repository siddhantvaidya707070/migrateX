-- Migration: Create agent_learnings and related tables for dashboard data layer
-- Run this in Supabase SQL Editor

-- 1. Create agent_learnings table (doesn't exist yet)
CREATE TABLE IF NOT EXISTS agent_learnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_run_id TEXT,
    learning_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    confidence FLOAT,
    related_events JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for run isolation
CREATE INDEX IF NOT EXISTS idx_learnings_run ON agent_learnings(simulation_run_id);
CREATE INDEX IF NOT EXISTS idx_learnings_created ON agent_learnings(created_at DESC);

-- 3. Create pending events table for spread distribution
CREATE TABLE IF NOT EXISTS pending_simulation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_run_id TEXT NOT NULL,
    event_data JSONB NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    injected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_events_run ON pending_simulation_events(simulation_run_id, injected);

-- 4. Create simulation schedules table for tracking progress
CREATE TABLE IF NOT EXISTS simulation_schedules (
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
);

CREATE INDEX IF NOT EXISTS idx_schedules_run ON simulation_schedules(run_id);

-- 5. Enable RLS but allow all for now
ALTER TABLE agent_learnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for agent_learnings" ON agent_learnings FOR ALL USING (true);

ALTER TABLE pending_simulation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for pending_simulation_events" ON pending_simulation_events FOR ALL USING (true);

ALTER TABLE simulation_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for simulation_schedules" ON simulation_schedules FOR ALL USING (true);
