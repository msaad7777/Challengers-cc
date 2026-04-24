import Link from 'next/link';

export default function LiveStreaming() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-950 via-black to-gray-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="glass rounded-2xl p-8 md:p-12 border-2 border-red-500/30 relative overflow-hidden group hover:border-red-500/50 transition-all duration-300">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-sm font-semibold text-red-400">Coming Soon — 2026 Season</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Live Streaming on <span className="gradient-text">YouTube</span>
              </h2>

              <p className="text-gray-300 mb-6">
                Catch every Challengers CC match live on our brand-new YouTube channel.
                Match highlights, player spotlights, coaching tips, and full archived
                matches — all in one place.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Full 2026 season match livestreams</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Match highlights and recap videos</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Player spotlights and coaching tips</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">Community events and fundraisers</span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/watch"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Live
                </Link>
                <a
                  href="https://www.youtube.com/channel/UCtoiAMFhqTeQ-uPN46BJo5Q?sub_confirmation=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 rounded-lg font-semibold transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Subscribe
                </a>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Help us reach <span className="text-red-400 font-semibold">50 subscribers</span> to unlock mobile livestreaming features for match days.
              </p>
            </div>

            {/* Right: Video Player Mockup */}
            <div className="relative">
              <div className="glass rounded-xl p-6 border border-white/10 aspect-video flex items-center justify-center relative overflow-hidden group/player">
                {/* Play Button */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/50 group-hover/player:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">Challengers CC</div>
                    <div className="text-sm text-gray-400">@Challengersccldn</div>
                  </div>
                </div>

                {/* LIVE Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded text-xs font-bold tracking-wider z-10">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  <span>LIVE SOON</span>
                </div>

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-gray-900 to-gray-950"></div>

                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              </div>

              {/* Stats under the player */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-lg font-bold gradient-text">HD</div>
                  <div className="text-xs text-gray-400">1080p Quality</div>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-lg font-bold gradient-text">4hr+</div>
                  <div className="text-xs text-gray-400">Full Matches</div>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-lg font-bold gradient-text">Free</div>
                  <div className="text-xs text-gray-400">Always</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-500/20 to-transparent rounded-tr-full"></div>
        </div>
      </div>
    </section>
  );
}
