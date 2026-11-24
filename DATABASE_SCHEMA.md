# Database Schema

The initial migration is `supabase/migrations/202611230001_initial_schema.sql`. It uses PostgreSQL UUID keys, foreign keys, checks, indexes, update timestamps, triggers and Row Level Security.

| Table | Purpose | Access model |
|---|---|---|
| `profiles` | Public profile fields and account role. Email is deliberately not stored here. | Owner/admin and narrowly approved directory/relationship reads. Users update only editable profile columns.
| `alumni_profiles` | Career details, skills/topics, availability, milestone JSON and verification status. | Public reads only approved alumni details; owner edits career fields; administrator controls verification.
| `alumni_verification_submissions` | Private verification evidence reference and review decision. | Owner and admin read; alumni insert their own pending submission; admin reviews. At most one pending submission per user.
| `mentorship_requests` | Student-to-alumni mentorship workflow. | Participants read; student creates/withdraws; addressed alumnus accepts/declines. Pending duplicate pair prevented by a partial unique index.
| `saved_alumni` | Student shortlist. | Student owns rows; composite primary key prevents duplicates.
| `opportunities` | Published roles/fellowships created by approved alumni. | Public reads published records; approved owner creates/edits and closes; admin can moderate. Hard deletion is intentionally not part of the application workflow.
| `referral_requests` | Inquiry from student to opportunity owner. | Student and addressed alumnus read; student creates/withdraws; alumnus acknowledges/declines. Unique student/opportunity pair.
| `notifications` | In-app workflow notifications. | Recipient reads and marks own notifications read; security-definer triggers create system notifications.

## JSON and arrays

- `profiles.skills`, `alumni_profiles.mentorship_topics` and `opportunities.skills` are PostgreSQL `text[]` because the current feature set treats each value as a simple label.
- `alumni_profiles.professional_links` and `past_milestones` use JSONB because they represent small structured profile attributes and the current UI consumes them as nested values.
- Relational workflow data (users, requests, listings, notifications) uses normalized tables and foreign keys rather than JSON documents.

## Important constraints and triggers

- Roles are limited to student/alumni/admin. Public sign-up metadata is clamped to student/alumni. Authenticated users cannot update their own role.
- Alumni verification status and reviewed fields are protected from self-editing. A decision on a submission updates the related alumni profile in a trigger.
- Verification object paths must begin with the owning user's auth UUID.
- Mentorship and referral request participants cannot be reassigned, and only valid pending-state transitions are permitted.
- A student cannot request their own profile as a mentor or referral recipient.
- Opportunity publishing requires an approved alumni profile.
- RLS is enabled on every app table in the migration.


Opportunity removal is implemented as a status transition to `closed`, not a hard delete, so referral inquiry history remains available to its participants. Authenticated browser clients are not granted hard-delete permission for opportunities. If an administrator rejects or revokes an alumnus verification, their published opportunities are automatically closed.
