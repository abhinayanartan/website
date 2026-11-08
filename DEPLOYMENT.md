# Production Deployment Guide

This project is prepared for the free Vercel Hobby plan with Supabase Free. The public academy website and the staff portal are deployed together under the same origin. Do not deploy until every pre-deployment gate below passes.

## 1. Create the production Supabase project

1. Create a Supabase project on the Free plan.
2. In the Supabase SQL Editor, run the migration files in `supabase/migrations/` in filename order.
3. Confirm the production project has no development/demo records that should not be visible to staff.
4. Create real staff users in **Authentication > Users**. Do not use the demo passwords in production.
5. Set each user’s `public.profiles` row and role (`admin` or `teacher`) using a privileged SQL session.
6. Run `supabase/verify-production.sql` in the SQL Editor.
7. Confirm every listed academy table has RLS enabled and the expected policies exist.

Only the public Supabase URL and publishable key belong in Vercel. Never place the `service_role` key in this repository, browser code, `.env.example`, or Vercel client-side variables.

## 2. Configure Supabase authentication redirects

In **Supabase > Authentication > URL Configuration**:

1. Set **Site URL** to the final Vercel URL.
2. Add `https://<vercel-domain>/reset-password/` and `http://localhost:3000/reset-password/` for testing.
3. Add the custom-domain reset URL only after the domain is attached.
4. Remove obsolete preview URLs before production sign-off.

The application builds password-reset redirects from the current origin, so the final URL must be present in Supabase’s allow-list.

## 3. Configure Vercel

1. Import the GitHub repository into Vercel and select the **Hobby** plan.
2. Keep the framework as **Next.js**, install command `npm ci`, and build command `npm run build`.
3. Add these Production environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
   - `NEXT_PUBLIC_BASE_PATH` as an empty value
4. Scope values to **Production**. Do not add a service-role key.
5. Trigger deployment only after all gates pass.

The existing GitHub Pages workflow remains available for the public site, but use one production host as the source of truth. Do not run Vercel and GitHub Pages as competing production URLs.

## 4. Pre-deployment gates

With production values loaded only in the local shell:

```powershell
npm ci
npm run verify:production-config
npm run lint
npm run build
npm run verify:production-policies
```

The policy script uses only the publishable key. It is not a substitute for the privileged SQL checklist or signed-in role tests.

## 5. Chrome acceptance test

Using the latest Google Chrome:

1. Verify the public home, gallery, contact, and navigation routes over the final HTTPS URL.
2. Open `/login`; confirm demo account controls are absent.
3. Sign in with a real admin and test dashboard, students, batches, attendance, fees, payments, reports, and settings.
4. Sign in with a real teacher; verify assigned-batch access and denial of admin-only operations.
5. Test password reset end to end.
6. Refresh `/login`, `/dashboard`, and `/reset-password/` directly.
7. In DevTools, verify no console errors, mixed content, failed requests, service-role key, or password in page source, network responses, or local storage.
8. Test responsive desktop/mobile layouts and browser back/forward navigation.

Do not mark deployment complete if any feature or policy test fails.

## 6. HTTPS verification

1. Confirm Vercel has a valid certificate and HTTP redirects to HTTPS.
2. Confirm the browser lock icon shows a valid certificate.
3. Confirm `NEXT_PUBLIC_SITE_URL`, Supabase Site URL, and reset redirects use the same canonical HTTPS origin.

## 7. Free backup and recovery

### Backup

Use the Supabase Free project’s available backups plus a manual logical backup stored in private encrypted storage. Never commit dumps containing student data.

With the private database connection string from Supabase:

```powershell
supabase login
supabase link --project-ref <project-ref>
supabase db dump --linked --file backups\academy-$(Get-Date -Format yyyyMMdd-HHmm).sql
```

Keep at least three dated encrypted copies and test one restore monthly.

### Recovery

1. Pause administrative writes.
2. Create a replacement free Supabase project if required.
3. Apply migrations in order, then restore the latest verified SQL dump.
4. Recreate/verify auth users and profile roles; auth credentials are not restored by a public-data dump.
5. Update Vercel Supabase environment variables and redeploy.
6. Re-run the SQL checklist, policy smoke check, and complete Chrome acceptance test.
7. Re-enable staff access only after all checks pass.

Record backup date, project reference, migration version, restore result, and acceptance result in a private operations log.
