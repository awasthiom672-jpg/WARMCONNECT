-- Run after the initial migration in Supabase SQL Editor.
-- Catalog-only smoke test; identity-based RLS tests are documented in SECURITY_AND_TESTING.md.
do $$
declare
  table_name text;
  expected_tables text[] := array[
    'profiles', 'alumni_profiles', 'alumni_verification_submissions',
    'mentorship_requests', 'saved_alumni', 'opportunities',
    'referral_requests', 'notifications'
  ];
begin
  foreach table_name in array expected_tables loop
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name
        and c.relkind = 'r' and c.relrowsecurity
    ) then
      raise exception 'Expected table public.% with RLS enabled', table_name;
    end if;
  end loop;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    raise exception 'Private email addresses must not be stored in the public profiles table';
  end if;

  if has_table_privilege('authenticated', 'public.opportunities', 'DELETE') then
    raise exception 'Authenticated users should close opportunities, not hard-delete referral history';
  end if;

  if not exists (
    select 1 from storage.buckets
    where id = 'alumni-verification' and public = false
      and file_size_limit = 10485760
  ) then
    raise exception 'Private alumni-verification storage bucket is missing or misconfigured';
  end if;

  foreach table_name in array expected_tables loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = table_name
    ) then
      raise exception 'Expected at least one RLS policy on public.%', table_name;
    end if;
  end loop;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'owners and admins read verification files'
  ) then
    raise exception 'Private verification-document read policy is missing';
  end if;
  raise notice 'AlumBridge schema/security catalog smoke check passed.';
end;
$$;
