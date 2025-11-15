# Challengers Cricket Club Website

A modern, premium website for Challengers Cricket Club - London, Ontario's newest cricket community.

## Features

- **Hero Section**: Eye-catching landing with smooth animations and CTAs
- **About Section**: Club mission, culture, and values
- **Sponsorship Page**: Dedicated sponsorship packages and inquiry form
- **Programs Section**: Main team, youth development, and community cricket
- **Registration**: Integration with Google Forms for registration and interest list
- **Contact Form**: Direct messaging through Google Forms
- **Responsive Design**: Fully responsive across all devices
- **Dark Theme**: Modern dark theme with glass morphism effects

## Organization

- **Status**: Registered Ontario non-profit corporation
- **Email**: challengerscricketclub2026@gmail.com
- **Domain**: challengerscc.ca
- **Instagram**: @challengers.cc
- **Formed**: 2025 - Now Active

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Forms**: Google Forms integration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google Forms Setup

### ✅ Full Registration Form - CONFIGURED

The main player registration form is **already active** at:
https://docs.google.com/forms/d/e/1FAIpQLSceV-DHzVm6ea2LCgDHjvKQEOSM6dWr6KR1ifDup7PrDTMiQw/viewform

This form is used for the "Register for 2026 Season" buttons. You can update the form questions anytime in Google Forms.

### ⏳ Additional Forms to Set Up

You need to create 3 more Google Forms for embedded functionality. See **GOOGLE_FORMS_SETUP.md** for detailed instructions.

### Registration Form (Interest List)
File: `components/Registration.tsx`

1. Create a Google Form with fields:
   - Full Name (Short answer)
   - Email (Short answer)
   - Phone (Short answer)
   - Skill Level (Multiple choice: Beginner, Intermediate, Advanced)

2. Get the form ID from the URL and replace `YOUR_INTEREST_FORM_ID`

3. Get entry IDs:
   - Open form in preview mode
   - Right-click and "Inspect" each field
   - Find the `name` attribute (e.g., `entry.1234567890`)
   - Replace the placeholder entry IDs

### Contact Form
File: `components/Contact.tsx`

1. Create a Google Form with fields:
   - Name (Short answer)
   - Email (Short answer)
   - Message (Paragraph)

2. Follow the same process to get form ID and entry IDs

### Sponsorship Form
File: `app/sponsorship/page.tsx`

1. Create a Google Form with fields:
   - Organization/Business Name (Short answer)
   - Contact Person Name (Short answer)
   - Email Address (Short answer)
   - Phone Number (Short answer)
   - Interested Sponsorship Level (Multiple choice: Title Sponsor, Platinum Sponsor, Gold Sponsor, Community Partner, Custom Package)
   - Message / Additional Information (Paragraph)

2. Follow the same process to get form ID and entry IDs

### Full Registration Link
File: `components/Hero.tsx` and `components/Registration.tsx`

Replace `YOUR_REGISTRATION_FORM_ID` with your comprehensive registration form ID.

## Customization

### Colors
The theme uses a cricket green and gold color scheme. Edit `tailwind.config.ts` to change:
- `primary`: Green shades
- `accent`: Gold/yellow shades

### Content
All text content is in the component files and can be easily edited.

## Deployment

Deploy easily to Vercel:

```bash
npm run build
```

Or push to GitHub and connect to Vercel for automatic deployments.

## Project Structure

```
challengeers-website/
├── app/
│   ├── sponsorship/
│   │   └── page.tsx      # Sponsorship page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── Hero.tsx          # Hero section
│   ├── About.tsx         # About section
│   ├── SponsorshipBanner.tsx  # Sponsorship CTA banner
│   ├── Programs.tsx      # Programs section
│   ├── Registration.tsx  # Registration & Interest
│   ├── Contact.tsx       # Contact section
│   └── Footer.tsx        # Footer
├── public/               # Static assets
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies
```

## Pages

- **/** - Homepage with all sections (Hero, About, Sponsorship Banner, Programs, Registration, Contact)
- **/sponsorship** - Dedicated sponsorship page with tier packages and inquiry form

## License

© 2025 Challengers Cricket Club. All rights reserved.
