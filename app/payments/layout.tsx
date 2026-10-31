import type { Metadata } from 'next';

// Member payment page: not something to rank for.
export const metadata: Metadata = {
  title: 'Payments | Challengers Cricket Club',
  robots: { index: false, follow: false },
};

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
