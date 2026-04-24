"use client";

import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { matchDetailsToEvent, googleCalendarUrl, generateICS } from '@/app/c3h/events/data';

// Dates where LCL T30 and LPL T30 overlap
const CLASH_DATES = ['May 10, 2026', 'June 27, 2026', 'July 25, 2026', 'August 2, 2026'];

interface Match {
  league?: string;
  match: number;
  date: string;
  sortKey: string; // YYYY-MM-DD-HHMM for reliable sorting
  day: string;
  time: string;
  opponent: string;
  venue: string;
}

const lclT30Matches: Match[] = [
  { match: 1, date: 'May 10, 2026', sortKey: '2026-05-10-1300', day: 'Saturday', time: '1:00 PM', opponent: 'London Predators', venue: 'Northridge Cricket Ground' },
  { match: 2, date: 'May 18, 2026', sortKey: '2026-05-18-0800', day: 'Sunday', time: '8:00 AM', opponent: 'Forest City Cricketers', venue: 'North London Athletic Fields' },
  { match: 3, date: 'June 14, 2026', sortKey: '2026-06-14-1000', day: 'Sunday', time: '10:00 AM', opponent: 'Sarnia Spartans', venue: 'Mike Vier Park, Sarnia' },
  { match: 4, date: 'June 27, 2026', sortKey: '2026-06-27-0800', day: 'Saturday', time: '8:00 AM', opponent: 'Western Cricket Academy B', venue: 'Silverwoods Cricket Ground' },
  { match: 5, date: 'July 1, 2026', sortKey: '2026-07-01-0800', day: 'Wednesday', time: '8:00 AM', opponent: 'London Rising Stars', venue: 'North London Athletic Fields' },
  { match: 6, date: 'July 11, 2026', sortKey: '2026-07-11-0800', day: 'Saturday', time: '8:00 AM', opponent: 'LCC - Maple Stars', venue: 'Northridge Cricket Ground' },
  { match: 7, date: 'July 25, 2026', sortKey: '2026-07-25-1300', day: 'Saturday', time: '1:00 PM', opponent: 'LCC Mavericks', venue: 'North London Athletic Fields' },
  { match: 8, date: 'July 26, 2026', sortKey: '2026-07-26-1300', day: 'Sunday', time: '1:00 PM', opponent: 'London Rising Stars', venue: 'North London Athletic Fields' },
  { match: 9, date: 'August 2, 2026', sortKey: '2026-08-02-0800', day: 'Sunday', time: '8:00 AM', opponent: 'Western Cricket Academy B', venue: 'Northridge Cricket Ground' },
  { match: 10, date: 'August 8, 2026', sortKey: '2026-08-08-1300', day: 'Saturday', time: '1:00 PM', opponent: 'Forest City Cricketers', venue: 'North London Athletic Fields' },
  { match: 11, date: 'August 23, 2026', sortKey: '2026-08-23-1300', day: 'Sunday', time: '1:00 PM', opponent: 'Sarnia Spartans', venue: 'Northridge Cricket Ground' },
  { match: 12, date: 'September 5, 2026', sortKey: '2026-09-05-1500', day: 'Saturday', time: '3:00 PM', opponent: 'London Eagle Predators', venue: 'Silverwoods Cricket Ground' },
  { match: 13, date: 'September 12, 2026', sortKey: '2026-09-12-1300', day: 'Saturday', time: '1:00 PM', opponent: 'Inferno Spartans', venue: 'North London Athletic Fields' },
  { match: 14, date: 'September 13, 2026', sortKey: '2026-09-13-1500', day: 'Sunday', time: '3:00 PM', opponent: 'Tigers Cricket Club', venue: 'Northridge Cricket Ground' },
];

const lplT30Matches: Match[] = [
  { match: 1, date: 'May 10, 2026', sortKey: '2026-05-10-1000', day: 'Sunday', time: '10:00 AM', opponent: 'Maple Tigers', venue: 'Silverwoods Cricket Ground' },
  { match: 2, date: 'May 24, 2026', sortKey: '2026-05-24-1000', day: 'Sunday', time: '10:00 AM', opponent: 'London Rhinos', venue: 'North London Athletic Fields' },
  { match: 3, date: 'May 31, 2026', sortKey: '2026-05-31-1400', day: 'Sunday', time: '2:00 PM', opponent: 'NLCC', venue: 'Thamesville' },
  { match: 4, date: 'June 7, 2026', sortKey: '2026-06-07-1000', day: 'Sunday', time: '10:00 AM', opponent: 'Royal Tigers', venue: 'Silverwoods Cricket Ground' },
  { match: 5, date: 'June 13, 2026', sortKey: '2026-06-13-0800', day: 'Saturday', time: '8:00 AM', opponent: 'Maple Tigers', venue: 'Northridge Cricket Ground' },
  { match: 6, date: 'June 27, 2026', sortKey: '2026-06-27-0900', day: 'Saturday', time: '9:00 AM', opponent: 'Premier XI', venue: 'Thamesville' },
  { match: 7, date: 'July 4, 2026', sortKey: '2026-07-04-1000', day: 'Saturday', time: '10:00 AM', opponent: 'London Stars', venue: 'Northridge Cricket Ground' },
  { match: 8, date: 'July 18, 2026', sortKey: '2026-07-18-1000', day: 'Saturday', time: '10:00 AM', opponent: 'Premier XI', venue: 'Northridge Cricket Ground' },
  { match: 9, date: 'July 25, 2026', sortKey: '2026-07-25-0900', day: 'Saturday', time: '9:00 AM', opponent: 'London Rhinos', venue: 'Thamesville' },
  { match: 10, date: 'August 2, 2026', sortKey: '2026-08-02-1000', day: 'Sunday', time: '10:00 AM', opponent: 'NLCC', venue: 'Silverwoods Cricket Ground' },
  { match: 11, date: 'August 30, 2026', sortKey: '2026-08-30-1000', day: 'Sunday', time: '10:00 AM', opponent: 'Royal Tigers', venue: 'Silverwoods Cricket Ground' },
  { match: 12, date: 'September 6, 2026', sortKey: '2026-09-06-1300', day: 'Sunday', time: '1:00 PM', opponent: 'London Stars', venue: 'North London Athletic Fields' },
];

// Create separate arrays for each tab — sorted by sortKey (YYYY-MM-DD-HHMM)
const lclOnly: Match[] = lclT30Matches.map(m => ({ ...m, league: 'LCL' }));
const lplOnly: Match[] = lplT30Matches.map(m => ({ ...m, league: 'LPL' }));
const allMatches: Match[] = [
  ...lclT30Matches.map(m => ({ ...m, league: 'LCL' })),
  ...lplT30Matches.map(m => ({ ...m, league: 'LPL' })),
].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

const tabs = [
  { id: 'all', label: 'All Matches', matches: allMatches, status: 'active' as const },
  { id: 'lcl-t30', label: 'LCL T30', matches: lclOnly, status: 'active' as const },
  { id: 'lcl-t20', label: 'LCL T20', matches: [] as Match[], status: 'coming-soon' as const },
  { id: 'lpl-t30', label: 'LPL T30', matches: lplOnly, status: 'active' as const },
];

function matchToCalEvent(m: Match) {
  return matchDetailsToEvent({
    league: m.league,
    matchNumber: m.match,
    date: m.date,
    time: m.time,
    opponent: m.opponent,
    venue: m.venue,
  });
}

function downloadMatchICS(m: Match) {
  const event = matchToCalEvent(m);
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SignInPrompt() {
  return (
    <Link
      href="/c3h/login?callbackUrl=/schedule"
      title="Sign in to add matches to your calendar"
      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-md text-xs font-semibold text-gray-400 transition-all"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Sign in
    </Link>
  );
}

function MatchTable({ matches }: { matches: Match[] }) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated' && !!session;

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">#</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Time</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Opponent</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Venue</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Calendar</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={`${m.league ?? ''}-${m.match}`} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${CLASH_DATES.includes(m.date) ? 'bg-red-500/5' : ''}`}>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-primary-400">{m.league ? `${m.league} ` : ''}M{m.match}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white font-medium flex items-center gap-1.5">{m.date}{CLASH_DATES.includes(m.date) && <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block flex-shrink-0" title="Schedule clash with other league"></span>}</div>
                  <div className="text-xs text-gray-500">{m.day}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white">{m.time}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white font-medium">vs {m.opponent}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-400">{m.venue}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    {isAuthed ? (
                      <>
                        <a
                          href={googleCalendarUrl(matchToCalEvent(m))}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Add to Google Calendar"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary-500/20 border border-primary-500/30 hover:bg-primary-500/30 hover:border-primary-500/50 rounded-md text-xs font-semibold text-primary-300 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Google
                        </a>
                        <button
                          onClick={() => downloadMatchICS(m)}
                          title="Download .ics (Apple Calendar / Outlook)"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-md text-xs font-semibold text-gray-300 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          .ics
                        </button>
                      </>
                    ) : (
                      <SignInPrompt />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {matches.map((m) => (
          <div key={`${m.league ?? ''}-${m.match}`} className={`glass rounded-xl p-5 border-l-4 ${CLASH_DATES.includes(m.date) ? 'border-l-red-500' : 'border-l-primary-500'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-primary-400">{m.league ? `${m.league} ` : ''}Match {m.match}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">vs {m.opponent}</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {m.date} ({m.day}) {CLASH_DATES.includes(m.date) && <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1"></span>}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {m.time}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {m.venue}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {isAuthed ? (
                <>
                  <a
                    href={googleCalendarUrl(matchToCalEvent(m))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-500/20 border border-primary-500/30 hover:bg-primary-500/30 rounded-md text-xs font-semibold text-primary-300 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Google Calendar
                  </a>
                  <button
                    onClick={() => downloadMatchICS(m)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-md text-xs font-semibold text-gray-300 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    .ics
                  </button>
                </>
              ) : (
                <Link
                  href="/c3h/login?callbackUrl=/schedule"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-md text-xs font-semibold text-gray-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sign in to add to calendar
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SchedulePageContent() {
  // v2 - fixed tab data
  const [activeTab, setActiveTab] = useState('all');
  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Hero */}
      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
              <span className="text-sm text-gray-300">2026 Season</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Match <span className="gradient-text">Schedule</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Challengers Cricket Club 2026 Fixtures
            </p>

            <div className="max-w-3xl mx-auto glass rounded-2xl p-6 mt-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">26+</div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">3</div>
                  <div className="text-sm text-gray-400">Leagues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">May - Sep</div>
                  <div className="text-sm text-gray-400">Season</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule with Tabs */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">

          {/* League Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400 border-primary-500/50 shadow-lg shadow-primary-500/10'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.status === 'coming-soon' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                    Soon
                  </span>
                )}
                {tab.status === 'active' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                    {tab.matches.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {currentTab.status === 'coming-soon' ? (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <div className="text-5xl mb-6">🏏</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {currentTab.label} Schedule Coming Soon
              </h3>
              <p className="text-gray-400 max-w-lg mx-auto">
                The {currentTab.label} league schedule will be published once fixtures are confirmed.
                Follow us on Instagram for updates.
              </p>
              <a
                href="https://www.instagram.com/challengers.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium hover:shadow-primary-500/50 shadow-xl transition-all duration-300 hover:scale-105"
              >
                Follow @challengers.cc
              </a>
            </div>
          ) : (
            <MatchTable key={activeTab} matches={currentTab.matches} />
          )}

          {/* Venues */}
          <div className="mt-12 glass rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Venues</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Northridge Cricket Ground</div>
                  <div className="text-gray-500">London, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">North London Athletic Fields</div>
                  <div className="text-gray-500">London, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Silverwoods Cricket Ground</div>
                  <div className="text-gray-500">London, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Mike Vier Park</div>
                  <div className="text-gray-500">Sarnia, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Thamesville</div>
                  <div className="text-gray-500">Thamesville, ON (LPL)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Schedule is subject to change due to weather or league decisions. Follow{' '}
              <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">
                @challengers.cc
              </a>{' '}
              for live updates.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function SchedulePage() {
  return (
    <SessionProvider>
      <SchedulePageContent />
    </SessionProvider>
  );
}
