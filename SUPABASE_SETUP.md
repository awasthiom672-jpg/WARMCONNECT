# Supabase Setup

## 1. Create the project

Create a Supabase project and keep the project URL and publishable key available. Do not place a service-role key in browser configuration.

## 2. Apply the schema migration

In the Supabase Dashboard, open **SQL Editor**, create a new query, paste the full contents of `supabase/migrations/202611230001_initial_schema.sql`, and run it. The migration is transactional and creates the tables, indexes, triggers, RLS policies and private verification bucket. It also backfills profile rows for Supabase Auth users that already existed before this migration. If Supabase reports an error, stop and resolve it before allowing sign-ups. Do not manually mark migration success if the SQL transaction failed.

The migration is intended for a fresh WARMCONNECT schema. It creates objects under `public` and adds policies to `storage.objects`; inspect any existing objects before using it in a project that already contains application tables or policies.

## 3. Configure Supabase Auth

In **Authentication → Providers**, enable Email. Choose whether email confirmation is required for your production onboarding policy. In **Authentication → URL Configuration**, set the production Site URL and allowed redirect URLs. Include your localhost development URL while testing. Password reset returns users to the current application origin. Configure a trusted SMTP provider before production if you need reliable transactional email delivery.

## 4. Configure the frontend

Copy `.env.example` to `.env.local`, then set:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_INSTITUTION_NAME=GLA University
```

Restart the Vite server after changing environment variables. `VITE_SUPABASE_ANON_KEY` is accepted as a legacy alternative. Never use a service-role or secret key.

## 5. Create the first administrator

There is deliberately no public admin registration path. First create a trusted account through the normal sign-up flow and verify its email. Then, while signed in to the trusted Supabase project owner account, open the Supabase SQL Editor and promote that exact account by email:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('YOUR_TRUSTED_ADMIN_EMAIL');
```

Check that exactly one row was updated. Keep the administrator account protected with a strong unique password and MFA where available. Never put this SQL in frontend code or expose a database owner credential.

## 6. Verify the storage bucket

The migration creates a private bucket named `alumni-verification` with a 10 MB limit and PDF/PNG/JPEG content types. Owners can upload and view their own files; administrators can review files through short-lived signed URLs. Do not make the bucket public.

## 7. Test with separate identities

Create at least one student, one alumni applicant and one administrator. Submit an alumni document, review it as the administrator, and confirm the approved alumnus becomes visible. Then exercise mentorship and referral workflows with distinct accounts. Use the SQL smoke check in `supabase/tests/schema_security_smoke.sql` after applying the migration.
