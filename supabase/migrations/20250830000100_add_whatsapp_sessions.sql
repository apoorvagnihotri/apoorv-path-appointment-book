-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- Create table to track WhatsApp registration sessions
create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  wa_number text not null unique,
  state text not null default 'idle',
  otp_hash text,
  attempts int not null default 0,
  expires_at timestamptz,
  data_json jsonb not null default '{}',
  last_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_whatsapp_sessions_state on public.whatsapp_sessions (state);
create index if not exists idx_whatsapp_sessions_expires on public.whatsapp_sessions (expires_at);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Recreate trigger for this table (idempotent)
drop trigger if exists set_whatsapp_sessions_updated_at on public.whatsapp_sessions;
create trigger set_whatsapp_sessions_updated_at
before update on public.whatsapp_sessions
for each row execute procedure public.set_updated_at();

-- Row level security
alter table public.whatsapp_sessions enable row level security;

-- Policies: Edge Functions (service role) bypass RLS; optional read by owner phone later
-- For now, allow no direct client access.
create policy "no direct client access" on public.whatsapp_sessions
  for all using (false) with check (false);
