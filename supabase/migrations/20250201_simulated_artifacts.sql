-- Simulated Artifacts Table
-- Stores generated email, ticket, chatbot, and merchant notice content

CREATE TABLE IF NOT EXISTS simulated_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES action_proposals(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('internal_email', 'ticket_reply', 'chatbot_response', 'merchant_notice')),
  subject TEXT,
  body TEXT NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('support', 'engineering', 'ops', 'merchant', 'leadership')),
  recipient_name TEXT,
  recipient_email TEXT,
  sender_name TEXT DEFAULT 'Support Agent',
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups by proposal
CREATE INDEX idx_artifacts_proposal ON simulated_artifacts(proposal_id);
CREATE INDEX idx_artifacts_type ON simulated_artifacts(artifact_type);

-- Simulation Schedules Table
-- Manages time-distributed event injection for spread simulations

CREATE TABLE IF NOT EXISTS simulation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  config JSONB NOT NULL, -- Full simulation config
  total_events INT NOT NULL,
  events_injected INT DEFAULT 0,
  distribution TEXT NOT NULL CHECK (distribution IN ('burst', 'spread')),
  duration_seconds INT DEFAULT 300, -- 5 minutes default
  batches JSONB DEFAULT '[]', -- Array of batch definitions
  next_batch_index INT DEFAULT 0,
  next_injection_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for active schedules
CREATE INDEX idx_schedules_status ON simulation_schedules(status);
CREATE INDEX idx_schedules_next ON simulation_schedules(next_injection_at) WHERE status = 'active';

-- Agent Learning Logs Table
-- Stores what the agent learned (separate from real-time activity)

CREATE TABLE IF NOT EXISTS agent_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT,
  learning_type TEXT NOT NULL CHECK (learning_type IN ('pattern_detected', 'classification_made', 'doc_update_suggested', 'knowledge_entry', 'trend_identified')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence FLOAT,
  related_events JSONB DEFAULT '[]', -- Array of event IDs
  related_observations JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_learnings_type ON agent_learnings(learning_type);
CREATE INDEX idx_learnings_run ON agent_learnings(run_id);
