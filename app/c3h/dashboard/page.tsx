"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PublicLiveScore from '@/components/PublicLiveScore';
import { isC3HBoard } from '@/lib/c3h-access';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/c3h/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const isBoard = isC3HBoard(session.user?.email);
  const userName = session.user?.name || 'Player';
  const userImage = session.user?.image || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Live score banner — visible to all logged-in members
          when a match is in progress. Auto-disappears when no
          match is active. */}
      <div className="pt-28 md:pt-32">
        <PublicLiveScore />
      </div>

      <section className="section-padding pt-4 md:pt-6">
        <div className="max-w-5xl mx-auto">

          {/* Welcome Header */}
          <div className="glass rounded-2xl p-8 mb-8 border border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {userImage && (
                  <img src={userImage} alt={userName} className="w-12 h-12 rounded-full" />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">Welcome, {userName}</h1>
                  <p className="text-gray-400 text-sm">{session.user?.email}</p>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full mt-1 inline-block ${
                    isBoard
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                      : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  }`}>
                    {isBoard ? 'Board Member' : 'Player'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/c3h' })}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid sm:grid-cols-2 gap-6">

            {/* Events & Calendar */}
            <a href="/c3h/events" className="glass rounded-2xl p-6 border-2 border-accent-500/20 hover:border-accent-500/50 transition-all duration-300 block">
              <div className="text-3xl mb-3">📅</div>
              <h2 className="text-xl font-bold text-white mb-1">Events &amp; Calendar</h2>
              <p className="text-accent-400 text-xs font-medium mb-3">Training, Matches &amp; Club Events</p>
              <p className="text-gray-400 text-sm mb-4">
                View all confirmed club events and add them to your Google Calendar, Apple Calendar,
                or Outlook with one click.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Open
              </span>
            </a>

            {/* Watch Live */}
            <a href="/c3h/watch" className="glass rounded-2xl p-6 border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300 block">
              <div className="text-3xl mb-3">📺</div>
              <h2 className="text-xl font-bold text-white mb-1">Watch Live</h2>
              <p className="text-red-400 text-xs font-medium mb-3">Match Streams &amp; Video Archive</p>
              <p className="text-gray-400 text-sm mb-4">
                Live match streams on YouTube and the full Challengers CC video archive. Members-only
                access to all match-day content.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                Open
              </span>
            </a>

            {/* Match Replays */}
            <a href="/c3h/replays" className="glass rounded-2xl p-6 border-2 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 block">
              <div className="text-3xl mb-3">🎬</div>
              <h2 className="text-xl font-bold text-white mb-1">Match Replays</h2>
              <p className="text-purple-400 text-xs font-medium mb-3">Full matches with summaries</p>
              <p className="text-gray-400 text-sm mb-4">
                Watch full match recordings, see top performers, and reflect on your innings.
                New matches added after each game.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Open
              </span>
            </a>

            {/* The Nets */}
            <a href="/c3h/nets" className="glass rounded-2xl p-6 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all duration-300 block">
              <div className="text-3xl mb-3">🏏</div>
              <h2 className="text-xl font-bold text-white mb-1">The Nets</h2>
              <p className="text-primary-400 text-xs font-medium mb-3">Coaching, Mindset & Reflection</p>
              <p className="text-gray-400 text-sm mb-4">
                Fill your reflection card, track your mindset, and plan your next innings.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                Open
              </span>
            </a>

            {/* The Scorer */}
            <a href="/c3h/scorer" className="glass rounded-2xl p-6 border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300 block">
              <div className="text-3xl mb-3">📊</div>
              <h2 className="text-xl font-bold text-white mb-1">The Scorer</h2>
              <p className="text-red-400 text-xs font-medium mb-3">Match Scoring & Scorecard</p>
              <p className="text-gray-400 text-sm mb-4">
                Score matches ball-by-ball, coin toss, live scorecard, and match results.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                Open
              </span>
            </a>

            {/* Live Score (read-only) */}
            <a href="/c3h/live" className="glass rounded-2xl p-6 border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300 block relative">
              <div className="text-3xl mb-3">📡</div>
              <h2 className="text-xl font-bold text-white mb-1">Live Score</h2>
              <p className="text-red-400 text-xs font-medium mb-3 inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live · Read-only
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Watch the current match as it&apos;s being scored. Updates ball-by-ball.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                Open
              </span>
            </a>

            {/* The Dugout */}
            <a href="/c3h/availability" className="glass rounded-2xl p-6 border-2 border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 block">
              <div className="text-3xl mb-3">🪖</div>
              <h2 className="text-xl font-bold text-white mb-1">The Dugout</h2>
              <p className="text-blue-400 text-xs font-medium mb-3">Squad Availability & Selection</p>
              <p className="text-gray-400 text-sm mb-4">
                Mark your availability for the season and see who is available for each match.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                Open
              </span>
            </a>

            {/* The Pavilion — Board Only */}
            {isBoard && (
              <div className="glass rounded-2xl p-6 border-2 border-accent-500/20 hover:border-accent-500/50 transition-all duration-300">
                <div className="text-3xl mb-3">🏛️</div>
                <h2 className="text-xl font-bold text-white mb-1">The Pavilion</h2>
                <p className="text-accent-400 text-xs font-medium mb-3">Board Governance & Voting</p>
                <p className="text-gray-400 text-sm mb-4">
                  Review resolutions, cast votes, and e-sign documents.
                </p>
                <span className="text-xs px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
}
