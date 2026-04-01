-- Run this in Supabase SQL editor for project: iwqsfojnlpovynuzpeiq
-- Creates the cmprssn_surveys table

create table if not exists cmprssn_surveys (
  id uuid default gen_random_uuid() primary key,
  answers jsonb not null,
  profile text not null,
  quadrant text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table cmprssn_surveys enable row level security;

-- Allow anonymous inserts (survey submissions)
create policy "Allow anonymous inserts" on cmprssn_surveys
  for insert with check (true);

-- Allow anonymous reads (for cohort data on results page)
create policy "Allow anonymous reads" on cmprssn_surveys
  for select using (true);
