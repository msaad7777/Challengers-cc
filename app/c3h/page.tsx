import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'C3H — Members Portal | Challengers Cricket Club',
  description: 'C3H is the private members portal for Challengers Cricket Club. The Nets for coaching and video feedback. The Pavilion for board governance and voting.',
};

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
              <span className="text-xs font-medium text-accent-400 uppercase tracking-wider">Coming Soon</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
              C<span className="gradient-text">3</span>H
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-2">
              Challengers Cricket Club — Members Portal
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Private. Secure. Built for the team.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Two Portals */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">

            {/* The Nets */}
            <div className="glass rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
              <div className="text-5xl mb-6">🏏</div>
              <h2 className="text-3xl font-bold text-white mb-3">The Nets</h2>
              <p className="text-primary-400 text-sm font-medium mb-4">Coaching & Video Feedback Portal</p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Upload your batting or bowling videos via YouTube links and get personalized feedback from our coaching staff.
                Improve your technique, track your progress, and take your game to the next level.
              </p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Upload training videos via YouTube links
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Receive coach feedback in text or audio
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Private one-on-one coaching conversations
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track improvement over the season
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500">Access: All registered players & coaches</p>
              </div>
            </div>

            {/* The Pavilion */}
            <div className="glass rounded-2xl p-8 border-2 border-accent-500/20 hover:border-accent-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  Coming Soon
                </span>
              </div>
              <div className="text-5xl mb-6">🏛️</div>
              <h2 className="text-3xl font-bold text-white mb-3">The Pavilion</h2>
              <p className="text-accent-400 text-sm font-medium mb-4">Board Governance & Voting Portal</p>
              <p className="text-gray-400 leading-relaxed mb-6">
                A private space for board members to review resolutions, cast votes, and e-sign documents.
                Democratic decision-making made simple and transparent.
              </p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit and review board resolutions
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Vote agree or disagree on each resolution
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  E-sign documents digitally
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full transparency with voting records
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500">Access: Board members only (Directors, Treasurer, Secretary)</p>
              </div>
            </div>
          </div>

          {/* What is C3H */}
          <div className="mt-16 glass rounded-2xl p-8 md:p-12 text-center border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              What is C<span className="gradient-text">3</span>H?
            </h3>
            <p className="text-gray-400 leading-relaxed max-w-3xl mx-auto mb-6">
              C3H stands for Challengers Cricket Club Hub. It is a private, members-only portal
              built exclusively for Challengers CC players and board members. No public access.
              No outsiders. Just the team.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass rounded-xl p-4">
                <div className="text-2xl font-bold gradient-text mb-1">C</div>
                <div className="text-xs text-gray-500">Challengers</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-2xl font-bold gradient-text mb-1">C C</div>
                <div className="text-xs text-gray-500">Cricket Club</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-2xl font-bold gradient-text mb-1">H</div>
                <div className="text-xs text-gray-500">Hub</div>
              </div>
            </div>
          </div>

          {/* Stay Updated */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              C3H is currently under development. Follow us on{' '}
              <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">
                Instagram @challengers.cc
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
