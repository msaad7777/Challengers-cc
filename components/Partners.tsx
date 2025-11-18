import Image from 'next/image';

export default function Partners() {
  return (
    <section className="section-padding bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Our <span className="gradient-text">Partners</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Building cricket in Canada together with amazing organizations
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Coaching & Development */}
          <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 hover:border-primary-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full border border-primary-500/30 mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-semibold text-primary-400">Coaching & Development</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl bg-white/10 flex items-center justify-center mb-4 p-4">
                <Image
                  src="/TPG-Cricket Academy.png"
                  alt="TPG Cricket Academy"
                  width={120}
                  height={120}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">TPG Cricket Academy</h3>
              <p className="text-sm text-primary-400 font-medium">Official Coaching Partner</p>
            </div>
          </div>

          {/* Facilities */}
          <div className="glass rounded-2xl p-8 border-2 border-white/10 hover:border-white/20 transition-all duration-300 opacity-75">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-semibold text-gray-400">Facilities</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-1">City of London Recreation</h3>
              <p className="text-sm text-gray-500 font-medium">Coming Soon</p>
            </div>
          </div>

          {/* Sponsors */}
          <div className="glass rounded-2xl p-8 border-2 border-white/10 hover:border-white/20 transition-all duration-300 opacity-75">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-semibold text-gray-400">Sponsors</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-400 mb-1">Your Business Here</h3>
              <p className="text-sm text-gray-500 font-medium">
                <a href="/sponsorship" className="hover:text-primary-400 transition-colors underline">
                  Become a Sponsor
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Interested in partnering with Challengers Cricket Club?
          </p>
          <a
            href="/sponsorship"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            Explore Partnership Opportunities
          </a>
        </div>
      </div>
    </section>
  );
}
