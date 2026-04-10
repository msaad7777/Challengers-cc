export default function Clubhouse() {
  return (
    <section id="clubhouse" className="section-padding bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <span className="text-xs font-medium text-accent-400 uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            CCC <span className="gradient-text">Clubhouse</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your private portal for coaching, training, and club governance. Exclusively for Challengers CC members and board.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Nets */}
          <div className="glass rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Coming Soon
              </span>
            </div>
            <div className="text-5xl mb-6">🏏</div>
            <h3 className="text-2xl font-bold text-white mb-3">The Nets</h3>
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
          <div className="glass rounded-2xl p-8 border-2 border-accent-500/20 hover:border-accent-500/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Coming Soon
              </span>
            </div>
            <div className="text-5xl mb-6">🏛️</div>
            <h3 className="text-2xl font-bold text-white mb-3">The Pavilion</h3>
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

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto border border-white/10">
            <p className="text-gray-400 text-sm">
              CCC Clubhouse is currently under development and will be available exclusively to registered members and board of Challengers Cricket Club.
              Stay tuned for updates on our <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">Instagram</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
