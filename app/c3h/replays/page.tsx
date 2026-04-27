'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { matchReplays, youtubeIdFromUrl } from './data';

export default function ReplaysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/c3h/login?callbackUrl=/c3h/replays');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading…</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full mb-4 border border-red-500/30">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-sm font-semibold text-red-400">C3H · Match Replays</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Match <span className="gradient-text">Replays</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Watch full matches and use them for your reflection cards. Welcome,{' '}
              {session.user?.name?.split(' ')[0] || 'Challenger'}.
            </p>
          </div>
        </div>
      </section>

      {/* Replays */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {matchReplays.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-300 text-lg">No match replays yet.</p>
              <p className="text-gray-500 mt-2">
                Match videos will appear here as captains and board members add them.
              </p>
            </div>
          ) : (
            matchReplays.map((m) => {
              const videoId = youtubeIdFromUrl(m.youtubeUrl);
              const formattedDate = new Date(m.date).toLocaleDateString('en-CA', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <article key={m.id} className="glass rounded-2xl p-6 md:p-8 border border-white/10">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">{m.title}</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {formattedDate}
                        {m.venue && <span className="text-gray-500"> · {m.venue}</span>}
                        {m.league && <span className="text-gray-500"> · {m.league}</span>}
                      </p>
                    </div>
                    {m.result && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${
                          m.result === 'Won'
                            ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                            : m.result === 'Lost'
                              ? 'bg-red-500/20 border-red-500/50 text-red-300'
                              : 'bg-white/10 border-white/20 text-gray-300'
                        }`}
                      >
                        {m.result}
                      </span>
                    )}
                  </div>

                  {/* Scorecard totals */}
                  {(m.ourTotal || m.oppTotal) && (
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      {m.oppTotal && (
                        <div className="glass rounded-xl p-4 border border-blue-500/20">
                          <p className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1">{m.opponent}</p>
                          <p className="text-2xl font-bold text-white">
                            {m.oppTotal.runs}
                            <span className="text-base text-gray-400 font-normal">
                              {m.oppTotal.allOut ? ' all out' : `/${m.oppTotal.wickets}`}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">{m.oppTotal.overs} overs</p>
                        </div>
                      )}
                      {m.ourTotal && (
                        <div className="glass rounded-xl p-4 border border-primary-500/20">
                          <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">Challengers CC</p>
                          <p className="text-2xl font-bold text-white">
                            {m.ourTotal.runs}
                            <span className="text-base text-gray-400 font-normal">
                              {m.ourTotal.allOut ? ' all out' : `/${m.ourTotal.wickets}`}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">{m.ourTotal.overs} overs</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toss + result detail */}
                  {(m.toss || m.resultDetail) && (
                    <div className="glass rounded-xl p-4 border border-white/10 mb-6 space-y-2">
                      {m.toss && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-500">🪙 Toss: </span>
                          {m.toss}
                        </p>
                      )}
                      {m.resultDetail && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-500">📋 Result: </span>
                          {m.resultDetail}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Video embed */}
                  {videoId ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={m.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <a
                      href={m.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 mb-6"
                    >
                      Watch on YouTube
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}

                  {/* Summary */}
                  {m.summary && (
                    <p className="text-gray-300 leading-relaxed mb-6">{m.summary}</p>
                  )}

                  {/* Top performers — batting */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {m.ourBatting && m.ourBatting.length > 0 && (
                      <div className="glass rounded-xl p-5 border border-primary-500/20">
                        <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-3">
                          🟢 Challengers CC — Batting
                        </h3>
                        <ul className="space-y-2">
                          {m.ourBatting.map((b, i) => (
                            <li key={i} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{b.name}</span>
                                <span className="text-primary-300 font-bold">
                                  {b.runs}
                                  {b.balls != null && <span className="text-gray-500 font-normal"> ({b.balls})</span>}
                                </span>
                              </div>
                              {(b.howOut || b.fours != null || b.sixes != null) && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {b.howOut && <span>{b.howOut}</span>}
                                  {b.howOut && (b.fours != null || b.sixes != null) && ' · '}
                                  {b.fours != null && <span>{b.fours}×4s</span>}
                                  {b.fours != null && b.sixes != null && ' '}
                                  {b.sixes != null && <span>{b.sixes}×6s</span>}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.oppBatting && m.oppBatting.length > 0 && (
                      <div className="glass rounded-xl p-5 border border-blue-500/20">
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                          🔵 {m.opponent} — Batting
                        </h3>
                        <ul className="space-y-2">
                          {m.oppBatting.map((b, i) => (
                            <li key={i} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">{b.name}</span>
                                <span className="text-blue-300 font-bold">
                                  {b.runs}
                                  {b.balls != null && <span className="text-gray-500 font-normal"> ({b.balls})</span>}
                                </span>
                              </div>
                              {(b.howOut || b.fours != null || b.sixes != null) && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {b.howOut && <span>{b.howOut}</span>}
                                  {b.howOut && (b.fours != null || b.sixes != null) && ' · '}
                                  {b.fours != null && <span>{b.fours}×4s</span>}
                                  {b.fours != null && b.sixes != null && ' '}
                                  {b.sixes != null && <span>{b.sixes}×6s</span>}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Bowling figures */}
                  {(m.ourBowling || m.oppBowling) && (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {m.ourBowling && m.ourBowling.length > 0 && (
                        <div className="glass rounded-xl p-5 border border-primary-500/20">
                          <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-3">
                            🟢 Challengers CC — Bowling
                          </h3>
                          <ul className="space-y-1.5 text-sm">
                            {m.ourBowling.map((b, i) => (
                              <li key={i} className="flex items-center justify-between">
                                <span className="text-white font-medium">{b.name}</span>
                                <span className="text-gray-400 font-mono text-xs">
                                  {b.overs}-{b.maidens ?? 0}-{b.runs}-{b.wickets}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {m.oppBowling && m.oppBowling.length > 0 && (
                        <div className="glass rounded-xl p-5 border border-blue-500/20">
                          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                            🔵 {m.opponent} — Bowling
                          </h3>
                          <ul className="space-y-1.5 text-sm">
                            {m.oppBowling.map((b, i) => (
                              <li key={i} className="flex items-center justify-between">
                                <span className="text-white font-medium">{b.name}</span>
                                <span className="text-gray-400 font-mono text-xs">
                                  {b.overs}-{b.maidens ?? 0}-{b.runs}-{b.wickets}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scorebook photos */}
                  {m.scorebookPhotos && m.scorebookPhotos.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                        📓 Scorebook Pages
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {m.scorebookPhotos.map((src, i) => (
                          <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block glass rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/40 transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`${m.title} — scorebook page ${i + 1}`}
                              className="w-full h-auto"
                            />
                          </a>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click any page to open full size.</p>
                    </div>
                  )}

                  {/* Reflection CTA */}
                  {m.reflectionPrompt && (
                    <div className="glass rounded-xl p-5 border-2 border-accent-500/30 bg-gradient-to-r from-accent-500/5 to-transparent">
                      <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-2">
                        ✍️ Reflect on this match
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed mb-3">{m.reflectionPrompt}</p>
                      <Link
                        href="/c3h/nets"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:shadow-primary-500/50 hover:shadow-xl transition-all"
                      >
                        Open The Nets
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Back to dashboard */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/c3h/dashboard"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to C3H Dashboard
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
