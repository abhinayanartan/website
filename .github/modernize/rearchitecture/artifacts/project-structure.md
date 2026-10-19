# Project Structure

## Project type

Frontend single-page marketing site implemented as a Next.js App Router application. It is not a backend, full-stack service, library, CLI, or monorepo.

## Top-level structure

- `app/` — Next.js App Router entrypoint, root layout, page composition, and global CSS.
- `components/` — presentational and interactive page sections: navigation, hero, academy story, mudra glossary, gallery, contact, footer, and mobile quick actions.
- `lib/content.ts` — canonical static content/configuration source for SEO, page copy, academy contact details, gallery copy, and footer links.
- `content.ts` — compatibility re-export of `lib/content.ts`.
- `public/` — static logos and brand assets.
- `tailwind.config.ts`, `postcss.config.js`, and `app/globals.css` — styling pipeline, theme tokens, and reusable component utility classes.

## Runtime entrypoints

- `app/page.tsx:10` exports `Home`, the root page composition for `GET /`.
- `app/layout.tsx:57` exports `RootLayout`, applying fonts, metadata, viewport configuration, and global CSS.
- Client-side interaction entrypoints are component event handlers and effects in `components/Navbar.tsx`, `components/MudraShowcase.tsx`, `components/Gallery.tsx`, and `components/Contact.tsx`.

## Layering

The page uses a lightweight composition model rather than controller/service/repository layers:

1. Route/layout layer: `app/page.tsx` and `app/layout.tsx`.
2. UI section layer: `components/*.tsx`.
3. Content/configuration layer: `lib/content.ts`.
4. Styling/assets layer: `app/globals.css`, `tailwind.config.ts`, and `public/`.

## Functional areas

- Brand landing and calls to action: Hero, Navbar, MobileActionBar.
- Academy heritage and curriculum messaging: About.
- Interactive Kuchipudi knowledge glossary: MudraShowcase.
- Cultural showcase archive: Gallery with category filter and modal viewer.
- Enrollment/contact conversion: Contact with client-side validation and direct communication links.
- Site navigation and social presence: Footer.
