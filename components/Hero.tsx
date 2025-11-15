"use client";

import Image from 'next/image';

export default function Hero() {
  const scrollToInterest = () => {
    const element = document.getElementById('interest-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/logo-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-950/90 to-black/95"></div>
      </div>

      {/* Animated Background Gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent-900/10 via-transparent to-transparent"></div>
      </div>

      {/* Floating Cricket Ball Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-2 border-primary-500 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full border-2 border-accent-500 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 rounded-full border-2 border-primary-400 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Logo */}
          <div className="mb-8 animate-slide-up flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative rounded-full p-2">
                <Image
                  src="/ccc-logo.png"
                  alt="Challengers Cricket Club Logo"
                  width={120}
                  height={120}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))',
                    mixBlendMode: 'screen'
                  }}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">New Club • London, Ontario</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <span className="block text-white mb-2">Challengers</span>
            <span className="block gradient-text">Cricket Club</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4 font-light animate-slide-up" style={{ animationDelay: '0.3s' }}>
            One Team. One Dream.
          </p>
          <p className="text-lg sm:text-xl text-primary-400 mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            London, Ontario
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={scrollToInterest}
              className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Join Our Club</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="glass rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Est. 2025</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">New Beginning</div>
            </div>
            <div className="glass rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Open</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">To All Players</div>
            </div>
            <div className="glass rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">United</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">One Community</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-primary-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
}
