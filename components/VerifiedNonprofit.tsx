'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

export default function VerifiedNonprofit() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Get badge position for confetti origin
            const rect = entry.target.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            // Green and gold confetti matching our brand
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
    <div ref={badgeRef} className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-primary-500/30 backdrop-blur-sm">
        {/* Verified checkmark */}
        <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold text-gray-300">
          Verified Nonprofit
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          TechSoup Canada Verified
        </span>
        <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          Goodstack Verified
        </span>
        <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          Google for Nonprofits
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Ontario NFP Corporation #1746974-8
      </p>
    </div>
  );
}
