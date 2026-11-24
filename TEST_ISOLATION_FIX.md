# Test isolation fix

Vitest now runs the application context in its in-memory demo mode, even when a developer has a configured `.env.local` Supabase project.

This prevents component and workflow tests from making live Supabase requests or depending on a signed-in account. The real Supabase client remains enabled in normal development and production builds when the public URL and publishable/anon key are configured.

A focused regression test verifies that Supabase is disabled while `import.meta.env.MODE` is `test`.

Run the checks with:

```bash
npm run typecheck
npm test
npm run build
```
