'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

const verificationPartners = [
  { name: 'TechSoup Canada', logo: '/techsoup-logo.png', width: 336, height: 192 },
  { name: 'Goodstack', logo: '/goodstack-logo.jpg', width: 640, height: 335 },
  { name: 'Google for Nonprofits', logo: '/google-nonprofits.jpg', width: 598, height: 314 },
];

export default function VerifiedNonprofit() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            setIsVisible(true);

            const rect = entry.target.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
              particleCount: 80,
              spread: 70,
              origin: { x, y },
              colors: ['#10b981', '#34d399', '#eab308', '#fbbf24', '#ffffff'],
              gravity: 0.8,
              scalar: 0.9,
              ticks: 150,
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div ref={badgeRef} className="flex flex-col items-center gap-6 py-8">
      {/* Verified Badge */}
      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-primary-500/30 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold text-gray-300">
          Verified By
        </span>
      </div>

      {/* Floating Logo Marquee */}
      <div className="w-full max-w-2xl overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        <div className={`flex items-center gap-12 animate-marquee ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Double the logos for seamless loop */}
          {[...verificationPartners, ...verificationPartners].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="bg-white rounded-xl px-6 py-3 shadow-lg shadow-primary-500/5 group-hover:shadow-primary-500/20 transition-all duration-300 group-hover:scale-105">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Ontario NFP Corporation #1746974-8
      </p>
    </div>
  );
}
