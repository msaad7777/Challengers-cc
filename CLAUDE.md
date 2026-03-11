# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Challengers Cricket Club website - Next.js 15 (App Router), TypeScript, Tailwind CSS with dark theme, glass morphism effects, Google Forms integration, and Stripe payments.

**Organization**: Ontario NFP Corporation #1746974-8 | contact@challengerscc.ca | challengerscc.ca | @challengers.cc

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server (http://localhost:3000)
npm run build      # Production build
npm start          # Production server
npm run lint       # Run linter
```

No test framework is configured. There are no unit or integration tests.

## Environment Variables

Required for Stripe payments:
- `STRIPE_SECRET_KEY` - Stripe secret key for server-side API
- `NEXT_PUBLIC_BASE_URL` - Base URL for redirects (defaults to http://localhost:3000)

Note: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exists in `.env.example` but is never read by any code.

## Deployment

**GitHub**: https://github.com/msaad7777/Challengers-cc
**Vercel**: Auto-deploys on push to `main` branch
**Deploy URL**: https://vercel.com/challengersccs-projects/challengeers-website

## Architecture

TypeScript strict mode is enabled. Path alias `@/*` maps to the project root (e.g., `import Navbar from '@/components/Navbar'`). Font: Inter (via `next/font/google`). `next.config.ts` is empty — no `images.remotePatterns` configured, so `next/image` with external URLs will fail.

### Pages

- **/** - Homepage: composes 11 components in sequence (Navbar → Hero → About → SponsorshipBanner → Programs → Partners → BoardMembers → Registration → Contact → LegalDocuments → Footer)
- **/sponsorship** - Sponsorship tiers and inquiry form (self-contained `"use client"` page)
- **/payments** - Stripe checkout for registration, practice fees, league fees, and sponsorships
- **/payments/success** - Payment receipt with print functionality (uses `<Suspense>` wrapper for `useSearchParams()` — required by Next.js 15 App Router)
- **/payments/cancel** - Payment cancellation page
- **/looking-for-sponsors** - Public-facing sponsor recruitment page for 2026 season (server component, includes Navbar + Footer)

The payments pages have no shared layout — each imports `Navbar` independently. The main `/payments` page includes `<Footer>`, but success and cancel pages do not.

### API Routes

- **app/api/create-checkout/route.ts** - Creates Stripe Checkout sessions (POST). Lazy Stripe initialization to avoid build-time errors on Vercel. Currency: CAD.
- **app/api/payment-details/route.ts** - Retrieves payment session details by `session_id` query param (GET). Returns raw Unix timestamp for `session.created`.

### Component Rendering Model

- **Server components** (default): About, BoardMembers, Footer, LegalDocuments, Partners, Programs, SponsorshipBanner
- **Client components** (`"use client"`): Navbar, Hero, Registration, Contact

### Design System

**Colors** (`tailwind.config.ts`): `primary` (cricket green #10b981), `accent` (gold #eab308)

**Custom Utilities** (`globals.css`):
- `.glass` / `.glass-hover` - Glass morphism (bg-white/5, backdrop-blur)
- `.gradient-text` - Primary to accent gradient
- `.section-padding` - Consistent spacing (py-20 md:py-32)
- `.flip-card` family - 3D card flip on hover (defined but currently unused)

**Animations** (`tailwind.config.ts`): `fade-in`, `slide-up`, `slide-in-right`, `float`

**Common Patterns**:
- Cards: `glass rounded-2xl p-8 glass-hover`
- Buttons: `bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105`
- Inputs: `bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
- Section headers: `<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">Text <span className="gradient-text">Gradient</span></h2>`

### Google Forms Integration

**Two different submission techniques are used:**
1. **Registration.tsx**: Hidden `<iframe>` + native HTML `form target` submission — the form POSTs directly to Google via `action={GOOGLE_FORM_URL}` and `target="hidden_iframe"`. Entry IDs are set as `name` attributes on `<input>` elements. Success shown after `setTimeout(1000)`.
2. **Contact.tsx** and **Sponsorship page**: `fetch()` with `mode: 'no-cors'` POST using `GOOGLE_FORM_ACTION` and `ENTRY_IDS` constants.

**Setup**: Get form ID from Google Forms URL → Inspect fields for entry IDs (e.g., `entry.1234567890`) → Update constants. See `GOOGLE_FORMS_SETUP.md` in repo root for detailed setup guide (partially stale — Contact and Sponsorship forms are now configured but doc may show them as pending).

### Stripe Payment Flow

`/payments` page → user builds cart + enters info → POST to `/api/create-checkout` → Stripe Checkout session created → redirect via `window.location.href` → on success, redirect to `/payments/success?session_id=...` → page calls `/api/payment-details` to display receipt.

The flow is entirely server-side Stripe. `@stripe/stripe-js` is in `package.json` but is never imported — no client-side Stripe.js is used.

### Known Duplication and Inconsistencies

- **`CartItem` interface** is defined separately in both `app/payments/page.tsx` and `app/api/create-checkout/route.ts` — no shared types file exists
- **Sponsorship tiers** are defined in two places with different data: `app/payments/page.tsx` (3 tiers in `SPONSORSHIP_TIERS` array, plus a separate Community Partner custom-amount input handled via `customAmounts.communityPartner` state) and `app/sponsorship/page.tsx` (4 tiers including Community Partner, with full benefits/colors)
- **Social media links** (Instagram, Facebook) are hardcoded in 6+ locations: Navbar, Contact, Footer, Registration (twice — success state and persistent social CTA), payments success page, and payments cancel page — no centralized constant
- **`OUTDOOR_PRACTICE_FEE = 20`** is defined in `app/payments/page.tsx` but never used (Indoor Practice uses a custom amount input instead)
- **Programs "Learn More" buttons** are non-functional `<button>` elements with no `href` or `onClick`
- **Legal document PDFs** are in the project root, not in `/public/documents/` where `LegalDocuments.tsx` expects them. All four documents have `available: false`
- **Footer broken links**: Twitter icon (`href="#"`), Privacy Policy (`href="#"`), and Terms of Service (`href="#"`) are all non-functional
- **Unused import**: `app/payments/page.tsx` imports `Image` from `next/image` but never renders it
- **Sensitive files at project root**: Non-code files in the repo root are not gitignored and should be: `Challengers Cricket Club Expenses (1).xlsx`, `2026 Season Allocation form - Challengers Cricket (2).docx`, `Challengers_Cricket_Club_Constitution_Bylaws_2026 (1).docx`, `Challengers-Cricket-Club-Bylaws.md` (`Treasurer-Analysis.xlsx` is already gitignored)

## Common Tasks

**Add Section**: Create `/components/SectionName.tsx` → Import in `app/page.tsx` → Use `.section-padding`

**Update Colors**: Edit `tailwind.config.ts` → `theme.extend.colors`

**Update Google Forms**: Change `GOOGLE_FORM_ACTION`/`GOOGLE_FORM_URL` and `ENTRY_IDS` in respective components

**Board Members**: Edit `boardMembers` array in `BoardMembers.tsx` (requires: name, title, role, bio, image path or null, initials)

**Legal Docs**: Move PDFs to `/public/documents/`, edit `documents` array in `LegalDocuments.tsx`, set `available: true`

**Static Assets**: Place in `/public` (images, videos) or `/public/documents/` (PDFs). Reference with leading slash (`/image.jpg`)

**Payment Items**: Edit `REGISTRATION_FEE` constant and `SPONSORSHIP_TIERS` array in `app/payments/page.tsx`

**Sponsorship Tiers**: Edit `sponsorshipTiers` array in `app/sponsorship/page.tsx` (name, price, subtitle, color, icon, benefits) AND `SPONSORSHIP_TIERS` in `app/payments/page.tsx` if amounts change
