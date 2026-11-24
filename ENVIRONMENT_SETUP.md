# Environment Setup

## Required for local development

- Node.js 20.19+ or 22.12+ (Vite 8 requirement).
- npm.

## Optional but required for live data

- `VITE_SUPABASE_URL`: project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: publishable key (preferred).
- `VITE_SUPABASE_ANON_KEY`: legacy anon key fallback.
- `VITE_INSTITUTION_NAME`: visible institution branding. Defaults to `GLA University` pending owner confirmation.

Use `.env.local` for local values. `.env*` files are ignored by Git except `.env.example`. Never store a Supabase service-role key, database password or Gemini secret in client-side environment variables.

## Demo mode

With no Supabase URL/key, the website displays illustrative sample cards, allows ephemeral interactions in React state, and shows a clear demo notice. It does not persist demo requests in local storage or represent those actions as live backend transactions.

## Production environment

Set the same public Supabase URL and publishable key in your deployment provider's build environment. Confirm Supabase Auth redirect URLs include the production domain. If the institution changes, update `VITE_INSTITUTION_NAME` and review any legacy sample biographies before production.
