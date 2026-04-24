import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from './EventCard';
import SubscribeAll from './SubscribeAll';
import { getUpcomingEvents, getPastEvents } from './data';

export const metadata = {
  title: 'Events — Challengers Cricket Club',
  description:
    'Upcoming matches, training sessions, BBQs, fundraisers, and community events for Challengers Cricket Club, London Ontario. Add any event directly to Google Calendar.',
};

export const dynamic = 'force-static';

export default function EventsPage() {
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
              <span className="text-sm font-semibold text-primary-400">Club Events</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Events &amp; <span className="gradient-text">Calendar</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Upcoming matches, training, BBQs, fundraisers, and community events. Add any event to
              your Google Calendar with one click — or download the full club calendar to stay in
              sync all season.
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
              <p className="text-gray-500 mt-2">Check back soon or follow us on social media for updates.</p>
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

      {/* Call-to-action block */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-10 border-2 border-primary-500/30 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Never miss an <span className="gradient-text">event</span>
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Registered players: all club events — matches, training, socials — live on this page.
              Add the full calendar to your phone or Google account so you never miss a match or BBQ.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <SubscribeAll />
              <Link
                href="/#interest-section"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register with the Club
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
