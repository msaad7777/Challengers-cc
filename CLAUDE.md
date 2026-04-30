# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Challengers Cricket Club website — London, Ontario. Next.js 15 (App Router), TypeScript strict mode, Tailwind CSS dark theme with glass morphism, Google Forms for inquiries, Stripe-hosted donation page for payments, NextAuth (Google OAuth) + Firestore for the members portal.

**Organization**: Ontario NFP Corporation #1746974-8 | challengerscc.ca | @challengers.cc
**Emails**: `contact@challengerscc.ca` (official Google Workspace), `challengerscricketclub2026@gmail.com` (legacy Gmail used for SMTP outreach)
**Reference docs at root**: `GOOGLE_FORMS_SETUP.md` (form setup guide, partially stale), `SPONSORSHIP_OPPORTUNITIES.md`

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server (http://localhost:3000)
npm run build      # Production build
npm start          # Production server
npm run lint       # next lint with next/core-web-vitals preset
```

No test framework is configured. There are no unit or integration tests.

## Environment Variables

**Stripe (server-side only)**:
- `STRIPE_SECRET_KEY` — used by `/api/create-checkout` and `/api/payment-details`
- `NEXT_PUBLIC_BASE_URL` — defaults to `http://localhost:3000`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exists in `.env.example` but is **never read** — `@stripe/stripe-js` is in `package.json` but never imported.

**NextAuth (required for /c3h members portal — sessions break in production without all three)**:
- `NEXTAUTH_SECRET` — generate via `openssl rand -base64 32`
- `NEXTAUTH_URL` — must match deployed origin exactly
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth 2.0

**Firebase config is hardcoded** in `lib/firebase.ts` (project: `challengers-c3h`) — no env var needed for the Firestore client. The Firestore project is the source of truth for all C3H data; security rules live in the Firebase console, not the repo.

## Deployment

**GitHub**: https://github.com/msaad7777/Challengers-cc — Vercel auto-deploys on push to `main`.
**Deploy URL**: https://vercel.com/challengersccs-projects/challengeers-website

`next.config.ts` is empty — no `images.remotePatterns`, so `next/image` with external URLs will fail.

## Architecture

Path alias `@/*` maps to project root (`import x from '@/components/X'`). Font: Inter via `next/font/google`. Root `app/layout.tsx` sets `metadataBase = https://challengerscc.ca`, injects Google Ads gtag (`AW-18005598397`), and wraps children in `<Providers>` (NextAuth `SessionProvider`).

### The two halves of the app

The codebase has two distinct sub-apps that share the same components and design system but otherwise barely touch:

1. **Public marketing site** — top-level routes (`/`, `/sponsorship`, `/payments`, `/blog`, `/legal`, `/partners/[slug]`, `/schedule`, `/mental-game`, `/looking-for-sponsors`). Anonymous, mostly server components, no auth, no Firestore.
2. **C3H members portal** — everything under `/c3h/*`. Gated by NextAuth Google OAuth. Reads/writes Firestore (`matches`, `squads`, `availability`, `field-positions`, `reflections`). All pages are client components (`"use client"`) because they use `useSession`.

`/events` and `/watch` are server-side `redirect()` shims that bounce to `/c3h/events` and `/c3h/watch` — keeping the navbar tidy while pushing logged-out visitors through the C3H login flow.

### Auth model (C3H portal)

`SessionProvider` lives **only** at the root layout (`app/providers.tsx`) — never nested per-page. `app/c3h/providers.tsx` exists as a passthrough for legacy imports; do not re-add a SessionProvider there (caused tab-switch logout bugs previously).

Two layered access checks:

1. **Login eligibility** — `app/api/auth/[...nextauth]/route.ts` hardcodes `BOARD_EMAILS` + `PLAYER_EMAILS` whitelists. Anything not on either list is rejected at sign-in. Any `@challengerscc.ca` Workspace address is auto-approved as `board`. Sessions are JWT, 30-day max age. Custom `signIn` / `error` pages: `/c3h/login`.
2. **Board-only UI inside C3H** — `lib/c3h-access.ts` defines `isC3HAdmin`, `isC3HCaptain`, `isC3HBoard`. **This is intentionally narrower than the NextAuth board list**: other club board members (Gokul, Madhu, Ankush, Roman, Qaiser) can sign in as players to mark availability but don't see captain/squad/Pavilion features. When gating a board-only feature, always use `isC3HBoard()` from `lib/c3h-access.ts` — never re-derive from email domain or role string.

### C3H Firestore collections

- `matches` — created by the Scorer; `createdBy` is the scorer's email; `status` ∈ `{...,'playing',...}`
- `squads/{matchId}` — `{ players, roles, updatedBy, updatedAt }`. Roles enforce single-holder uniqueness (captain/VC/WK) — auto-heals stale data on read.
- `availability/{playerName}` — player-keyed (not email-keyed)
- `field-positions/{matchId}` — Field Editor state
- `reflections` — Pavilion reflections

When reading these, prefer `onSnapshot` for live views and `getDocs` for one-shot loads — both patterns are already in use; match the surrounding page's style.

### Pages

**Public:**
- **/** — Homepage composes 12 sections in order: Navbar → Hero → About → VerifiedBanner → SponsorshipBanner → Programs → LiveStreaming → Partners → BoardMembers → Registration → Contact → LegalDocuments → Footer
- **/sponsorship** — tiers + inquiry form (self-contained client page)
- **/payments** — info-only; "Proceed to Payment" links to `STRIPE_DONATION_LINK` (Stripe-hosted), with a secondary Zeffy link (`ZEFFY_DONATION_LINK`)
- **/payments/success** — receipt with print, calls `/api/payment-details` (uses `<Suspense>` for `useSearchParams`, required by Next 15)
- **/payments/cancel**
- **/looking-for-sponsors** — 2026 sponsor recruitment landing page
- **/blog** + **/blog/[slug]** — content from `app/blog/data.ts` (in-repo; no CMS)
- **/legal** — index + 7 sub-pages (`bylaws`, `code-of-conduct`, `conflict-of-interest`, `financial-policy`, `liability-waiver`, `privacy`, `volunteer-agreement`)
- **/partners/[slug]** — partner pages from `app/partners/data.ts` (sponsor tier, hours, order links)
- **/schedule**, **/mental-game** — standalone pages
- **/events**, **/watch** — `redirect()` shims to C3H equivalents

**C3H members portal** (all client components, all gated):
- `/c3h` — auto-redirects authenticated users to `/dashboard`; otherwise shows public marketing intro
- `/c3h/login` — Google sign-in
- `/c3h/dashboard` — landing after login; branches by `isC3HBoard()`
- `/c3h/availability` — player availability per match. Match list (`ALL_MATCHES`) is hardcoded in this file with `fullDate`, `venue`, `clash` fields. Adds Google Calendar invites via `VENUE_FULL_NAME` lookup.
- `/c3h/scorer` — live ball-by-ball scoring, writes to `matches`. Auto-save with status indicator. Takeover confirmation when claiming a match someone else started.
- `/c3h/nets`, `/c3h/replays`, `/c3h/watch`, `/c3h/profile`, `/c3h/events`, `/c3h/field-editor`, `/c3h/receipts`

### API Routes

- **`/api/auth/[...nextauth]`** — NextAuth Google OAuth handler (see Auth model above)
- **`/api/create-checkout`** (POST) — creates Stripe Checkout sessions. Lazy Stripe init to avoid build-time errors on Vercel. Currency: CAD. **Not currently called by any frontend** — `/payments` uses the Stripe-hosted donation link directly. Defines the only `CartItem` interface in the repo.
- **`/api/payment-details`** (GET, `?session_id=`) — retrieves session details for the success page; expands `payment_intent.latest_charge` to surface Stripe receipt URL. Returns raw Unix timestamp.
- **`/api/youtube-videos`** — fetches RSS feed for channel `UCtoiAMFhqTeQ-uPN46BJo5Q`, parses `<entry>` blocks via regex (no XML parser dep). `revalidate = 3600`. Returns `{ videos: [] }` on upstream failure rather than erroring (200 status).

### Server vs client components

Default-server (no `"use client"`): About, BoardMembers, Footer, LegalDocuments, Partners, Programs, SponsorshipBanner, LiveStreaming, Clubhouse.
Client (`"use client"`): Navbar, Hero, Registration, Contact, VerifiedNonprofit (uses `canvas-confetti` + IntersectionObserver), VerifiedBanner, UserMenu, and **all** `app/c3h/**/*.tsx` pages.

### Design System

**Colors** (`tailwind.config.ts`): `primary` (cricket green #10b981), `accent` (gold #eab308)

**Custom utilities** (`globals.css`):
- `.glass` / `.glass-hover` — bg-white/5, backdrop-blur
- `.gradient-text` — primary→accent gradient
- `.section-padding` — py-20 md:py-32
- `.flip-card` family — defined but unused

**Animations**: `fade-in`, `slide-up`, `slide-in-right`, `float`

**Common patterns**:
- Cards: `glass rounded-2xl p-8 glass-hover`
- Buttons: `bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105`
- Inputs: `bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
- Section headers: `<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">Text <span className="gradient-text">Gradient</span></h2>`

### Google Forms Integration

Two submission techniques in use — pick to match the existing component you're editing:
1. **Registration.tsx**: hidden `<iframe>` + native `form target` POST to `GOOGLE_FORM_URL` with entry IDs as `name=` attrs; success after `setTimeout(1000)`.
2. **Contact.tsx** + Sponsorship page: `fetch(GOOGLE_FORM_ACTION, { mode: 'no-cors', method: 'POST' })` with `ENTRY_IDS` constants.

Setup: form ID from URL → inspect fields for `entry.123…` IDs → update constants. `GOOGLE_FORMS_SETUP.md` at the repo root has the detailed walkthrough (partially stale — Contact and Sponsorship are now configured).

### Stripe payment flow

`/payments` links straight to a Stripe-hosted donation page (`STRIPE_DONATION_LINK`). On success Stripe redirects to `/payments/success?session_id=...` which calls `/api/payment-details` to render the receipt. The `create-checkout` route exists but is dormant.

### Known duplication and gotchas

- **Sponsorship tiers** live in three places: `app/payments/page.tsx` (`SPONSORSHIP_TIERS`, display only), `app/sponsorship/page.tsx` (full benefits/colors/icons), and `app/partners/data.ts` (per-partner sponsor tier). Keep amounts in sync by hand.
- **Social media links** (Instagram, Facebook, YouTube) are hardcoded in 6+ locations — no centralized constant.
- **Programs "Learn More" buttons** are non-functional `<button>` elements with no `href`/`onClick`.
- **Legal PDFs** referenced by `LegalDocuments.tsx` belong in `/public/documents/` but are at the project root; all four entries currently have `available: false`. The actual legal content lives in `/legal/*` pages, not the PDFs.
- **Footer broken links**: Twitter `href="#"`, Privacy/Terms also `href="#"` (the real Privacy lives at `/legal/privacy`).
- **Project root contains 30+ untracked personal/legal files** (IDs, incorporation docs, bylaws PDFs, sponsor logos, `.xlsx` spreadsheets, `client_secret_*.json`). `.gitignore` covers most patterns but new files may slip through. **Always check `git status` before committing**; never stage outside `app/`, `components/`, `public/`, `lib/`, `scripts/`, or top-level config files.
- **`@stripe/stripe-js`** is in `package.json` but never imported — only the server-side `stripe` package is used.
- **`next.config.ts` is empty** — no `images.remotePatterns`. External-URL `next/image` will fail.
- **`scripts/`** holds Firestore one-off maintenance scripts (e.g. `clean-lpl-roles.mjs`) that re-init Firebase with the same hardcoded config from `lib/firebase.ts`. They're meant to be run manually with `node scripts/<name>.mjs`, not part of the build.

## Common tasks

**Add a public section**: create `components/SectionName.tsx` → import in `app/page.tsx` → use `.section-padding`.

**Add a C3H feature**: create `app/c3h/<feature>/page.tsx` with `"use client"`, use `useSession()` to gate, redirect to `/c3h/login` if unauthenticated, gate board-only UI with `isC3HBoard()` from `@/lib/c3h-access`. Read/write Firestore via `db` from `@/lib/firebase`.

**Update colors**: `tailwind.config.ts` → `theme.extend.colors`.

**Update Google Form constants**: `GOOGLE_FORM_ACTION` / `GOOGLE_FORM_URL` and `ENTRY_IDS` in the relevant component.

**Board members**: edit `boardMembers` array in `BoardMembers.tsx` (name, title, role, bio, image path or null, initials).

**Legal doc surfaces**: edit content directly in `app/legal/<slug>/page.tsx`. `LegalDocuments.tsx` is the homepage card grid that points to those pages.

**Static assets**: `/public/...` (images, videos), `/public/documents/` (PDFs). Reference with leading slash (`/image.jpg`).

**Payment display amounts**: edit `PAYMENT_OPTIONS` and `SPONSORSHIP_TIERS` in `app/payments/page.tsx`. Actual charge amounts are configured on the Stripe-hosted donation page, not in code.

**C3H login allowlist**: edit `BOARD_EMAILS` / `PLAYER_EMAILS` in `app/api/auth/[...nextauth]/route.ts`. Edit `lib/c3h-access.ts` separately to grant board-only UI inside C3H.

**Match schedule (C3H availability page)**: edit the `ALL_MATCHES` array near the top of `app/c3h/availability/page.tsx`.
