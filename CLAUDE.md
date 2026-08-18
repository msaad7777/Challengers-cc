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
npx tsc --noEmit                                # typecheck only (no npm script for this)
```

There is no `typecheck` npm script — `npm run build` is the only thing that type-checks in CI, so run `npx tsc --noEmit` before pushing anything non-trivial.

Vitest is configured in `vitest.config.ts` (jsdom env, globals on, `@/*` alias). Setup file: `tests/setup.ts`. The `include` globs also pick up `app/**/*.test.{ts,tsx}` and `lib/**/*.test.{ts,tsx}`, but every test currently lives in `tests/` — keep it that way. Tests cover `lib/c3h-access`, the `app/c3h/lib/` pure modules (matchStats, playerAnalysis, coachInsight, nextMatchInsight, matchPlan, playerTracker, plus the NeuroVision primitives: fieldScanner, perceptualStaircase, mot, warmup, juggling, followAlong, powerHitting, mindset, visualization), the Pavilion `governanceDocs`, scorer types, and the SignaturePad component. `tests/factories.ts` provides `ball()`, `emptyInnings()`, etc. for building `Match` fixtures — use these in new scorer/match tests instead of hand-rolling the shape. No Next.js / Firestore integration tests — keep `app/c3h/lib/` modules pure so they remain unit-testable without mocking Firebase.

Two conventions hold across `app/c3h/lib/`, and new modules are expected to follow them:
- **One test file per module.** Every `app/c3h/lib/<name>.ts` has a sibling `tests/<name>.test.ts`. Adding a module means adding its test file.
- **Randomness is injected, never imported.** Anything non-deterministic takes an `rng: () => number` parameter (e.g. `generateField(rng)` in `fieldScanner.ts`); the UI passes `Math.random`, tests pass a seeded generator. Never call `Math.random()` or `Date.now()` inside these modules.

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

`next.config.ts` is a bare stub (`const nextConfig: NextConfig = {}`) — no `images.remotePatterns`, so `next/image` with external URLs will fail.

## Architecture

Path alias `@/*` maps to project root (`import x from '@/components/X'`). Font: Inter via `next/font/google`. Root `app/layout.tsx` sets `metadataBase = https://challengerscc.ca`, injects Google Ads gtag (`AW-18005598397`), and wraps children in `<Providers>` (NextAuth `SessionProvider`).

### The two halves of the app

The codebase has two distinct sub-apps that share the same components and design system but otherwise barely touch:

1. **Public marketing site** — top-level routes (`/`, `/sponsorship`, `/payments`, `/blog`, `/legal`, `/partners/[slug]`, `/schedule`, `/looking-for-sponsors`). Anonymous and mostly server components. **Two exceptions where the "public" half reaches into auth + Firestore**: the homepage `PublicLiveScore` strip (`onSnapshot` on in-flight `matches`) and the `/legal/*` e-sign blocks (see *Legal e-sign blocks* below).
2. **C3H members portal** — everything under `/c3h/*`. Gated by NextAuth Google OAuth (one exception: `/c3h/live` is publicly readable). Reads/writes Firestore (`matches`, `squads`, `availability`, `field-positions`, `reflections`, `match_plans`, `shot-plans`, plus the governance collections). All pages are client components (`"use client"`) because they use `useSession`.

**Portal nomenclature** — the dashboard names four areas that map to routes; users and issues refer to them by name, not path: **The Nets** → `/c3h/nets`, **The Dugout** → `/c3h/availability`, **The Scoreboard** → `/c3h/scorer` + `/c3h/live`, **The Pavilion** → `/c3h/pavilion`.

`/events`, `/watch`, and `/mental-game` are server-side `redirect()` shims that bounce to their `/c3h/*` equivalents — keeping the navbar tidy while pushing logged-out visitors through the C3H login flow. **The shim is also where the page's `metadata` lives**: the C3H target is a `"use client"` component and client components can't export `metadata`, so the public shim is what link previews and search engines actually see. When moving a public page behind the C3H gate, carry its `metadata` export onto the shim rather than dropping it (that's the pattern `app/mental-game/page.tsx` follows). `app/c3h/layout.tsx` carries the portal-wide `metadata` for the same reason — it is a server component wrapping the client pages.

### Auth model (C3H portal)

`SessionProvider` lives **only** at the root layout (`app/providers.tsx`) — never nested per-page. `app/c3h/providers.tsx` exists as a passthrough for legacy imports; do not re-add a SessionProvider there (caused tab-switch logout bugs previously).

**Firebase anonymous auth must be awaited before any one-shot Firestore read.** `lib/firebase.ts` exports `firebaseAuthReady()` alongside `db`. Firestore rules require `request.auth != null`, which anonymous auth supplies, but sign-in is async and kicks off at module load. A `getDocs`/`getDoc` fired on mount can beat it and fail with permission-denied, leaving the page silently rendering empty data. Every page doing a mount-time read already does `await firebaseAuthReady()` first (scorer, availability, replays, admin/signatures, officer-hub, neurovision, Resolutions, the legal sign blocks) — follow that pattern in any new surface. `onSnapshot` subscriptions retry on their own and don't need it.

**There is no `middleware.ts` and no `getServerSession` call anywhere in the app.** Every `/c3h/*` gate is client-side (`useSession()` inside a `"use client"` page), so the pages themselves are not server-protected — a logged-out visitor can fetch the route, they just get redirected by the component. The real enforcement boundary is `firestore.rules` plus the NextAuth `signIn` callback. Treat any new C3H surface the same way: the UI gate is UX, the rules file is security. Never let a rule rely on the UI having gated the write.

Two layered access checks:

1. **Login eligibility** — `app/api/auth/[...nextauth]/route.ts` hardcodes `BLOCKED_EMAILS` + `BOARD_EMAILS` + `PLAYER_EMAILS` whitelists, checked in that order. `BLOCKED_EMAILS` (checked first) hard-denies former members even if their address would otherwise match — currently `contact@challengerscc.ca` (shared inbox) plus Qaiser / Madhu / Shoeb. The **blanket `@challengerscc.ca` domain auto-approve was removed 2026-07-27** (Qaiser account-compromise incident): a new director/officer must now be added explicitly to `BOARD_EMAILS`, not just given a Workspace address. Anything not on any list is rejected at sign-in. Sessions are JWT, 30-day max age. Custom `signIn` / `error` pages: `/c3h/login`.
2. **Board-only UI inside C3H** — `lib/c3h-access.ts` is the single source of truth. Predicates:
   - `isC3HAdmin` — Saad only.
   - `isC3HCaptain` / `isC3HBoard` — admin + designated league captains/VCs. Use this for any board-only mutation surface.
   - `isC3HSquadViewer` — read-only captain view for the shared `contact@` inbox (the Treasurer slot is currently vacant).
   - `isC3HDirector` / `isC3HGovernanceReader` — for Pavilion / governance-signature surfaces, backed by `C3H_DIRECTOR_ROSTER` and `C3H_OFFICER_ROSTER`. Use the `resolveDirectorWorkspaceEmail()` / `resolveOfficerWorkspaceEmail()` helpers to canonicalize a personal-gmail login back to the director's workspace address — Pavilion writes always store the workspace email, never the login email.
   - `isC3HPresident` — roster-driven (the `'President'` role in `C3H_OFFICER_ROSTER`, currently Gokul). Gates the Pavilion "ready to send" sign-off on externally-submitted docs (LoDs). Keep in sync with `presidentEmails()` in `firestore.rules`.

   **This is intentionally narrower than the NextAuth board list**: other club board members can sign in as players to mark availability but don't see captain/squad/Pavilion features. Always gate from these predicates — never re-derive from email domain or role string. `contact@challengerscc.ca` is deliberately excluded from `C3H_ADMIN_EMAILS` because the inbox is shared.

   `lib/c3h-roster.ts` is a separate, larger player-roster source used by the availability/squad surfaces — distinct from the director/officer rosters in `c3h-access.ts`.

### C3H Firestore collections

- `matches` — created by the Scorer; `createdBy` is the scorer's email; `status` includes at least `'playing'`, `'innings_break'`, `'completed'`. `/c3h/live` requires Firestore Security Rules to allow public reads on these three statuses (already configured in `firestore.rules` — `matches` allows public read by design).
- `squads/{matchId}` — `{ players, roles, updatedBy, updatedAt }`. Roles enforce single-holder uniqueness (captain/VC/WK) — auto-heals stale data on read.
- `availability/{playerName}` — player-keyed (not email-keyed)
- `field-positions/{matchId}` — Field Editor state
- `match_plans/{matchId}` — captain/VC pre-match plan from the Nets **Match Plan** tab (playing XI, roles, toss-outcome plans)
- `shot-plans/{playerEmail}` — per-player shot-plan preferences from the Nets coaching tabs. ⚠️ **`firestore.rules` has no `shot-plans` block**, so these reads/writes (`app/c3h/nets/page.tsx`) currently hit the catch-all default-deny at the bottom of the rules file. Add a block before relying on this collection.
- `reflections` — Nets reflections
- `governance_signatures` — append-only Pavilion signatures. Doc id encodes `{docId}_{docVersion}_{signerWorkspaceEmail}`; rules enforce append-only (no update, no delete) and director-allowlist on create.
- `governance_approvals` — President "ready to send" status for externally-submitted docs (the CIBC LoDs, flagged `requiresPresidentApproval` on the `GovernanceDoc`). One mutable doc per `{docId}__v{version}` with `status: 'ready' | 'held'`. Directors' signatures *authorise* an LoD; the President's sign-off *authorises its dispatch* — only after all 5 sign. President-only writes (gated by `isC3HPresident` in UI + `presidentEmails()` in rules); never deletable. The LoD print/PDF toolbar shows "ready to submit" only when fully signed **and** marked ready.
- `governance_revocations` — append-only signature **withdrawals**. A director can revoke their own Pavilion signature; because `governance_signatures` is append-only (never deleted), a revocation is a *new* event keyed identically to the signature it retracts (`{docId}__v{version}__{signerWorkspaceEmail}`). The Pavilion treats a signature as inactive once a matching revocation exists (so `signedCount` and the print/PDF exports both drop revoked signers). Re-signing at the same version is intentionally unsupported — bump `GovernanceDoc.version` for a fresh signing cycle. Same director-allowlist + append-only rules as signatures.
- `officer_appointment_signatures/{userKey}` — Officer Hub appointments produced from the Pavilion flow (`app/c3h/officer-hub/page.tsx`, `COLLECTION` constant). There is no `officer_appointments` collection despite the page's naming.
- `neurovision_progress/{userKey}` — per-player NeuroVision Lab score history (written by `/c3h/neurovision`). The rules block exists in `firestore.rules`; confirm the file has actually been **deployed** — saves fail silently otherwise.
- Per-user legal-acknowledgement signature collections (each keyed by a sanitized email, own rules block in `firestore.rules`): `volunteer_agreement_signatures`, `liability_waiver_signatures`, `code_of_conduct_signatures`, `coi_declarations`, `photography_consent_signatures`, plus `pavilion_onboarding`. Written from the public `/legal/*` pages — see *Legal e-sign blocks*.
- `board_resolutions` — director propose/vote board resolutions from the Pavilion **Board Resolutions** view (`Resolutions.tsx`).

`firestore.rules` ends with a `match /{document=**} { allow read, write: if false; }` catch-all, so **a collection with no explicit rules block is fully denied** — adding a new collection always means adding a rules block *and* deploying the file. Deploy failures are silent in the UI (writes just reject).

When reading these, prefer `onSnapshot` for live views and `getDocs` for one-shot loads — both patterns are already in use; match the surrounding page's style.

### Legal e-sign blocks

The `/legal/*` document pages are static content, but five of them mount a client-side signing widget that requires a NextAuth login and writes to Firestore:

- `app/legal/_shared/DocumentSignBlock.tsx` — the **generic** e-sign block. Handles auth gating, existing-signature read, the signed/print view, and `SignaturePad` (typed + drawn). Consumers pass `docId` / `docVersion` / `collection`, plus optional `renderExtraFields`, `validateExtra`, and `renderSignedExtra` for doc-specific inputs (DOB, emergency contact, opt-out). Used by `code-of-conduct`, `conflict-of-interest`, `liability-waiver`, and `photography-consent`.
- `app/legal/volunteer-agreement/SignBlock.tsx` — predates the shared block and **duplicates it by hand**. If you touch signing behaviour, port this one onto `DocumentSignBlock` rather than patching both.
- Each SignBlock owns a `DOC_ID` / `DOC_VERSION` / `COLLECTION` triple. **Bump `DOC_VERSION` on any material content change** — the version is stored alongside each signature so acknowledgements stay auditable, and the Pavilion can flag version mismatches.
- Signer identity is canonicalized through `resolveDirectorWorkspaceEmail()` / `resolveOfficerWorkspaceEmail()` before writing, same as the Pavilion — a personal-gmail login is stored under the workspace address.
- `app/legal/_shared/` also holds `GovernanceStatusCallout.tsx` and `PrintButton.tsx`; `app/legal/LegalDocsGrid.tsx` is the `/legal` index and reads across the signature collections to show per-document status.

### Pages

**Public:**
- **/** — Homepage composes, in order: Navbar → PublicLiveScore (live-match strip, auto-hides when no match is active) → Hero → About → VerifiedBanner → SponsorshipBanner → Programs → LiveStreaming → Partners → BoardMembers → Registration → Contact → LegalDocuments → Footer
- **/sponsorship** — tiers + inquiry form (self-contained client page)
- **/payments** — info-only; "Proceed to Payment" links to `STRIPE_DONATION_LINK` (Stripe-hosted). The secondary Zeffy donation option was removed (commit `fd8e5d6`)
- **/payments/success** — receipt with print, calls `/api/payment-details` (uses `<Suspense>` for `useSearchParams`, required by Next 15)
- **/payments/cancel**
- **/looking-for-sponsors** — 2026 sponsor recruitment landing page
- **/blog** + **/blog/[slug]** — content from `app/blog/data.ts` (in-repo; no CMS)
- **/legal** — index (`LegalDocsGrid.tsx`) + 10 sub-pages (`bylaws`, `code-of-conduct`, `conflict-of-interest`, `financial-policy`, `ip-ownership`, `liability-waiver`, `photography-consent`, `privacy`, `terms-of-service`, `volunteer-agreement`). Each page footers its own version line (e.g. Financial Policy is at v1.3, effective 19 June 2026)
- **/partners/[slug]** — partner pages from `app/partners/data.ts` (sponsor tier, hours, order links)
- **/schedule** — standalone page
- **/events**, **/watch**, **/mental-game** — `redirect()` shims to C3H equivalents (each holds the `metadata` for its gated target)

**C3H members portal** (all client components; all gated except `/c3h/live`):
- `/c3h` — auto-redirects authenticated users to `/dashboard`; otherwise shows public marketing intro
- `/c3h/login` — Google sign-in
- `/c3h/dashboard` — landing after login; branches by `isC3HBoard()`
- `/c3h/availability` — player availability per match. Match list (`ALL_MATCHES`) is hardcoded in this file with `fullDate`, `venue`, `clash` fields. Adds Google Calendar invites via `VENUE_FULL_NAME` lookup. Also hosts the captain-only **Player Tracker** tab (games played per league + playoff eligibility, backed by `app/c3h/lib/playerTracker.ts`): squad-driven, only counts matches already played (date-gated, not future plans), surfaces Former players (Qaiser/Madhu) for recording past games, and exports a printable PDF. Captains can also record the actual Playing 12 ("Finalize & Add to Tracker") independently of the availability responses.
- `/c3h/scorer` — live ball-by-ball scoring, writes to `matches`. Auto-save with status indicator. Takeover confirmation when claiming a match someone else started. Auto-shows the bowler-pick modal at every over boundary; enforces "no consecutive overs by the same bowler".
- `/c3h/live` — **publicly readable** read-only scoreboard, subscribes to in-flight `matches` via `onSnapshot`, plus shows the `MatchSummary` card on completed matches. The only `/c3h/*` page that does not require login.
- `/c3h/nets` — the club's coaching hub, a large single-file tabbed surface (`app/c3h/nets/page.tsx` is ~6.5k lines; treat it as the one place all player-development content lives). Tabs:
  - **Reflection** — the original post-match reflection + coach-level review form. Match dropdown lists actual completed `matches` from Firestore (not just generic "Practice"); selecting one auto-pulls the player's batting/bowling stats from the match document. Renders `PlayerCoachCard` (per-player rule-based analysis) and an "Auto Coach Insight" derived from the reflection form. Full reflection history is preserved with per-card Edit / Delete. Writes to `reflections`.
  - **Batting Principles / Shot Mechanics / Team Roles** — static, in-app coaching content (player-facing role briefs, shot deep-dives, batting masterclass cards). Pure JSX — no Firestore. "Recommended for You" maps a player's reflection mistakes to relevant Batting Principles.
  - **Match Plan** — captain/VC pre-match planner (gated to captain-level access via `isC3HCaptain`). Auto-fills captain + VC from the selected league, covers all 4 toss outcomes, has a one-click "Apply T30 template", and a Match Coverage tracker over all 26 season matches showing reflection status. Persists to `match_plans/{matchId}`.
  - Per-player shot-plan preferences persist to `shot-plans/{playerEmail}`.
- `/c3h/replays` — lists completed matches from Firestore for replay/review.
- `/c3h/pavilion` — director-only governance hub. Renders the documents listed in `app/c3h/pavilion/governanceDocs.ts` — currently the **Technology Governance Record** (neutral custodianship record covering domain, Workspace, Vercel, Firebase, Stripe, member data, and the source-code repo), the per-recipient **CIBC Letter of Direction** (`lod-cibc-gokul-2026`, which `carryForwardFrom` the retired combined `lod-cibc-gokul-qaiser-2026` — the companion `lod-cibc-qaiser-2026` was retired 2026-06-22 when Qaiser left the Club), and the **Director Resolution & Appointment of President** for Gokul (`president-appointment-gokul-2026`, rendered inline by `PresidentAppointment.tsx`). Collects typed or drawn signatures via `SignaturePad.tsx`, writes append-only to `governance_signatures`. Each director can also **revoke** their own signature on any doc — a confirm panel (optional reason) appends a withdrawal event to `governance_revocations`; the original signature is never deleted, the per-doc count and the print exports stop counting the revoked signer, and the Director-status grid shows a red "⊘ Revoked" state. Revocation is final for that version (no re-sign without a version bump). The page also hosts a director-only **Board Resolutions** view (`Resolutions.tsx`) — a propose/vote workflow backed by the `board_resolutions` collection with CNCA-aligned quick-start templates (e.g. officer removal under CNCA s. 142(2), written resolution under s. 144(1)). Shared print/letterhead chrome lives in `LetterPaper.tsx`; print pages are dynamic segments under `app/c3h/pavilion/print/` (`lod-cibc/[recipient]`, `president-gokul`). All current docs are `whoMustSign: 'all-directors'` with no recusal — the previous IP-licensor recusal track (`requiresLicensorSignature` + `conflictedSigners`) was removed when the old IP Ownership Acknowledgement + Software Licence Agreement pair was retired in commit `0c91fee`; that scaffolding still exists on the `GovernanceDoc` type for future use but no current doc opts into it.

  **Letters of Direction (bank signing-authority workflow)**: per CIBC, a signing authority does not need to be a director — any individual approved by the directors can be added by submitting a Letter of Direction signed by all 5 directors. LoDs are modeled as `GovernanceDoc` entries — **one document per individual recipient** (e.g. `lod-cibc-gokul-2026` adds Gokul Prakash as a co-signing director; each is a separate `GovernanceDoc` with its own signature trail). The companion `lod-cibc-qaiser-2026` (which added Qaiser Qureshi as Treasurer / non-director officer) was **retired 2026-06-22** when Qaiser left the Club — the doc, its inline marker, the `qaiser` print recipient, and Qaiser's officer-roster/login/squad-viewer access were all removed (any signatures already in `governance_signatures` remain as an append-only historical record). The shared renderer lives in `app/c3h/pavilion/LetterOfDirection.tsx` and takes a `recipient` prop (currently `'gokul'` only, kept generic for future authorities); the print page is a dynamic segment at `app/c3h/pavilion/print/lod-cibc/[recipient]/page.tsx`. The older wet-sign template at `public/documents/letter-of-direction-template.html` is the print-fallback reference only. All five directors must sign each LoD in the Pavilion (`whoMustSign: 'all-directors'`, no conflict recusals — Saad signs as a director, distinct from his IP-licensor recusal on the Software Licence Agreement); once complete, the signed Letter is exported as a PDF on club letterhead and emailed to the recipient's personal Gmail for in-person submission to the branch. The `carryForwardFrom` field on `GovernanceDoc` exists so a successor doc can inherit signatures from a predecessor doc (used once on 2026-06-01 to split the prior combined Gokul + Qaiser LoD into two per-recipient LoDs without asking directors to re-sign) — **do NOT create new combined LoDs going forward**; always model one recipient per LoD from the outset so directors can opt in or out per recipient. Bank governance policy is **dual-signatory** — additional authorities are added under this policy, not as sole signers. OTPs are tied to the registered signing authority's personal phone (CIBC small-business: no email OTP); each authority gets their own debit card. Transactions in the bank statement display the name of the authority who initiated them — this is a CIBC display behavior and is not editable; the account remains a club account.
- `/c3h/officer-hub` — director-only officer-appointment UI (`OfficerAppointment.tsx`) backed by `C3H_OFFICER_ROSTER` and writes to `officer_appointment_signatures` (same collection the Pavilion and `/c3h/admin/signatures` read).
- `/c3h/neurovision` — **NeuroVision Lab**, a director-only (`isC3HDirector`) internal vision/mental-skills training tool, single-file `page.tsx`. Modules: Warm-Up (monocular eye stretches), Ball Pickup Trainer (release→bounce→head tracking + prediction/smooth-pursuit), Quick Field Scanner (drag fielders → auto-detect gaps → shot-to-exploit / how-to-bowl-to-protect + flash-scan peripheral drill), MOT (multiple-object tracking), Perceptual Learning (Gabor staircase), Breathing Pacer (4-6-2 coherence / 5-15 prime + BOLT breath-hold), plus juggling / follow-along / power-hitting / mindset drills. Persists per-player scores to `neurovision_progress`. Access is intentionally narrow for launch — opening it to all players is a one-line guard change. **Not linked from the dashboard or navbar** — reachable only by typing the URL, which is part of the narrow launch.
- `/c3h/admin/signatures` — admin-only Pavilion signature audit / cleanup surface.
- `/c3h/mental-game` — **The Mental Game** guide (pre-match / during-match / post-match mental tools). Static JSX, no Firestore; gated by `useSession` only (any logged-in player, not board-only). Linked from two places in the Nets page; public visitors arrive via the `/mental-game` shim.
- `/c3h/rulebooks` — static rulebook references.
- `/c3h/watch`, `/c3h/profile`, `/c3h/events`, `/c3h/field-editor`

(`app/c3h/receipts/` is an empty directory — there is no `/c3h/receipts` route.)

When adding director / governance work, bump the `version` field on the `GovernanceDoc` rather than mutating in place — bumping the version triggers a fresh re-signing cycle because `governance_signatures` doc ids include the version.

**Per-portal helpers in `app/c3h/lib/`** — all pure-function / pure-component modules; no Firestore reads, so they can run server- or client-side off any `Match`:
- `matchStats.ts` — per-player batting/bowling aggregates plus MVP / Best Batter / Best Bowler / Best Fielder / match-impact rankings from a `Match` document.
- `MatchSummary.tsx` — renders the above into a card; used by `/c3h/live` and the Scorer scorecard view.
- `playerAnalysis.ts` — per-player match analysis + rule-based coach feedback (rules keyed off dismissal type, SR vs team SR, economy vs team econ, dot-ball pressure, position-relative par-score). Includes `findPlayerName(sessionName, sessionEmail, rosters)` for resolving the logged-in user's name to a roster entry.
- `coachInsight.ts` — rule-based "Auto Coach Insight" generated from the Nets reflection form (technical mistake → plan failure → fix → next-innings plan). No LLM, deterministic, zero per-request cost.
- `nextMatchInsight.ts` — rule-based "next match" plan generated from a player's reflection inputs (dismissal type, intent/feeling scores, what-went-right/wrong). Same deterministic style as `coachInsight.ts`.
- `matchPlan.ts` — captain/VC pre-match planning primitives backing the Nets **Match Plan** tab: league detection from a match label, playing-XI / 12th-man derivation, plan validation, huddle-script generation, leadership resolution, and the role/temperament briefs + T30 templates (`BATTING_ROLES`, `BOWLING_ROLES`, `TEMPERAMENTS`, `T30_BATTING_FIRST_TEMPLATE`, …).
- `playerTracker.ts` — per-league games-played + playoff-eligibility computation backing the availability page's **Player Tracker** tab (`computePlayerTracker`, `requiredForLeague`, `matchesInLeague`, `gamesPlayed`). Eligibility thresholds are **per-league and not a single formula** — LPL T30 a fixed 5 of 12 (Rule 23, Division 2; Div 1 is 6 of 14), LCL T30 50% + 1 of the stage (8 of 14), LCL T20 a fixed 3 — so keep `requiredForLeague` as the single source and don't re-derive or hardcode counts elsewhere (the availability page imports it even for its print-fallback default).
- `PlayerCoachCard.tsx` — UI card rendering `playerAnalysis` output.
- **NeuroVision Lab primitives** (all pure, all unit-tested, backing `/c3h/neurovision`): `fieldScanner.ts` (fielder placement → gap detection → shot/bowling advice + `PRESET_FIELDS`, plus `generateField(rng)` which builds a random-but-realistic field with one dominant open lane for the rapid-scan drill), `perceptualStaircase.ts` (adaptive Gabor/contrast staircase — `createStaircase`, `nextStaircase`, `thresholdEstimate`), `mot.ts` (multiple-object-tracking), `mindset.ts` (`PRINCIPLES`, `BREATH_PATTERNS`, `QUIET_EYE`, the `buildCenteringRoutine` / `buildWalkoutRoutine` / `RESET_ROUTINE` scripted routines, and `regulateFor(level)` mapping a `'flat' | 'dialled' | 'amped'` arousal read to a regulation tool), `warmup.ts`, `juggling.ts`, `followAlong.ts`, `powerHitting.ts` (`POWER_PRINCIPLES`, `POWER_PROTOCOLS` + `totalReps()`, and `POWER_DRILLS` with the `DrillPhase` `'any' | 'off-season'` tag and `matchWeekDrills()` filter — overload work is deliberately hidden inside 48h of a match), `visualization.ts`. Same LLM-free / offline-safe contract as the coaching modules.

⚠️ **Third-party drill content**: `powerHitting.ts` drills 1–14 are ProVelocity Cricket's *branded* progression, reproduced by name/order with brief general cues only — never expand them into step-by-step reproductions of their method, and keep the attribution comment at the top of the file intact. Drill 15 is club-added. The same caution applies to any coaching content sourced from a paid course (see the Nets/breathing material): capture, but don't publish, until licensing is cleared.

When adding rule-based analysis, extend these modules — keep them LLM-free and pure so they remain auditable and offline-safe.

### API Routes

- **`/api/auth/[...nextauth]`** — NextAuth Google OAuth handler (see Auth model above)
- **`/api/create-checkout`** (POST) — creates Stripe Checkout sessions. Lazy Stripe init to avoid build-time errors on Vercel. Currency: CAD. **Not currently called by any frontend** — `/payments` uses the Stripe-hosted donation link directly. Defines the only `CartItem` interface in the repo.
- **`/api/payment-details`** (GET, `?session_id=`) — retrieves session details for the success page; expands `payment_intent.latest_charge` to surface Stripe receipt URL. Returns raw Unix timestamp.
- **`/api/youtube-videos`** — fetches RSS feed for channel `UCtoiAMFhqTeQ-uPN46BJo5Q`, parses `<entry>` blocks via regex (no XML parser dep). `revalidate = 3600`. Returns `{ videos: [] }` on upstream failure rather than erroring (200 status).

### Server vs client components

Default-server (no `"use client"`): About, BoardMembers, Footer, LegalDocuments, Partners, Programs, SponsorshipBanner, LiveStreaming, Clubhouse (`Clubhouse.tsx` is dead — imported nowhere).
Client (`"use client"`): Navbar, Hero, Registration, Contact, VerifiedNonprofit (uses `canvas-confetti` + IntersectionObserver), VerifiedBanner, UserMenu, PublicLiveScore (homepage live-match strip — subscribes to in-flight `matches` via `onSnapshot`), the `app/legal/**` SignBlocks and `_shared/` helpers, and **all** `app/c3h/**/*.tsx` pages.

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
- **`next.config.ts` is a bare stub** — no `images.remotePatterns`. External-URL `next/image` will fail.
- **`scripts/`** holds Firestore one-off maintenance scripts (e.g. `clean-lpl-roles.mjs`) that re-init Firebase with the same hardcoded config from `lib/firebase.ts`. They're meant to be run manually with `node scripts/<name>.mjs`, not part of the build.
- **`README.md` is stale** — it still describes the club as a "Registered Ontario non-profit" (it is a federal Canada NFP under the CNCA), lists Google Forms as unconfigured, and documents a project structure of ~7 components. Treat this file, not the README, as the source of truth; the README's only still-accurate part is the live registration form URL.
- **`app/legal/volunteer-agreement/SignBlock.tsx`** duplicates `_shared/DocumentSignBlock.tsx` by hand — signing changes must be applied to both until it's ported.

## Common tasks

**Add a public section**: create `components/SectionName.tsx` → import in `app/page.tsx` → use `.section-padding`.

**Add a C3H feature**: create `app/c3h/<feature>/page.tsx` with `"use client"`, use `useSession()` to gate, redirect to `/c3h/login` if unauthenticated, gate board-only UI with `isC3HBoard()` from `@/lib/c3h-access`. Read/write Firestore via `db` from `@/lib/firebase`, and `await firebaseAuthReady()` before any mount-time `getDoc`/`getDocs`.

**Add a Firestore collection**: write the rules block in `firestore.rules` *first* (the file ends in a default-deny catch-all), deploy it, then wire the reads/writes. Skipping the deploy produces silent permission-denied failures, not visible errors.

**Add a signable legal document**: add `app/legal/<slug>/page.tsx` for the content and a sibling `SignBlock.tsx` that renders `_shared/DocumentSignBlock` with its own `DOC_ID` / `DOC_VERSION` / `COLLECTION`; add the matching rules block; register it in `LegalDocsGrid.tsx`.

**Update colors**: `tailwind.config.ts` → `theme.extend.colors`.

**Update Google Form constants**: `GOOGLE_FORM_ACTION` / `GOOGLE_FORM_URL` and `ENTRY_IDS` in the relevant component.

**Board members**: edit `boardMembers` array in `BoardMembers.tsx` (name, title, role, bio, image path or null, initials).

**Legal doc surfaces**: edit content directly in `app/legal/<slug>/page.tsx`. `LegalDocuments.tsx` is the homepage card grid that points to those pages.

**Static assets**: `/public/...` (images, videos), `/public/documents/` (PDFs). Reference with leading slash (`/image.jpg`).

**Payment display amounts**: edit `PAYMENT_OPTIONS` and `SPONSORSHIP_TIERS` in `app/payments/page.tsx`. Actual charge amounts are configured on the Stripe-hosted donation page, not in code.

**Add a player to C3H — three files, all required** (editing only one fails silently, with no error in the UI):
1. `app/api/auth/[...nextauth]/route.ts` → `PLAYER_EMAILS` — login eligibility. Without it Google sign-in is rejected.
2. `lib/c3h-roster.ts` → `EMAIL_TO_PLAYER` — the email→display-name lookup behind `resolvePlayerName()`, used by the Dugout, Field Editor, and player analysis. Add both the workspace and personal-Gmail address if they have both, pointing at the same name.
3. `app/c3h/availability/page.tsx` → `ALL_PLAYERS` — the display names the Dugout actually renders (must match `EMAIL_TO_PLAYER` exactly). Players appear in **both** leagues by default; restrict via `LPL_ONLY` / `LCL_ONLY`, and override a wrong auto-derived short name via `SHORT_NAMES`, all in the same file.

Skipping step 2 or 3 is the classic bug: the player signs in fine but `resolvePlayerName()` returns null so they never appear in the availability matrix. Do **not** touch `lib/c3h-access.ts` for a regular player — that file only grants admin/captain/director/officer privileges.

**C3H login allowlist**: edit `BOARD_EMAILS` / `PLAYER_EMAILS` in `app/api/auth/[...nextauth]/route.ts`. Edit `lib/c3h-access.ts` separately to grant board-only UI inside C3H.

**Match schedule (C3H availability page)**: edit the `ALL_MATCHES` array near the top of `app/c3h/availability/page.tsx`.
