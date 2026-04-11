import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Match Schedule — 2026 LCL Season | Challengers Cricket Club',
  description: 'Full match schedule for Challengers Cricket Club in the 2026 London Cricket League (LCL) T30 season.',
};

const matches = [
  {
    match: 1,
    date: 'May 10, 2026',
    day: 'Saturday',
    time: '1:00 PM',
    opponent: 'London Predators',
    venue: 'Northridge Cricket Ground',
    home: true,
  },
  {
    match: 2,
    date: 'May 18, 2026',
    day: 'Sunday',
    time: '8:00 AM',
    opponent: 'Forest City Cricketers',
    venue: 'North London Athletic Fields',
    home: false,
  },
  {
    match: 3,
    date: 'June 14, 2026',
    day: 'Sunday',
    time: '10:00 AM',
    opponent: 'Sarnia Spartans',
    venue: 'MikeVier Park, Sarnia',
    home: false,
  },
  {
    match: 4,
    date: 'June 27, 2026',
    day: 'Saturday',
    time: '8:00 AM',
    opponent: 'Western Cricket Academy B',
    venue: 'Silverwoods Cricket Ground',
    home: false,
  },
  {
    match: 5,
    date: 'July 1, 2026',
    day: 'Wednesday',
    time: '8:00 AM',
    opponent: 'London Rising Stars',
    venue: 'North London Athletic Fields',
    home: false,
  },
  {
    match: 6,
    date: 'July 11, 2026',
    day: 'Saturday',
    time: '8:00 AM',
    opponent: 'LCC - Maple Stars',
    venue: 'Northridge Cricket Ground',
    home: true,
  },
  {
    match: 7,
    date: 'July 25, 2026',
    day: 'Saturday',
    time: '1:00 PM',
    opponent: 'LCC Mavericks',
    venue: 'North London Athletic Fields',
    home: false,
  },
  {
    match: 8,
    date: 'July 26, 2026',
    day: 'Sunday',
    time: '1:00 PM',
    opponent: 'London Rising Stars',
    venue: 'North London Athletic Fields',
    home: false,
  },
  {
    match: 9,
    date: 'August 2, 2026',
    day: 'Sunday',
    time: '8:00 AM',
    opponent: 'Western Cricket Academy B',
    venue: 'Northridge Cricket Ground',
    home: true,
  },
  {
    match: 10,
    date: 'August 8, 2026',
    day: 'Saturday',
    time: '8:00 AM',
    opponent: 'Forest City Cricketers',
    venue: 'North London Athletic Fields',
    home: false,
  },
  {
    match: 11,
    date: 'August 23, 2026',
    day: 'Sunday',
    time: '1:00 PM',
    opponent: 'Sarnia Spartans',
    venue: 'Northridge Cricket Ground',
    home: true,
  },
  {
    match: 12,
    date: 'September 5, 2026',
    day: 'Saturday',
    time: '3:00 PM',
    opponent: 'London Eagle Predators',
    venue: 'Silverwoods Cricket Ground',
    home: false,
  },
  {
    match: 13,
    date: 'September 12, 2026',
    day: 'Saturday',
    time: '1:00 PM',
    opponent: 'Inferno Spartans',
    venue: 'North London Athletic Fields',
    home: false,
  },
  {
    match: 14,
    date: 'September 13, 2026',
    day: 'Sunday',
    time: '3:00 PM',
    opponent: 'Tigers Cricket Club',
    venue: 'Northridge Cricket Ground',
    home: true,
  },
];

export default function SchedulePage() {
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
              <span className="text-sm text-gray-300">LCL T30 League</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Match <span className="gradient-text">Schedule</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              2026 London Cricket League Season
            </p>

            <div className="max-w-3xl mx-auto glass rounded-2xl p-6 mt-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">14</div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">5</div>
                  <div className="text-sm text-gray-400">Home Games</div>
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

      {/* Schedule */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">

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
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Type</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr
                    key={m.match}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-primary-400">M{m.match}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-medium">{m.date}</div>
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
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          m.home
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'bg-white/10 text-gray-400 border border-white/20'
                        }`}
                      >
                        {m.home ? 'Home' : 'Away'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {matches.map((m) => (
              <div
                key={m.match}
                className={`glass rounded-xl p-5 border-l-4 ${
                  m.home ? 'border-l-primary-500' : 'border-l-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-primary-400">Match {m.match}</span>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      m.home
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-white/10 text-gray-400 border border-white/20'
                    }`}
                  >
                    {m.home ? 'Home' : 'Away'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">vs {m.opponent}</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {m.date} ({m.day})
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
              </div>
            ))}
          </div>

          {/* Venues Legend */}
          <div className="mt-12 glass rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Venues</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-primary-400 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Northridge Cricket Ground</div>
                  <div className="text-gray-500">Home Ground, London, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">North London Athletic Fields</div>
                  <div className="text-gray-500">London, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Silverwoods Cricket Ground</div>
                  <div className="text-gray-500">London, ON</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-gray-500 mt-0.5">&#9679;</span>
                <div>
                  <div className="text-white font-medium">Mike Vier Park</div>
                  <div className="text-gray-500">Sarnia, ON</div>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
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
