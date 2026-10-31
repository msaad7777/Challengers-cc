import type { Metadata } from 'next';

// page.tsx is a client component and cannot export metadata, so it lives here.
export const metadata: Metadata = {
  title: 'Sponsor a Cricket Club in London, Ontario | Challengers Cricket Club',
  description:
    'Sponsorship tiers for the 2027 season, from $500 to $2,000, plus in-kind partnerships. Your business on the jerseys, website and livestreams of a London, Ontario cricket club.',
  alternates: { canonical: '/sponsorship' },
};

export default function SponsorshipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
