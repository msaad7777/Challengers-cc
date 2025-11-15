import Link from 'next/link';

export default function SponsorshipBanner() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-950 via-black to-gray-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="glass rounded-2xl p-8 md:p-12 border-2 border-primary-500/30 relative overflow-hidden group hover:border-primary-500/50 transition-all duration-300">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-accent-500/20 px-4 py-2 rounded-full mb-4">
                <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-semibold text-accent-400">Partnership Opportunities</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Become a <span className="gradient-text">Founding Sponsor</span>
              </h2>

              <p className="text-gray-300 mb-6">
                Join us in building London, Ontario&apos;s premier cricket club. Partner with a registered
                non-profit organization committed to developing cricket excellence and community spirit.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">High visibility across all club activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Tax benefits as registered Ontario non-profit</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Community engagement and brand recognition</span>
                </li>
              </ul>

              <Link
                href="/sponsorship"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                Explore Sponsorship Packages
              </Link>
            </div>

            {/* Right: Stats/Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">Est. 2025</div>
                <div className="text-sm text-gray-400">Now Active</div>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">3+</div>
                <div className="text-sm text-gray-400">Teams & Programs</div>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">100%</div>
                <div className="text-sm text-gray-400">Non-Profit</div>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-2">Local</div>
                <div className="text-sm text-gray-400">London, ON</div>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent-500/20 to-transparent rounded-tr-full"></div>
        </div>
      </div>
    </section>
  );
}
