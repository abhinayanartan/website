# Technology Stack

## Runtime and framework

- Next.js `^14.2.20` with the App Router.
- React and React DOM `^18.3.1`.
- TypeScript `^5.7.2`, strict mode enabled, bundler module resolution, no emit.
- Node.js runtime is required by Next.js, but no `engines` constraint is declared in `package.json`.

## UI and interaction dependencies

- `framer-motion` `^11.18.2` for entrance, hover, carousel, and modal animations.
- `lucide-react` `^0.468.0` for icon components.
- `next/font/google` for Playfair Display and Inter font loading.
- Tailwind CSS `^3.4.17` with custom purple, gold, vermilion, alabaster, ink, font, gradient, shadow, and breakpoint tokens.

## Build and lint tooling

- Next.js scripts: `dev`, `build`, `start`, and `lint`.
- ESLint `^8.57.1` with `eslint-config-next` `^14.2.20`.
- PostCSS `^8.4.49` with `autoprefixer` `^10.4.20` and Tailwind CSS.
- React/Node type packages: `@types/react` `^18.3.18`, `@types/react-dom` `^18.3.5`, and `@types/node` `^22.10.5`.

## Runtime configuration

- `NEXT_PUBLIC_BASE_PATH` optionally prefixes public assets and icon URLs.
- `NEXT_PUBLIC_SITE_URL` optionally controls the metadata base URL.
- No server API, database driver, ORM, message broker, authentication library, or persistence dependency is declared.

## Current constraints

- The contact form is client-only and simulates submission with a 400 ms timer; it does not call a server endpoint.
- Gallery cards use generated gradient/emblem presentation rather than an image data source.
- Static asset paths must honor `NEXT_PUBLIC_BASE_PATH` for subpath deployments.
