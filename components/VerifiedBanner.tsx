'use client';

import Image from 'next/image';

const verificationPartners = [
  { name: 'TechSoup Canada', logo: '/techsoup-logo.png', width: 336, height: 192 },
  { name: 'Goodstack', logo: '/goodstack-logo.jpg', width: 640, height: 335 },
  { name: 'Google for Nonprofits', logo: '/google-nonprofits.jpg', width: 598, height: 314 },
];

export default function VerifiedBanner() {
  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-primary-500/40" />
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              Verified By
            </span>
          </div>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-primary-500/40" />
        </div>

        {/* Floating Logo Marquee */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-16 animate-marquee">
            {[...verificationPartners, ...verificationPartners, ...verificationPartners].map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="flex-shrink-0 group"
              >
                <div className="bg-white rounded-xl px-8 py-4 shadow-lg shadow-primary-500/5 group-hover:shadow-primary-500/20 transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
