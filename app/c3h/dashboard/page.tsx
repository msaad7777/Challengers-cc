"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

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

  const isBoard = session.user?.email?.endsWith('@challengerscc.ca');
  const userName = session.user?.name || 'Player';
  const userImage = session.user?.image || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
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

            {/* The Nets */}
            <div className="glass rounded-2xl p-6 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all duration-300">
              <div className="text-3xl mb-3">🏏</div>
              <h2 className="text-xl font-bold text-white mb-1">The Nets</h2>
              <p className="text-primary-400 text-xs font-medium mb-3">Coaching, Mindset & Reflection</p>
              <p className="text-gray-400 text-sm mb-4">
                Upload videos, fill your reflection card, and track your mental game.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Coming Soon
              </span>
            </div>

            {/* The Scoreboard */}
            <div className="glass rounded-2xl p-6 border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300">
              <div className="text-3xl mb-3">📊</div>
              <h2 className="text-xl font-bold text-white mb-1">The Scoreboard</h2>
              <p className="text-red-400 text-xs font-medium mb-3">Performance Tracking & KPIs</p>
              <p className="text-gray-400 text-sm mb-4">
                View your batting and bowling stats, season trends, and match contributions.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Coming Soon
              </span>
            </div>

            {/* The Dugout */}
            <div className="glass rounded-2xl p-6 border-2 border-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-3xl mb-3">🪖</div>
              <h2 className="text-xl font-bold text-white mb-1">The Dugout</h2>
              <p className="text-blue-400 text-xs font-medium mb-3">Squad Selection & Team</p>
              <p className="text-gray-400 text-sm mb-4">
                See if you are selected for the next match and confirm your availability.
              </p>
              <span className="text-xs px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Coming Soon
              </span>
            </div>

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
