-- Stage 4 Migration: Enhanced raw_events for Simulation & Ingestion
-- 
-- WHY: The original schema was too limited for realistic simulation.
-- We need to track:
--   - event_type: The specific signal type (checkout_failure, webhook_failure, etc.)
--   - merchant_id: Which merchant is affected (critical for multi-merchant detection)
--   - fingerprint: Deterministic key for clustering similar events
--   - source_origin: Whether this is a simulation or real production signal

-- Add event_type column
-- This categorizes the signal (checkout_failure, api_error, support_ticket, etc.)
ALTER TABLE raw_events ADD COLUMN IF NOT EXISTS event_type text;

-- Add merchant_id column  
-- Critical for multi-merchant impact detection (triggers x2 risk multiplier)
ALTER TABLE raw_events ADD COLUMN IF NOT EXISTS merchant_id text;

-- Add fingerprint column
-- Deterministic key for clustering: same error → same fingerprint
-- Computed at ingestion time, used by ObservationEngine for grouping
ALTER TABLE raw_events ADD COLUMN IF NOT EXISTS fingerprint text;

-- Add source_origin column
-- Distinguishes simulation data from real production signals
-- Allows judges to see which events came from /api/simulate/*
ALTER TABLE raw_events ADD COLUMN IF NOT EXISTS source_origin text DEFAULT 'real' 
  CHECK (source_origin IN ('simulation', 'real'));

-- Add simulation_run_id column
-- Groups events from the same simulation trigger (for debugging/demo)
ALTER TABLE raw_events ADD COLUMN IF NOT EXISTS simulation_run_id text;

-- Update source constraint to support more signal types
-- We need to accept simulation webhook/log/ticket sources
ALTER TABLE raw_events DROP CONSTRAINT IF EXISTS raw_events_source_check;
ALTER TABLE raw_events ADD CONSTRAINT raw_events_source_check 
  CHECK (source IN ('ticket', 'log', 'webhook', 'migration_state', 'api', 'simulation'));

-- Create index on fingerprint for faster clustering queries
CREATE INDEX IF NOT EXISTS idx_raw_events_fingerprint ON raw_events(fingerprint);

-- Create index on merchant_id for multi-merchant analysis
CREATE INDEX IF NOT EXISTS idx_raw_events_merchant ON raw_events(merchant_id);

-- Create index on event_type for type-based queries
CREATE INDEX IF NOT EXISTS idx_raw_events_event_type ON raw_events(event_type);

-- Create index on processed + created_at for agent loop efficiency
CREATE INDEX IF NOT EXISTS idx_raw_events_unprocessed ON raw_events(processed, created_at) 
  WHERE processed = false;
