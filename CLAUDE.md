# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Challengers Cricket Club website — London, Ontario. Next.js 15 (App Router), TypeScript strict mode, Tailwind CSS dark theme with glass morphism, Google Forms for inquiries, Stripe-hosted donation page for payments, NextAuth (Google OAuth) + Firestore for the members portal.

**Organization**: Canada NFP under the CNCA (Corporation #1746974-8, incorporated 12 Nov 2025) | challengerscc.ca | @challengers.cc
**Emails**: `contact@challengerscc.ca` (official Google Workspace), `challengerscricketclub2026@gmail.com` (legacy Gmail used for SMTP outreach)
**Reference docs at root**: `GOOGLE_FORMS_SETUP.md` (form setup guide, partially stale), `SPONSORSHIP_OPPORTUNITIES.md`

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npm start                # Production server
npm run lint             # next lint with next/core-web-vitals preset
npm test                 # vitest run (jsdom, single pass)
npm run test:watch       # vitest watch mode
npm run test:ui          # vitest --ui
npx vitest tests/matchStats.test.ts             # run a single file
npx vitest -t "best batter"                     # run by test-name regex
```

Vitest is configured in `vitest.config.ts` (jsdom env, globals on, `@/*` alias). Setup file: `tests/setup.ts`. Tests live in `tests/` and cover `lib/c3h-access`, the `app/c3h/lib/` pure modules (matchStats, playerAnalysis, coachInsight), the Pavilion `governanceDocs`, scorer types, and the SignaturePad component. `tests/factories.ts` provides `ball()`, `emptyInnings()`, etc. for building `Match` fixtures — use these in new scorer/match tests instead of hand-rolling the shape. No Next.js / Firestore integration tests — keep `app/c3h/lib/` modules pure so they remain unit-testable without mocking Firebase.

## Environment Variables

**Stripe (server-side only)**:
- `STRIPE_SECRET_KEY` — used by `/api/create-checkout` and `/api/payment-details`
- `NEXT_PUBLIC_BASE_URL` — defaults to `http://localhost:3000`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exists in `.env.example` but is **never read** — `@stripe/stripe-js` is in `package.json` but never imported.

**NextAuth (required for /c3h members portal — sessions break in production without all three)**:
- `NEXTAUTH_SECRET` — generate via `openssl rand -base64 32`
- `NEXTAUTH_URL` — must match deployed origin exactly
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth 2.0

**Firebase config is hardcoded** in `lib/firebase.ts` (project: `challengers-c3h`) — no env var needed for the Firestore client. The Firestore project is the source of truth for all C3H data. Security rules now live in `firestore.rules` at the repo root (deploy via Firebase Console paste or `firebase deploy --only firestore:rules`). The app uses Firebase **anonymous auth** to satisfy `request.auth != null`; real per-user access control happens at the NextAuth layer, so rules only do shape validation, append-only enforcement, and email allowlists — the director allowlist in `firestore.rules` must be kept in sync with `C3H_DIRECTOR_ROSTER` in `lib/c3h-access.ts`.

## Deployment

**GitHub**: https://github.com/msaad7777/Challengers-cc — Vercel auto-deploys on push to `main`.
**Deploy URL**: https://vercel.com/challengersccs-projects/challengeers-website

`next.config.ts` is empty — no `images.remotePatterns`, so `next/image` with external URLs will fail.

## Architecture

Path alias `@/*` maps to project root (`import x from '@/components/X'`). Font: Inter via `next/font/google`. Root `app/layout.tsx` sets `metadataBase = https://challengerscc.ca`, injects Google Ads gtag (`AW-18005598397`), and wraps children in `<Providers>` (NextAuth `SessionProvider`).

### The two halves of the app

The codebase has two distinct sub-apps that share the same components and design system but otherwise barely touch:

1. **Public marketing site** — top-level routes (`/`, `/sponsorship`, `/payments`, `/blog`, `/legal`, `/partners/[slug]`, `/schedule`, `/mental-game`, `/looking-for-sponsors`). Anonymous, mostly server components, no auth, no Firestore.
2. **C3H members portal** — everything under `/c3h/*`. Gated by NextAuth Google OAuth (one exception: `/c3h/live` is publicly readable). Reads/writes Firestore (`matches`, `squads`, `availability`, `field-positions`, `reflections`). All pages are client components (`"use client"`) because they use `useSession`.

`/events` and `/watch` are server-side `redirect()` shims that bounce to `/c3h/events` and `/c3h/watch` — keeping the navbar tidy while pushing logged-out visitors through the C3H login flow.

### Auth model (C3H portal)

`SessionProvider` lives **only** at the root layout (`app/providers.tsx`) — never nested per-page. `app/c3h/providers.tsx` exists as a passthrough for legacy imports; do not re-add a SessionProvider there (caused tab-switch logout bugs previously).

Two layered access checks:

1. **Login eligibility** — `app/api/auth/[...nextauth]/route.ts` hardcodes `BOARD_EMAILS` + `PLAYER_EMAILS` whitelists. Anything not on either list is rejected at sign-in. Any `@challengerscc.ca` Workspace address is auto-approved as `board`. Sessions are JWT, 30-day max age. Custom `signIn` / `error` pages: `/c3h/login`.
2. **Board-only UI inside C3H** — `lib/c3h-access.ts` is the single source of truth. Predicates:
   - `isC3HAdmin` — Saad only.
   - `isC3HCaptain` / `isC3HBoard` — admin + designated league captains/VCs. Use this for any board-only mutation surface.
   - `isC3HSquadViewer` — read-only captain view for Treasurer + the shared `contact@` inbox.
   - `isC3HDirector` / `isC3HGovernanceReader` — for Pavilion / governance-signature surfaces, backed by `C3H_DIRECTOR_ROSTER` and `C3H_OFFICER_ROSTER`. Use the `resolveDirectorWorkspaceEmail()` / `resolveOfficerWorkspaceEmail()` helpers to canonicalize a personal-gmail login back to the director's workspace address — Pavilion writes always store the workspace email, never the login email.

   **This is intentionally narrower than the NextAuth board list**: other club board members can sign in as players to mark availability but don't see captain/squad/Pavilion features. Always gate from these predicates — never re-derive from email domain or role string. `contact@challengerscc.ca` is deliberately excluded from `C3H_ADMIN_EMAILS` because the inbox is shared.

   `lib/c3h-roster.ts` is a separate, larger player-roster source used by the availability/squad surfaces — distinct from the director/officer rosters in `c3h-access.ts`.

### C3H Firestore collections

- `matches` — created by the Scorer; `createdBy` is the scorer's email; `status` includes at least `'playing'`, `'innings_break'`, `'completed'`. `/c3h/live` requires Firestore Security Rules to allow public reads on these three statuses (already configured in `firestore.rules` — `matches` allows public read by design).
- `squads/{matchId}` — `{ players, roles, updatedBy, updatedAt }`. Roles enforce single-holder uniqueness (captain/VC/WK) — auto-heals stale data on read.
- `availability/{playerName}` — player-keyed (not email-keyed)
- `field-positions/{matchId}` — Field Editor state
- `reflections` — Nets reflections
- `governance_signatures` — append-only Pavilion signatures. Doc id encodes `{docId}_{docVersion}_{signerWorkspaceEmail}`; rules enforce append-only (no update, no delete) and director-allowlist on create.
- `officer_appointments` — Officer Hub appointments produced from the Pavilion flow.

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

**C3H members portal** (all client components; all gated except `/c3h/live`):
- `/c3h` — auto-redirects authenticated users to `/dashboard`; otherwise shows public marketing intro
- `/c3h/login` — Google sign-in
- `/c3h/dashboard` — landing after login; branches by `isC3HBoard()`
- `/c3h/availability` — player availability per match. Match list (`ALL_MATCHES`) is hardcoded in this file with `fullDate`, `venue`, `clash` fields. Adds Google Calendar invites via `VENUE_FULL_NAME` lookup.
- `/c3h/scorer` — live ball-by-ball scoring, writes to `matches`. Auto-save with status indicator. Takeover confirmation when claiming a match someone else started. Auto-shows the bowler-pick modal at every over boundary; enforces "no consecutive overs by the same bowler".
- `/c3h/live` — **publicly readable** read-only scoreboard, subscribes to in-flight `matches` via `onSnapshot`, plus shows the `MatchSummary` card on completed matches. The only `/c3h/*` page that does not require login.
- `/c3h/nets` — Pavilion reflections + coach-level review form. Match dropdown lists actual completed `matches` from Firestore (not just generic "Practice"); selecting one auto-pulls the player's batting/bowling stats from the match document. Renders `PlayerCoachCard` (per-player rule-based analysis) and an "Auto Coach Insight" derived from the reflection form. Writes to `reflections`.
- `/c3h/replays` — lists completed matches from Firestore for replay/review.
- `/c3h/pavilion` — director-only governance hub. Renders the documents listed in `app/c3h/pavilion/governanceDocs.ts` (IP Ownership Acknowledgement, Software Licence Agreement, Resolutions, Letters of Direction). Collects typed or drawn signatures via `SignaturePad.tsx`, writes append-only to `governance_signatures`. Saad has a separate "licensor" signing track because he is the personal IP licensor counterparty and is recused from signing on the CCC side (see `conflictedSigners` + `requiresLicensorSignature` on each `GovernanceDoc`).

  **Letters of Direction (bank signing-authority workflow)**: per CIBC, a signing authority does not need to be a director — any individual approved by the directors can be added by submitting a Letter of Direction signed by all 5 directors. LoDs are modeled as `GovernanceDoc` entries where multiple recipients being added in the same operational change live in a **single combined Letter** (e.g. `lod-cibc-gokul-qaiser-2026` adds both Gokul Prakash as a co-signing director and Qaiser Qureshi as Treasurer/non-director officer in one document). Inline renderer lives in `app/c3h/pavilion/LetterOfDirection.tsx`; the older wet-sign template at `public/documents/letter-of-direction-template.html` is the print-fallback reference. All five directors must sign in the Pavilion (`whoMustSign: 'all-directors'`, no conflict recusals — Saad signs as a director, distinct from his IP-licensor recusal on the Software Licence Agreement); once complete, the signed Letter is exported as a PDF on club letterhead and emailed to each recipient's personal Gmail for in-person submission to the branch. Bank governance policy is **dual-signatory** — additional authorities are added under this policy, not as sole signers. OTPs are tied to the registered signing authority's personal phone (CIBC small-business: no email OTP); each authority gets their own debit card. Transactions in the bank statement display the name of the authority who initiated them — this is a CIBC display behavior and is not editable; the account remains a club account.
- `/c3h/officer-hub` — director-only officer-appointment UI (`OfficerAppointment.tsx`) backed by `C3H_OFFICER_ROSTER` and writes to `officer_appointments`.
- `/c3h/admin/signatures` — admin-only Pavilion signature audit / cleanup surface.
- `/c3h/rulebooks` — static rulebook references.
- `/c3h/watch`, `/c3h/profile`, `/c3h/events`, `/c3h/field-editor`, `/c3h/receipts`

When adding director / governance work, bump the `version` field on the `GovernanceDoc` rather than mutating in place — bumping the version triggers a fresh re-signing cycle because `governance_signatures` doc ids include the version.

**Per-portal helpers in `app/c3h/lib/`** — all pure-function / pure-component modules; no Firestore reads, so they can run server- or client-side off any `Match`:
- `matchStats.ts` — per-player batting/bowling aggregates plus MVP / Best Batter / Best Bowler / Best Fielder / match-impact rankings from a `Match` document.
- `MatchSummary.tsx` — renders the above into a card; used by `/c3h/live` and the Scorer scorecard view.
- `playerAnalysis.ts` — per-player match analysis + rule-based coach feedback (rules keyed off dismissal type, SR vs team SR, economy vs team econ, dot-ball pressure, position-relative par-score). Includes `findPlayerName(sessionName, sessionEmail, rosters)` for resolving the logged-in user's name to a roster entry.
- `coachInsight.ts` — rule-based "Auto Coach Insight" generated from the Nets reflection form (technical mistake → plan failure → fix → next-innings plan). No LLM, deterministic, zero per-request cost.
- `PlayerCoachCard.tsx` — UI card rendering `playerAnalysis` output.

When adding rule-based analysis, extend these modules — keep them LLM-free and pure so they remain auditable and offline-safe.

### API Routes

- **`/api/auth/[...nextauth]`** — NextAuth Google OAuth handler (see Auth model above)
- **`/api/create-checkout`** (POST) — creates Stripe Checkout sessions. Lazy Stripe init to avoid build-time errors on Vercel. Currency: CAD. **Not currently called by any frontend** — `/payments` uses the Stripe-hosted donation link directly. Defines the only `CartItem` interface in the repo.
- **`/api/payment-details`** (GET, `?session_id=`) — retrieves session details for the success page; expands `payment_intent.latest_charge` to surface Stripe receipt URL. Returns raw Unix timestamp.
- **`/api/youtube-videos`** — fetches RSS feed for channel `UCtoiAMFhqTeQ-uPN46BJo5Q`, parses `<entry>` blocks via regex (no XML parser dep). `revalidate = 3600`. Returns `{ videos: [] }` on upstream failure rather than erroring (200 status).

### Server vs client components

Default-server (no `"use client"`): About, BoardMembers, Footer, LegalDocuments, Partners, Programs, SponsorshipBanner, LiveStreaming, Clubhouse.
Client (`"use client"`): Navbar, Hero, Registration, Contact, VerifiedNonprofit (uses `canvas-confetti` + IntersectionObserver), VerifiedBanner, UserMenu, PublicLiveScore (homepage live-match strip — subscribes to in-flight `matches` via `onSnapshot`), and **all** `app/c3h/**/*.tsx` pages.

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
