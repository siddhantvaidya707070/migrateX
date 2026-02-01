-- EMERGENCY DATABASE FIX - Run this in Supabase SQL Editor
-- This script DROPS and RECREATES the agent_learnings table with the correct schema

-- First, drop the existing table if it has wrong columns
DROP TABLE IF EXISTS agent_learnings CASCADE;

-- Create the agent_learnings table with correct schema
CREATE TABLE agent_learnings (
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

-- Create indexes for performance
CREATE INDEX idx_learnings_run ON agent_learnings(simulation_run_id);
CREATE INDEX idx_learnings_created ON agent_learnings(created_at DESC);
CREATE INDEX idx_learnings_type ON agent_learnings(learning_type);

-- Enable RLS
ALTER TABLE agent_learnings ENABLE ROW LEVEL SECURITY;

-- Create permissive policy
CREATE POLICY "Allow all for agent_learnings" ON agent_learnings FOR ALL USING (true);

-- Verify the table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agent_learnings' 
ORDER BY ordinal_position;
