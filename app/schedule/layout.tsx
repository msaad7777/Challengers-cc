import type { Metadata } from 'next';

// page.tsx is a client component and cannot export metadata, so it lives here.
export const metadata: Metadata = {
  title: 'Fixtures & Results | Challengers Cricket Club, London, Ontario',
  description:
    'Match schedule and results for Challengers Cricket Club in the London Cricket League (T30, T20) and London Premier League (T30).',
  alternates: { canonical: '/schedule' },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
