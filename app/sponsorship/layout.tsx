import type { Metadata } from 'next';

// page.tsx is a client component and cannot export metadata, so it lives here.
export const metadata: Metadata = {
  title: 'Sponsor a Cricket Club in London, Ontario | Challengers Cricket Club',
  description:
    'Sponsorship tiers for the 2027 season, from $500 to $2,000, plus in-kind partnerships. Your business on the jerseys and website of a London, Ontario cricket club.',
  alternates: { canonical: '/sponsorship' },
  openGraph: {
    title: 'Sponsor a Cricket Club in London, Ontario',
    description: 'Sponsorship tiers for the 2027 season, from $500 to $2,000, plus in-kind partnerships.',
    url: '/sponsorship',
    siteName: 'Challengers Cricket Club',
    locale: 'en_CA',
    type: 'website',
    images: ['/ccc-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sponsor a Cricket Club in London, Ontario',
    description: 'Sponsorship tiers for the 2027 season, from $500 to $2,000, plus in-kind partnerships.',
    images: ['/ccc-logo.png'],
  },
};

export default function SponsorshipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
