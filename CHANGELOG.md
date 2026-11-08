# Changelog

## 2026-11-08

### Added

- Added the staff academy portal at `/dashboard`, including overview, students, batches, attendance, fees, payments, reports, and settings views.
- Added protected routing, login, logout, password reset, role badges, and demo staff accounts.
- Added Supabase client integration with local demo-session fallback when Supabase is not configured.
- Added academy domain types, client-side store helpers, environment template, and authentication flow test script.
- Added the complete Supabase schema, migrations, seed data, auth profile trigger, and row-level security policies.
- Added student, batch, and attendance service layers for Supabase-backed and demo-store workflows.
- Added management test scripts covering authentication, student management, batch management, and attendance recording/reporting.
- Added the Vercel/Supabase production deployment guide, free backup and recovery procedure, and read-only RLS verification checklist.
- Added production configuration and anonymous database-access verification scripts.
- Added Supabase SSR browser/server helpers and middleware session refresh for Vercel deployments.

### Changed

- Wrapped the application in the shared `AuthProvider`.
- Added desktop and mobile dashboard links to the main navigation.
- Added the requested brand color tokens to the Tailwind theme.
- Added `@supabase/supabase-js` as an application dependency.
- Added duplicate-safe attendance upserts, explicit status handling, attendance calculations, and management validation paths.
- Made demo authentication opt-in and hid demo-account controls unless `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`.
- Made Next.js server output the default for Vercel while preserving the existing static export for GitHub Pages.
- Added Supabase publishable-key support with legacy anon-key compatibility.
- Upgraded Next.js and PostCSS to audited versions with zero production dependency vulnerabilities.
- Updated the lint command for Next.js 16 and migrated session refresh from deprecated `middleware.ts` to `proxy.ts`.
- Corrected the seed migration to avoid re-declaring existing RLS policies and unsupported attendance fields.
- Linked and applied all five Supabase migrations to the production project.
- Replaced the seeded demo roster and test financial/activity records with the supplied 43-student roster.
- Set the roster fee to ₹500 per month and made parent/contact details optional until profiles are completed.