# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Challengers Cricket Club website - Next.js 15 (App Router), TypeScript, Tailwind CSS with dark theme, glass morphism effects, and Google Forms integration.

**Organization**: Ontario NFP Corporation #1746974-8 | contact@challengerscc.ca | challengerscc.ca | @challengers.cc

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server (http://localhost:3000)
npm run build      # Production build
npm start          # Production server
npm run lint       # Run linter
```

## Deployment

**GitHub**: https://github.com/msaad7777/Challengers-cc
**Vercel**: Auto-deploys on push to `main` branch
**Deploy URL**: https://vercel.com/challengersccs-projects/challengeers-website

Standard workflow: `git add . && git commit -m "message" && git push`

## Architecture

### Structure
- **app/layout.tsx** - Root layout, metadata, SEO (Open Graph, Twitter cards)
- **app/page.tsx** - Homepage (Hero → About → SponsorshipBanner → Programs → BoardMembers → Registration → Contact → LegalDocuments → Footer)
- **app/sponsorship/page.tsx** - Sponsorship tiers and inquiry form
- **app/globals.css** - Custom utilities

### Components (`/components`)
- **Hero.tsx** - Video background (`/logo-video.mp4`), CTAs, smooth scroll to #interest-section
- **About.tsx** - Mission, culture, features
- **SponsorshipBanner.tsx** - CTA banner
- **Programs.tsx** - Main Team, Youth, Community cards
- **BoardMembers.tsx** - Profiles with photos/initials
- **Registration.tsx** - Full form with cricket fields (skillLevel, willingToPlay, playingRole, jersey sizing)
- **Contact.tsx** - Contact form
- **LegalDocuments.tsx** - PDF downloads (all currently `available: false`)
- **Footer.tsx** - Links, social icons

### Design System

**Colors** (`tailwind.config.ts`):
- `primary` - Cricket green (#10b981)
- `accent` - Gold (#eab308)

**Custom Utilities** (`globals.css`):
- `.glass` - Glass morphism (bg-white/5, backdrop-blur)
- `.gradient-text` - Primary to accent gradient
- `.section-padding` - Consistent spacing (py-20 md:py-32)

**Animations**: `fade-in`, `slide-up`, `slide-in-right`, `float`

**Patterns**:
- Cards: `glass rounded-2xl p-8 glass-hover`
- Buttons: `bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105`
- Inputs: `bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
- Headers: `<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">Text <span className="gradient-text">Gradient</span></h2>`

**Responsive**: Mobile-first, standard Tailwind breakpoints (sm/md/lg)

### Google Forms Integration

All forms use `mode: 'no-cors'` POST with `GOOGLE_FORM_ACTION` and `ENTRY_IDS` constants. All three forms are configured and active.

**Registration.tsx**: name, email, phone, skillLevel, willingToPlay (T30/T20/Both), playingRole (Batsman/Bowler/Wicket Keeper/All Rounder), jerseySize, jerseyType, trouserWaistSize

**Contact.tsx**: name, email, message

**Sponsorship page**: organizationName, contactName, email, phone, sponsorshipLevel, message

**Setup**: Get form ID from Google Forms URL → Inspect fields for entry IDs (e.g., `entry.1234567890`) → Update constants

### Key Details

- Forms are client components (`"use client"`), use `useState`
- Smooth scrolling via `scroll-smooth` class on `<html>`
- Icons are inline SVG (no library dependency)
- Background effects use radial gradients with low opacity (5-10%) and `blur-3xl`
- Animation delays via inline `style={{ animationDelay: '0.1s' }}`

## Common Tasks

**Add Section**: Create `/components/SectionName.tsx` → Import in `app/page.tsx` → Use `.section-padding`

**Update Colors**: Edit `tailwind.config.ts` → `theme.extend.colors`

**Update Forms**: Change `GOOGLE_FORM_ACTION` URL and `ENTRY_IDS` object

**Board Members**: Edit `boardMembers` array in `BoardMembers.tsx` (requires: name, title, role, bio, image path or null, initials)

**Legal Docs**: Edit `documents` array in `LegalDocuments.tsx`, set `available: true` when PDF uploaded to `/public/documents/`

**Social Links**: Footer.tsx line ~88 (Instagram configured, Facebook/Twitter use `#` placeholders)

**Static Assets**: Place in `/public` (images, videos) or `/public/documents/` (PDFs). Reference with leading slash (`/image.jpg`)
