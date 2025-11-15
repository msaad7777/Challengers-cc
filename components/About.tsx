export default function About() {
  return (
    <section className="section-padding bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            About <span className="gradient-text">Challengers</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-8 glass-hover">
              <h3 className="text-2xl font-bold mb-4 text-primary-400">Our Story</h3>
              <p className="text-gray-300 leading-relaxed">
                Formed in 2025, Challengers Cricket Club brings together passionate cricket enthusiasts from
                various clubs across London, Ontario. United by our love for the game, we&apos;ve created a welcoming
                community where players of all backgrounds come together as one team. We&apos;re more than just a
                cricket club—we&apos;re building a family dedicated to growing the sport in London.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 glass-hover">
              <h3 className="text-2xl font-bold mb-4 text-accent-400">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                To cultivate cricket excellence in London, Ontario by providing an inclusive platform where
                players of all skill levels—from beginners to experienced cricketers—can develop their talents,
                compete with integrity, and contribute to the cricket community. We welcome anyone passionate
                about cricket who wants to be part of London&apos;s growing cricket scene.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 glass-hover">
              <h3 className="text-2xl font-bold mb-4 gradient-text">Our Culture</h3>
              <p className="text-gray-300 leading-relaxed">
                We believe in unity, inclusivity, and the power of cricket to bring people together. Whether
                you&apos;re joining us from another club or stepping onto the pitch for the first time, you&apos;ll find
                a welcoming home at Challengers. Every practice, every match, every moment is an opportunity to
                grow together and strengthen London&apos;s cricket community.
              </p>
            </div>
          </div>

          {/* Right: Highlight Card */}
          <div className="relative">
            <div className="glass rounded-3xl p-10 border-2 border-primary-500/30 relative overflow-hidden group">
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-primary-500/20 px-4 py-2 rounded-full mb-6">
                  <span className="text-primary-400 font-semibold">Why Join Us?</span>
                </div>

                <h3 className="text-3xl font-bold mb-8 gradient-text">What We Offer</h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Elite Training</h4>
                      <p className="text-gray-400 text-sm">Professional coaching and development programs for all ages</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Vibrant Community</h4>
                      <p className="text-gray-400 text-sm">Connect with fellow cricket lovers and build lifelong friendships</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Competitive Play</h4>
                      <p className="text-gray-400 text-sm">Regular matches, tournaments, and league participation</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Youth Development</h4>
                      <p className="text-gray-400 text-sm">Dedicated programs to nurture the next generation of cricketers</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-center text-gray-400 italic">
                    &ldquo;United by passion, driven by excellence&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
