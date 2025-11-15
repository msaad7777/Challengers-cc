import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://challengerscc.ca'),
  title: "Challengers Cricket Club | London, Ontario",
  description: "Join London's united cricket community. Formed in 2025, welcoming all players. One Team. One Dream.",
  icons: {
    icon: '/ccc-logo.png',
    apple: '/ccc-logo.png',
  },
  openGraph: {
    title: "Challengers Cricket Club | London, Ontario",
    description: "Join London's united cricket community. Formed in 2025, welcoming all players. One Team. One Dream.",
    images: ['/ccc-logo.png'],
    url: 'https://challengerscc.ca',
    siteName: 'Challengers Cricket Club',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Challengers Cricket Club | London, Ontario",
    description: "Join London's united cricket community. Formed in 2025, welcoming all players. One Team. One Dream.",
    images: ['/ccc-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
