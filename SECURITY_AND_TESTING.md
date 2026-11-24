# Security and Testing Guide

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
```

Run these once for functional verification, then perform the independent regression/security pass below. This repository package was prepared without a configured Supabase project. The dependency install attempt in the authoring environment timed out, so a passing Vite build, TypeScript run or Vitest run cannot honestly be reported for this archive.

## Functional pass

1. Create a student and alumni test account.
2. Sign in/out and restore a session after browser refresh.
3. Complete a student profile; update an alumni profile.
4. Submit an alumni verification document; inspect that the upload is private.
5. Promote a trusted admin; review the submission; approve it.
6. Confirm only approved alumni appear in the public directory.
7. Send a mentorship request; accept/decline it from the alumni account; confirm a notification appears.
8. Save/unsave an alumnus and refresh the page.
9. Publish an opportunity from an approved alumni account.
10. Send a referral inquiry from a student; acknowledge/decline it from the opportunity owner.
11. Confirm each status persists after refresh and errors are visible when operations fail.

## Independent security/regression pass

Use separate browser profiles or sessions for an anonymous visitor, Student A, Student B, Alumni A, Alumni B and an administrator. Confirm: anonymous visitors cannot read student profile data or private documents; Student A cannot read/change Student B's private requests or notifications; students cannot create opportunities; an alumni user cannot approve themselves or another alumni; Alumni A cannot access Alumni B's private document or update Alumni B's requests; a non-admin cannot see the verification queue; and users cannot alter their role through profile updates. Also test a second submission while one is pending and duplicate mentorship/referral attempts.

## Database smoke check

After applying the migration, execute `supabase/tests/schema_security_smoke.sql` in the SQL Editor. This checks the schema catalog, RLS switches and private bucket metadata. It does not replace identity-based RLS tests described above.

## Two-pass rule

- Pass 1: functional workflows and expected database persistence.
- Pass 2: unauthorized access attempts, edge cases, page reloads, responsive layout and regression tests.

Do not mark the release as fully verified until both passes succeed on the actual Supabase project.
