# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Challengers Cricket Club website - a modern, premium Next.js website for a new cricket club in London, Ontario launching in 2026. Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS, featuring dark theme with glass morphism effects and Google Forms integration.

**Organization Details**:
- Registered Ontario non-profit corporation
- Valid NUANS name registration
- Appropriate NAICS code
- Contact: challengerscricketclub2026@gmail.com
- Domain: challengerscc.ca
- Instagram: @challengers.cc (https://instagram.com/challengers.cc)
- Formed: 2025 - Currently Active

## Development Commands

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Opens at http://localhost:3000 with hot reload.

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Git & Deployment

### Repository
**GitHub**: https://github.com/msaad7777/Challengers-cc
**Vercel**: Connected for automatic deployments

### Deployment Workflow
The project uses Git with automatic Vercel deployments. Any push to the `main` branch will trigger an automatic build and deployment.

**Standard workflow for making changes**:
```bash
# 1. Make your code changes

# 2. Stage all changes
git add .

# 3. Commit with descriptive message
git commit -m "Description of changes"

# 4. Push to GitHub (triggers automatic Vercel deployment)
git push
```

### Manual Deployment (if needed)
If you need to deploy without pushing to Git:
```bash
vercel --prod
```

### Checking Deployment Status
- View deployments: https://vercel.com/challengersccs-projects/challengeers-website
- Each push creates a new deployment
- Production URL updates automatically after successful build

## Architecture

### App Router Structure
- **app/layout.tsx**: Root layout with metadata and global styles
- **app/page.tsx**: Homepage composing all sections
- **app/sponsorship/page.tsx**: Dedicated sponsorship page with tiers and form
- **app/globals.css**: Global styles, Tailwind directives, and custom utility classes

### Component Architecture
All sections are separate components in `/components`:
- **Hero.tsx**: Full-screen hero with CTAs and scroll indicator
- **About.tsx**: Club story, mission, culture with feature highlights
- **SponsorshipBanner.tsx**: Call-to-action banner for sponsorship (homepage)
- **Programs.tsx**: Three program cards (Main Team, Youth, Community)
- **BoardMembers.tsx**: Board member profiles with photos/initials, bios, and roles
- **Registration.tsx**: Dual-column with full registration link + interest form
- **Contact.tsx**: Contact form with club information
- **LegalDocuments.tsx**: Legal documents section with downloadable PDFs
- **Footer.tsx**: Site footer with links, social icons, and sponsorship link

### Page Routes
- **/** - Homepage with all sections
- **/sponsorship** - Full sponsorship page with packages and inquiry form

### Design System (Tailwind Config)

**Color Palette**:
- `primary`: Cricket green (#10b981 family) - main brand color
- `accent`: Gold/yellow (#eab308 family) - secondary highlights

**Custom Utilities** (globals.css):
- `.glass`: Glass morphism effect (bg-white/5 with backdrop-blur)
- `.glass-hover`: Enhanced glass on hover
- `.gradient-text`: Primary to accent gradient text
- `.section-padding`: Consistent section spacing (py-20 md:py-32)

**Animations**:
- `fade-in`: Opacity fade in
- `slide-up`: Slide up with fade
- `slide-in-right`: Slide from right
- `float`: Floating animation for decorative elements

### Google Forms Integration

Forms use `mode: 'no-cors'` POST to Google Forms endpoints:

**Interest Form** (Registration.tsx):
- Form action: `GOOGLE_FORM_ACTION` constant
- Entry IDs: `ENTRY_IDS` object maps fields to Google Form entry IDs
- Fields: name, email, phone, skillLevel

**Contact Form** (Contact.tsx):
- Form action: `GOOGLE_FORM_ACTION` constant
- Entry IDs: `ENTRY_IDS` object
- Fields: name, email, message

**Sponsorship Form** (app/sponsorship/page.tsx):
- Form action: `GOOGLE_FORM_ACTION` constant
- Entry IDs: `ENTRY_IDS` object
- Fields: organizationName, contactName, email, phone, sponsorshipLevel, message

**Setup Process**:
1. Create Google Form with matching fields
2. Get form ID from URL: `forms/d/e/{FORM_ID}/viewform`
3. Inspect field names to find entry IDs (e.g., `entry.1234567890`)
4. Replace placeholder constants in component files

**Full Registration Links**:
- Hero.tsx line ~52
- Registration.tsx line ~105
- Replace `YOUR_REGISTRATION_FORM_ID` with actual form ID

### State Management
Uses React `useState` for form handling. Forms are client components (`"use client"`).

### Styling Patterns

**Cards**:
```tsx
className="glass rounded-2xl p-8 glass-hover"
```

**Buttons (Primary)**:
```tsx
className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
```

**Input Fields**:
```tsx
className="bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
```

**Section Headers**:
```tsx
<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
  Text <span className="gradient-text">Gradient</span>
</h2>
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg (standard Tailwind)
- Grid layouts adapt: `grid md:grid-cols-2 lg:grid-cols-3`
- Text scales: `text-xl sm:text-2xl md:text-3xl lg:text-4xl`

## Key Implementation Details

### Smooth Scrolling
- `html` has `scroll-smooth` class in layout.tsx
- Hero CTA scrolls to `#interest-section` via JavaScript
- Footer links use anchor tags with section IDs

### Animation Delays
Components use inline `style={{ animationDelay: '0.1s' }}` for staggered entrances.

### Background Effects
- Radial gradients for atmospheric effects
- Positioned absolutely with low opacity (5-10%)
- Blur effects using `blur-3xl` utility

### Icons
All icons are inline SVG components (Heroicons style). No icon library dependency.

## Common Tasks

### Adding a New Section
1. Create component in `/components/SectionName.tsx`
2. Import and add to `app/page.tsx`
3. Use `.section-padding` utility for consistent spacing
4. Follow existing section header pattern

### Updating Colors
Edit `tailwind.config.ts` → `theme.extend.colors` → `primary` or `accent` values.

### Changing Form Integration
1. Update `GOOGLE_FORM_ACTION` URL
2. Update `ENTRY_IDS` object with correct field mappings
3. Test submission (check Google Form responses)

### Adding Social Links
Update Footer.tsx social icons section (~line 57). Replace `#` with actual URLs.

### Adding/Updating Board Members
Edit `components/BoardMembers.tsx` → `boardMembers` array. Each member requires:
- `name`, `title`, `role`, `bio`
- `image` (path to photo in `/public`) or `null` (uses initials)
- `initials` (shown if no image)

Photos should be added to `/public` directory and referenced with path like `/photo.jpeg`.

### Managing Legal Documents
Edit `components/LegalDocuments.tsx` → `documents` array:
- Set `available: true` when PDF is uploaded to `/public/documents/`
- Update `fileUrl` path to match uploaded file
- Documents marked as unavailable show "Coming Soon"

## Important Notes

- **Client Components**: Forms (Registration, Contact, Sponsorship) require `"use client"` directive
- **Images**: Uses Next.js `Image` component for board member photos; other sections use SVG icons
- **TypeScript**: All components use TypeScript with proper typing
- **Accessibility**: Buttons and links include proper aria-labels where needed
- **Performance**: Components use CSS animations (not JS) for better performance
