import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.challengerscc.ca'),
  title: "Challengers Cricket Club | Cricket Club in London, Ontario",
  description: "Community cricket club in London, Ontario playing the London Cricket League and London Premier League. Open to newcomers and experienced players. Registration open for 2027.",
  icons: {
    icon: '/ccc-logo.png',
    apple: '/ccc-logo.png',
  },
  openGraph: {
    title: "Challengers Cricket Club | Cricket Club in London, Ontario",
    description: "Community cricket club in London, Ontario playing the London Cricket League and London Premier League. Open to newcomers and experienced players. Registration open for 2027.",
    images: ['/ccc-logo.png'],
    url: 'https://www.challengerscc.ca',
    siteName: 'Challengers Cricket Club',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Challengers Cricket Club | Cricket Club in London, Ontario",
    description: "Community cricket club in London, Ontario playing the London Cricket League and London Premier League. Open to newcomers and experienced players. Registration open for 2027.",
    images: ['/ccc-logo.png'],
  },
};

// Tells Google what the club is, for the knowledge panel and local results.
// Locality only, no street address: the registered address is a home.
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'Challengers Cricket Club',
  alternateName: 'Challengers CC',
  sport: 'Cricket',
  url: 'https://www.challengerscc.ca',
  logo: 'https://www.challengerscc.ca/ccc-logo.png',
  email: 'contact@challengerscc.ca',
  foundingDate: '2025',
  areaServed: 'London, Ontario',
  address: { '@type': 'PostalAddress', addressLocality: 'London', addressRegion: 'ON', addressCountry: 'CA' },
  sameAs: [
    'https://www.instagram.com/challengers.cc/',
    'https://www.youtube.com/@Challengersccldn',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18005598397"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18005598397');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
