# WARMCONNECT

WARMCONNECT is an alumni discovery, mentorship and opportunity platform built with React, TypeScript, Vite and Supabase. The existing dark visual theme and main page structure have been retained.

## What is included

- Alumni directory with search filters, sorting and incremental loading.
- Deterministic, explainable career-goal matching.
- Student and alumni authentication through Supabase Auth.
- Profile editing and administrator-reviewed alumni verification.
- Private verification-document storage.
- Mentorship requests with student withdrawal and alumni accept/decline actions.
- Saved alumni, opportunity publishing and referral inquiries.
- In-app notifications and an administrator verification queue.
- Explicit demo mode when Supabase has not been configured. Demo actions remain in memory and are not represented as live transactions.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requires a modern Node runtime).
- npm.
- A Supabase project for live authentication and persistence.

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill in the Supabase URL and publishable key in .env.local
npm run dev
```

When Supabase variables are absent, WARMCONNECT starts in **illustrative demo mode**. The bundled sample alumni and opportunity cards are not verified identities or live listings. Demo interactions are session-memory-only and disappear on refresh.

## Supabase setup

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) before expecting accounts, directory records, mentorship requests, opportunity publishing, notifications or document review to persist. The complete initial schema and security policies are in `supabase/migrations/202611230001_initial_schema.sql`. The migration also creates the private `alumni-verification` Storage bucket.

Set these variables in `.env.local` and in your deployment provider:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_INSTITUTION_NAME=GLA University
```

The legacy `VITE_SUPABASE_ANON_KEY` variable is accepted for projects that have not moved to the publishable-key format. A publishable/anon key is intended for browser use with RLS enabled. **Never put a service-role key or secret key in a `VITE_` variable.**

## Commands

```bash
npm run dev        # Development server on port 3000
npm run typecheck  # TypeScript check
npm test           # Vitest suite
npm run build      # Production build
npm run preview    # Preview production build
```

## Important product and deployment notes

- Institution branding is configurable through `VITE_INSTITUTION_NAME`. Confirm the correct institution before production. Some demo sample biography text is illustrative, not an authoritative institutional directory.
- Alumni accounts are not discoverable or allowed to publish opportunities until an administrator reviews their submitted evidence. This is an application-level administrator review, not a claim of direct university verification.
- A referral inquiry is only an inquiry to the alumnus who posted an opportunity. It is not a promised referral, application or job offer.
- Career matching and introduction drafts are deterministic. No Gemini API integration is active, and no AI provider key is required for core workflows.
- Live Supabase behavior cannot be exercised until a real project is configured. The application and SQL migration are supplied, but project credentials, email-provider settings and an initial administrator account must be supplied/configured by the project owner.

See [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md), [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md), [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) and [SECURITY_AND_TESTING.md](./SECURITY_AND_TESTING.md).
