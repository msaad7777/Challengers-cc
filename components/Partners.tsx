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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Coaching & Development - TPG Cricket Academy */}
          <div className="glass rounded-2xl p-8 border-2 border-accent-500/30 hover:border-accent-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 rounded-full border border-accent-500/20 mb-4">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-semibold text-accent-400">Official Coaching Partner</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flip-card w-32 h-32 mb-4">
                <div className="flip-card-inner relative w-full h-full">
                  <div className="flip-card-front absolute w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-2">
                    <Image
                      src="/TPG-Cricket Academy.png"
                      alt="TPG Cricket Academy"
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flip-card-back absolute w-full h-full rounded-xl overflow-hidden">
                    <Image
                      src="/Manish-sir.jpeg"
                      alt="Coach Manish Giri"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">TPG Cricket Academy</h3>
              <p className="text-sm text-accent-400 font-medium">Coach Manish Giri • Ex-Delhi Cricketer</p>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href="https://instagram.com/tpgcricket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  @tpgcricket
                </a>
                <a
                  href="https://www.youtube.com/@tpgcricket6843"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              </div>
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

          {/* Platinum Sponsor */}
          <div className="glass rounded-2xl p-8 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-semibold text-purple-400">Platinum Sponsor</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4">
                <Image
                  src="/bhupinder-singh-sponsor.jpeg"
                  alt="Bhupinder Singh - Realtor at Century 21"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Bhupinder Singh</h3>
              <p className="text-sm text-purple-400 font-medium">Realtor® | Century 21</p>
              <p className="text-xs text-gray-400 mt-1">First Canadian Corp.</p>
              <a href="https://www.getrealwithinder.com" target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 mt-1">getrealwithinder.com</a>
            </div>
          </div>

          {/* Gold Sponsor */}
          <div className="glass rounded-2xl p-8 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-semibold text-blue-400">Gold Sponsor</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4">
                <Image
                  src="/freddy-george-sponsor.jpeg"
                  alt="Freddy George - Licensed Financial Advisor"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Freddy George</h3>
              <p className="text-sm text-blue-400 font-medium">Licensed Financial Advisor</p>
              <p className="text-xs text-gray-400 mt-1">Wealth Management</p>
            </div>
          </div>

          {/* Gold Sponsor - Ashvak Sheik */}
          <div className="glass rounded-2xl p-8 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-semibold text-blue-400">Gold Sponsor</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4">
                <Image
                  src="/ashvak-sheik-sponsor.jpeg"
                  alt="Ashvak Sheik - Future Nest Realty"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ashvak Sheik</h3>
              <p className="text-sm text-blue-400 font-medium">Future Nest Realty</p>
              <p className="text-xs text-gray-400 mt-1">Re/Max President Realty</p>
              <a href="https://www.ashvaksheik.com" target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300 mt-1">ashvaksheik.com</a>
            </div>
          </div>

          {/* Gold Sponsor - RabyIT */}
          <div className="glass rounded-2xl p-8 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-semibold text-blue-400">Gold Sponsor</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4 bg-white flex items-center justify-center p-2">
                <Image
                  src="/rabyit-sponsor.jpeg"
                  alt="RabyIT Accounting Services CA"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">RabyIT</h3>
              <p className="text-sm text-blue-400 font-medium">Accounting Services CA</p>
              <p className="text-xs text-gray-400 mt-1">Accounting, Payroll & Tax Services</p>
            </div>
          </div>

          {/* Community Partner */}
          <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 hover:border-primary-500/50 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full border border-primary-500/20 mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold text-primary-400">Community Partner</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4 bg-white flex items-center justify-center p-2">
                <Image
                  src="/koverdrive-sponsor.png"
                  alt="Kover Drive - Cricket Organization, London Ontario"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Kover Drive</h3>
              <p className="text-sm text-primary-400 font-medium">Indoor Cricket Practice Facility</p>
              <p className="text-xs text-gray-400 mt-1">London, Ontario</p>
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
