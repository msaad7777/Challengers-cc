import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'C3H — Members Portal | Challengers Cricket Club',
  description: 'C3H is the private members portal for Challengers Cricket Club. The Nets, The Dugout, The Scoreboard, and The Pavilion.',
};

const checkIcon = (color: string) => `<svg class="w-4 h-4 ${color} flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;

export default function C3HPage() {
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
              <span className="text-xs font-medium text-accent-400 uppercase tracking-wider">Members Only — Coming Soon</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
              C<span className="gradient-text">3</span>H
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-2">
              Challengers Cricket Club Hub
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Private. Secure. Built for the team. Sign in with Google.
            </p>
            <a
              href="/c3h/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:scale-105 mb-8"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign In to C3H
            </a>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* 4 Modules */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">

            {/* The Nets */}
            <div className="glass rounded-2xl p-7 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
              <div className="text-4xl mb-4">🏏</div>
              <h2 className="text-2xl font-bold text-white mb-1">The Nets</h2>
              <p className="text-primary-400 text-sm font-medium mb-4">Coaching, Mindset & Reflection</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Upload training videos for coach feedback
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Personal reflection card per match
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Mental game tools and mindset notes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Bounce back routine and reset card
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500">Access: All registered players & coaches</p>
              </div>
            </div>

            {/* The Dugout */}
            <div className="glass rounded-2xl p-7 border-2 border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
              <div className="text-4xl mb-4">🪖</div>
              <h2 className="text-2xl font-bold text-white mb-1">The Dugout</h2>
              <p className="text-blue-400 text-sm font-medium mb-4">Squad Selection & Team Management</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Captain selects squad for each match
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Players notified when selected
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Match details, venue, and timing
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Availability confirmation from players
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500">Access: Captains + Admin</p>
              </div>
            </div>

            {/* The Scoreboard */}
            <div className="glass rounded-2xl p-7 border-2 border-red-500/20 hover:border-red-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white mb-1">The Scoreboard</h2>
              <p className="text-red-400 text-sm font-medium mb-4">Performance Tracking & KPIs</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Batting KPIs: runs, strike rate, dot ball %
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Bowling KPIs: economy, dot balls, wickets
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Team contribution score per match
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Season stats and performance trends
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500">Access: All registered players</p>
              </div>
            </div>

            {/* The Pavilion */}
            <div className="glass rounded-2xl p-7 border-2 border-accent-500/20 hover:border-accent-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
              <div className="text-4xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold text-white mb-1">The Pavilion</h2>
              <p className="text-accent-400 text-sm font-medium mb-4">Board Governance & Voting</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Submit and review board resolutions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Vote agree or disagree
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  E-sign documents digitally
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Full transparency with voting records
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-500">Access: Board members only (Directors, Treasurer, Secretary)</p>
              </div>
            </div>

          </div>

          {/* How It Works */}
          <div className="mt-16 glass rounded-2xl p-8 md:p-12 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              How C<span className="gradient-text">3</span>H Works
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary-500/30">
                  <span className="text-xl font-bold gradient-text">1</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">Sign In</h4>
                <p className="text-gray-500 text-xs">Log in with your Google account (@challengerscc.ca or approved Gmail)</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary-500/30">
                  <span className="text-xl font-bold gradient-text">2</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">Your Dashboard</h4>
                <p className="text-gray-500 text-xs">See your next match, stats, reflection cards, and notifications in one place</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary-500/30">
                  <span className="text-xl font-bold gradient-text">3</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">Grow</h4>
                <p className="text-gray-500 text-xs">Track your performance, reflect after every game, and improve every season</p>
              </div>
            </div>
          </div>

          {/* What is C3H */}
          <div className="mt-8 glass rounded-2xl p-8 text-center border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              What is C<span className="gradient-text">3</span>H?
            </h3>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-6">
              C3H stands for Challengers Cricket Club Hub. A private, members-only portal
              built exclusively for Challengers CC players and board members. No public access.
              No outsiders. Just the team.
            </p>
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="glass rounded-xl p-3">
                <div className="text-lg font-bold gradient-text">🏏</div>
                <div className="text-xs text-gray-500 mt-1">The Nets</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-lg font-bold gradient-text">🪖</div>
                <div className="text-xs text-gray-500 mt-1">The Dugout</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-lg font-bold gradient-text">📊</div>
                <div className="text-xs text-gray-500 mt-1">Scoreboard</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-lg font-bold gradient-text">🏛️</div>
                <div className="text-xs text-gray-500 mt-1">Pavilion</div>
              </div>
            </div>
          </div>

          {/* Build Roadmap */}
          <div className="mt-8 glass rounded-2xl p-8 border border-primary-500/20">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Build Roadmap</h3>
            <div className="space-y-3 max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Google Auth + Player Login</p>
                  <p className="text-primary-400 text-xs">Live</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">2</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">The Nets — Reflection Cards & Mindset Tools</p>
                  <p className="text-gray-500 text-xs">Personal reflection per match, mental game checklists</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">3</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">The Scoreboard — Match KPIs & Season Stats</p>
                  <p className="text-gray-500 text-xs">Score entry, batting/bowling stats, contribution tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">4</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">The Dugout — Squad Selection</p>
                  <p className="text-gray-500 text-xs">Captain picks team, players confirm availability</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-400">5</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">The Pavilion — Board Governance</p>
                  <p className="text-gray-500 text-xs">Resolutions, voting, e-sign, meeting records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Updated */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              C3H is under active development. Follow{' '}
              <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">
                @challengers.cc
              </a>{' '}
              for launch updates.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
