'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from './EventCard';
import SubscribeAll from './SubscribeAll';
import { getUpcomingEvents, getPastEvents } from './data';

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/c3h/login?callbackUrl=/c3h/events');
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

  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 px-4 py-2 rounded-full mb-4 border border-primary-500/30">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-primary-400">C3H · Club Events</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Events &amp; <span className="gradient-text">Calendar</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-2">
              Welcome, {session.user?.name?.split(' ')[0] || 'Challenger'}. Training sessions and
              confirmed club events, members-only.
            </p>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-8">
              Add any event to your Google Calendar with one click — or download the full club
              calendar for Apple / Outlook. Looking for matches? Visit the{' '}
              <Link href="/schedule" className="text-primary-400 hover:text-primary-300 underline">
                match schedule
              </Link>
              {' '}— matches are calendar-addable from there too once you&apos;re signed in.
            </p>
            <div className="flex justify-center">
              <SubscribeAll />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Works with Google Calendar, Apple Calendar, Outlook, and any .ics-compatible app
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Upcoming <span className="gradient-text">Events</span>
            </h2>
            <span className="text-sm text-gray-400">
              {upcoming.length} {upcoming.length === 1 ? 'event' : 'events'} scheduled
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-gray-300 text-lg">
                No upcoming events scheduled at the moment.
              </p>
              <p className="text-gray-500 mt-2">Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Past <span className="gradient-text">Events</span>
            </h2>
            <div className="space-y-4">
              {past.slice(0, 10).map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to dashboard CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
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
