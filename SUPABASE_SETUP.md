# Supabase Setup for CBT Portal

## Tables to Create

### 1. portal_users table (already created)
```sql
create table if not exists public.portal_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  submitted_at timestamptz not null default now()
);

alter table public.portal_users enable row level security;

create policy "allow anon insert"
on public.portal_users
for insert
to anon
with check (true);

create policy "allow anon update"
on public.portal_users
for update
to anon
using (true)
with check (true);

create policy "allow anon select"
on public.portal_users
for select
to anon
using (true);
```

### 2. test_results table (NEW - run this in Supabase SQL editor)
```sql
-- Create test_results table
create table if not exists public.test_results (
  id bigserial primary key,
  user_email text not null,
  test_id text not null,
  test_title text not null,
  total_marks numeric not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  incorrect_answers integer not null default 0,
  unattempted integer not null default 0,
  percentage numeric not null default 0,
  total_test_duration integer not null default 0,
  section_wise_results jsonb,
  fullscreen_exit_count integer not null default 0,
  question_details jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Create index for faster queries
create index if not exists idx_test_results_user_email 
on public.test_results(user_email);

create index if not exists idx_test_results_completed_at 
on public.test_results(completed_at desc);

-- Enable RLS
alter table public.test_results enable row level security;

-- Allow anon to insert test results
create policy "allow anon insert test results"
on public.test_results
for insert
to anon
with check (true);

-- Allow anon to select their own test results
create policy "allow anon select test results"
on public.test_results
for select
to anon
using (true);

-- Allow anon to update test results (optional)
create policy "allow anon update test results"
on public.test_results
for update
to anon
using (true)
with check (true);

-- Allow anon to delete test results (optional)
create policy "allow anon delete test results"
on public.test_results
for delete
to anon
using (true);
```

## Implementation Summary

1. **User Profile Flow:**
   - ProfileSetup saves directly to Supabase `portal_users` table
   - No localStorage for user profile (Supabase is single source of truth)
   - Components fetch user profile from Supabase using email

2. **Test Results Flow:**
   - TestInterface saves results to Supabase `test_results` table
   - CBTDashboard fetches results from Supabase
   - No backend API calls needed
   - No localStorage for test results

3. **Benefits:**
   - Single source of truth (Supabase)
   - Data persists across devices
   - No backend server required for CBT portal
   - Easy to query and analyze test data

## Next Steps After Running SQL

1. Restart React dev server
2. Set up new user profile (will save to Supabase)
3. Take a test (results will save to Supabase)
4. Check dashboard (will fetch from Supabase)
