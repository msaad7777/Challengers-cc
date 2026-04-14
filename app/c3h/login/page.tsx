"use client";

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              C<span className="gradient-text">3</span>H
            </h1>
            <p className="text-gray-400">Members Only Portal</p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-bold text-white text-center mb-6">Sign In</h2>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm text-center">
                  {error === 'AccessDenied'
                    ? 'Access denied. Your email is not authorized. Contact the admin if you believe this is an error.'
                    : 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}

            <button
              onClick={() => signIn('google', { callbackUrl: '/c3h/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-xs text-center">
                Access is restricted to registered Challengers CC players and board members.
                Use your @challengerscc.ca email or approved Gmail account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
