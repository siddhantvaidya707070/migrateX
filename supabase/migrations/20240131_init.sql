-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Raw Events: Ingested signals
create table if not exists raw_events (
  id uuid primary key default uuid_generate_v4(),
  source text not null check (source in ('ticket', 'log', 'webhook', 'migration_state')),
  payload jsonb not null,
  processed boolean default false,
  created_at timestamptz default now()
);

-- 2. Observations: Aggregated patterns
create table if not exists observations (
  id uuid primary key default uuid_generate_v4(),
  fingerprint text not null, -- e.g., "checkout_error_stage_3"
  summary text,
  merchant_count int default 0,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  status text default 'active' check (status in ('active', 'resolved', 'investigating')),
  metadata jsonb
);

-- 3. Hypotheses: AI generated root causes
create table if not exists hypotheses (
  id uuid primary key default uuid_generate_v4(),
  observation_id uuid references observations(id),
  cause text not null,
  confidence float not null,
  assumptions text[],
  created_at timestamptz default now()
);

-- 4. Risk Assessments
create table if not exists risk_assessments (
  id uuid primary key default uuid_generate_v4(),
  hypothesis_id uuid references hypotheses(id),
  score int not null check (score >= 0 and score <= 10),
  factors jsonb, -- e.g. ["checkout_impact", "multi_merchant"]
  created_at timestamptz default now()
);

-- 5. Decisions & Classifications
create table if not exists decisions (
  id uuid primary key default uuid_generate_v4(),
  risk_id uuid references risk_assessments(id),
  classification text not null check (classification in ('merchant_misconfiguration', 'migration_error', 'platform_regression', 'documentation_gap')),
  confidence float,
  created_at timestamptz default now()
);

-- 6. Action Proposals
create table if not exists action_proposals (
  id uuid primary key default uuid_generate_v4(),
  decision_id uuid references decisions(id),
  action_type text not null check (action_type in ('email_support', 'email_engineering', 'draft_ticket_reply', 'auto_reply_ticket', 'update_docs')),
  payload jsonb not null, -- content of email/ticket
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'executed')),
  created_at timestamptz default now()
);

-- 7. Audit Logs
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  step text not null, -- "Observe", "Synthesize", "Act"
  details jsonb,
  agent_version text default 'v1.0',
  created_at timestamptz default now()
);

-- 8. Human Approvals (optional separate table or part of action_proposals)
create table if not exists human_approvals (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references action_proposals(id),
  approver_id uuid, -- link to auth.users if RLS enabled
  decision text not null check (decision in ('approve', 'reject')),
  notes text,
  created_at timestamptz default now()
);

-- RLS Policies (Basic)
alter table raw_events enable row level security;
alter table observations enable row level security;

create policy "Service Role Full Access" on raw_events
  using (true)
  with check (true);

create policy "Service Role Full Access" on observations
  using (true)
  with check (true);

-- Allow public insert to raw_events for webhook simplicity (in production, use signed secrets)
create policy "Public Insert" on raw_events
  for insert
  with check (true);
