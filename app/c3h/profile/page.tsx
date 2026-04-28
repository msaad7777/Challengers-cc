'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar } from '@/components/UserMenu';
import { isC3HBoard } from '@/lib/c3h-access';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/c3h/login?callbackUrl=/c3h/profile');
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

  const isBoard = isC3HBoard(session.user?.email);
  const role = isBoard ? 'Board Member' : 'Player';

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 px-4 py-2 rounded-full mb-4 border border-primary-500/30">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-semibold text-primary-400">C3H · Your Profile</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Profile <span className="gradient-text">Settings</span>
            </h1>
          </div>

          {/* Profile card */}
          <div className="glass rounded-2xl p-8 md:p-10 border-2 border-primary-500/20 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
              <Avatar image={session.user?.image} name={session.user?.name} size="xl" />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {session.user?.name || 'Member'}
                </h2>
                <p className="text-gray-400 mb-3 break-all">{session.user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isBoard
                      ? 'bg-accent-500/20 border-accent-500/30 text-accent-300'
                      : 'bg-primary-500/20 border-primary-500/30 text-primary-300'
                  }`}>
                    {role}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-xs font-semibold text-primary-300">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-400"></span>
                    </span>
                    Signed in to C3H
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Profile Picture</label>
                <p className="text-sm text-gray-300 mt-1">
                  We currently use your Google profile picture. Custom photo uploads are coming soon
                  — for now, update your photo on your{' '}
                  <a
                    href="https://myaccount.google.com/personal-info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 underline"
                  >
                    Google Account
                  </a>
                  {' '}and it will sync next time you sign in.
                </p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Sign-in Method</label>
                <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google ({session.user?.email})
                </p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Session</label>
                <p className="text-sm text-gray-300 mt-1">
                  Stays signed in for 30 days unless you sign out manually. Your session works
                  across all your tabs and devices using the same browser.
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Link
              href="/c3h/dashboard"
              className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/40 transition-all text-center"
            >
              <div className="text-2xl mb-2">🏏</div>
              <p className="text-sm font-semibold text-white">Dashboard</p>
            </Link>
            <Link
              href="/c3h/events"
              className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/40 transition-all text-center"
            >
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm font-semibold text-white">Events</p>
            </Link>
            <Link
              href="/c3h/watch"
              className="glass rounded-xl p-5 border border-white/10 hover:border-red-500/40 transition-all text-center"
            >
              <div className="text-2xl mb-2">📺</div>
              <p className="text-sm font-semibold text-white">Watch Live</p>
            </Link>
          </div>

          {/* Sign out */}
          <div className="text-center">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-lg font-semibold text-red-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
            <p className="text-xs text-gray-500 mt-3">
              You can sign back in anytime by clicking Sign In in the navigation.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
