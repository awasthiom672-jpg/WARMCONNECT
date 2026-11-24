# AlumBridge Codebase Audit

## Scope and baseline

The source repository is a React 19 + TypeScript + Vite application using Tailwind CSS 4, Lucide icons, Motion and Three.js. It contains a component-based single-page experience, a context provider, mock data and a small Vitest/Testing Library suite.

## Confirmed findings in the supplied source

| Severity | Finding | Resolution in this package |
|---|---|---|
| Critical | No Supabase client, schema, migration or RLS configuration existed. | Added the Supabase browser client, SQL migration, RLS policies, notifications and private Storage bucket.
| High | Alumni and opportunities were supplied by local mock arrays only. | Live directory and opportunity queries now use Supabase; no production seed records are invented.
| High | Mentorship requests, saved alumni and referral inquiries used browser storage rather than account-scoped records. | Replaced persistent local storage with Supabase service functions and account-scoped tables. Demo interactions are memory-only.
| High | Authentication and authorization flows were missing. | Added sign-up, sign-in, sign-out, password reset, profile editing and Supabase-backed role checks. Database policies remain the security boundary.
| High | Alumni identity could be presented without a review workflow. | Added evidence submission, private file storage and administrator approval/rejection. UI wording now describes administrator review, not official university verification.
| High | Some demo state implied a pre-existing accepted mentorship request. | Removed the seeded accepted request so the tracker starts empty.
| Medium | Referral inquiry state did not have an alumni response workflow. | Added a private incoming-inquiry view for the listing owner and acknowledge/decline actions.
| Medium | Demo success messages could be confused with live backend persistence. | Added demo-mode notices and updated action copy to identify in-memory demo actions.
| Medium | The introduction assistant assumed at least one directory record existed. | Added an empty-directory-safe path.
| Medium | Alumni directory retrieval had no UI pagination. | Added server pagination in 50-profile batches and a Load more control.
| Medium | Some update paths treated a zero-row RLS-filtered update as success. | Added returned-row checks to mentorship, referral, verification-review and notification updates.
| Medium | Institution branding required clarification. | Kept institution branding configurable rather than asserting an unverified institutional affiliation.
| Low | Stale AI Studio README implied Gemini API key setup despite no active Gemini integration. | Replaced with setup instructions that match current functionality.

## Architecture summary

- `src/context/AlumBridgeContext.tsx`: shared UI state, auth state, directory loading and service orchestration.
- `src/services/alumBridgeService.ts`: Supabase data/auth/storage operations and database-to-UI mapping.
- `src/lib/supabase.ts`: single optional browser client configuration.
- `src/components`: existing site sections and new auth, notification and admin-review surfaces.
- `supabase/migrations`: database schema, triggers, policies and storage setup.

## Security decisions

- Browser code receives only a Supabase publishable/anon key.
- No service-role key is present in the repository.
- Email addresses are not part of public profile rows.
- RLS protects profiles, alumni profiles, verification submissions, mentorship requests, saved alumni, opportunities, referral requests and notifications.
- Verification files are stored in a private bucket with owner/admin access rules.
- User metadata can request only the `student` or `alumni` role; it cannot create an administrator.
- Verification status is protected by database triggers and may be changed only by administrators. Rejecting a previously approved alumnus automatically closes their published opportunities.
- Opportunity owners can close listings but cannot hard-delete them through the application, preserving referral history.

## Known external dependencies / limits

- A real Supabase project, URL and publishable key are required to test production authentication and live database operations. They were not supplied with the archive.
- An initial administrator must be designated by the project owner in the Supabase SQL editor after creating a trusted account.
- Confirm the institution name before production branding and data import.
- The bundled mock alumni and opportunity cards are illustrative only. There is no approved production alumni dataset in the source archive.
- No real-time chat, payment processing, calendar scheduling, email notification delivery or AI-provider integration was added; these are outside the safe MVP scope. In-app notifications are database-backed.
- Supabase SQL and RLS policies need to be applied and verified against the owner's actual project before launch.
