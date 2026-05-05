"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

type Book = 'lpl' | 'lcl';

const BOOKS: Record<Book, { title: string; subtitle: string; file: string; accent: string }> = {
  lpl: {
    title: 'London Premier League — 2026 Rule Book',
    subtitle: 'T20 / T30. Substitute rule allows a 12th man to bat AND/OR bowl AND/OR field.',
    file: '/documents/lpl-rulebook-2026.pdf',
    accent: 'red',
  },
  lcl: {
    title: 'London Cricket League — 2026 Rule Book',
    subtitle: 'T30. Super Sub rule: one innings only, bat OR bowl. Fielding sub only on injury / umpire approval.',
    file: '/documents/lcl-rulebook-2026.pdf',
    accent: 'blue',
  },
};

export default function RulebooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [active, setActive] = useState<Book>('lpl');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading...</div>
      </div>
    );
  }
  if (!session) return null;

  const book = BOOKS[active];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-28 md:pt-32">
        <div className="max-w-6xl mx-auto">

          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Rule Books</h1>
            <p className="text-gray-400 text-sm">
              Official 2026 rule books for the leagues Challengers compete in. Read in-page only — players
              should not redistribute these PDFs outside the club.
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            {(Object.keys(BOOKS) as Book[]).map((key) => {
              const b = BOOKS[key];
              const selected = key === active;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    selected
                      ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/40'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {key === 'lpl' ? 'LPL 2026' : 'LCL 2026'}
                </button>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">{book.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{book.subtitle}</p>
            </div>

            <div
              className="w-full rounded-lg overflow-hidden border border-white/10 bg-black hidden sm:block"
              style={{ height: '80vh' }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                key={active}
                src={`${book.file}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                title={book.title}
                className="w-full h-full"
              />
            </div>

            {/* Mobile fallback — iOS Safari and some Android browsers refuse
                to render PDFs in iframes. Show a clear "Open" button instead. */}
            <div className="sm:hidden rounded-lg border border-white/10 bg-black/40 p-6 text-center">
              <div className="text-3xl mb-3">📄</div>
              <p className="text-gray-300 text-sm mb-4">
                On mobile, please open the rule book in a new tab to read it. PDF viewers built into mobile
                browsers handle navigation and zoom better than embedded frames.
              </p>
              <a
                href={book.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg bg-primary-500 text-black font-semibold hover:bg-primary-400 transition-all"
              >
                Open {active === 'lpl' ? 'LPL' : 'LCL'} rule book ↗
              </a>
            </div>

            <p className="text-gray-500 text-xs mt-3">
              Note: PDF is embedded for in-app reading. Browsers may still allow saving via the address bar —
              the rule book is a public LPL/LCL document, but please don&apos;t republish it under the club name.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="glass rounded-xl p-5 border border-red-500/20">
              <h3 className="text-white font-bold mb-2">LPL — Substitute (Rule 1)</h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>12 declared players. Sub can bat AND bowl AND field.</li>
                <li>Up to 4 overs free swap. &gt;4 overs = time penalty for return.</li>
                <li>Subs 13/14/15 are fielding-only on a second injury.</li>
              </ul>
            </div>
            <div className="glass rounded-xl p-5 border border-blue-500/20">
              <h3 className="text-white font-bold mb-2">LCL — Super Subs Rule</h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>One Super Sub per game. Plays one innings only — bat OR bowl.</li>
                <li>Fielding sub allowed only on injury / emergency, umpire approval.</li>
                <li>Must be declared in CricClubs before toss.</li>
              </ul>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
