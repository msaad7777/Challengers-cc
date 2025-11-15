export default function Programs() {
  const programs = [
    {
      title: "London Challengers",
      subtitle: "Main Team",
      description: "Our flagship competitive team representing London in regional and provincial tournaments. For experienced players ready to take on the best.",
      features: [
        "Competitive league matches",
        "Provincial tournaments",
        "Professional coaching staff",
        "Team fitness programs"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      gradient: "from-primary-600 to-primary-500",
      glowColor: "primary-500"
    },
    {
      title: "Youth Development",
      subtitle: "U15 / U19 Programs",
      description: "Comprehensive training programs designed to nurture young talent. Learn fundamentals, build skills, and develop a love for cricket.",
      features: [
        "Age-appropriate coaching",
        "Skill development focus",
        "Character building",
        "Pathway to main team"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: "from-accent-600 to-accent-500",
      glowColor: "accent-500"
    },
    {
      title: "Community Cricket",
      subtitle: "Friendly Matches",
      description: "Casual cricket for those who love the game. Social matches, weekend games, and community events. All skill levels welcome.",
      features: [
        "Relaxed atmosphere",
        "Weekend matches",
        "Social events",
        "Beginner-friendly"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-primary-500 to-accent-500",
      glowColor: "primary-400"
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Our <span className="gradient-text">Programs</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Whether you&apos;re a seasoned pro or just starting out, we have a place for you
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className="glass rounded-2xl p-8 h-full flex flex-col relative overflow-hidden border-2 border-white/5 hover:border-white/20 transition-all duration-500">
                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${program.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${program.gradient} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {program.icon}
                </div>

                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-1 group-hover:gradient-text transition-all duration-300">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">{program.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-gray-400 mb-6 flex-grow">
                  {program.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className="w-full py-3 glass glass-hover rounded-lg font-semibold text-sm group-hover:bg-white/10 transition-all duration-300">
                  <span className="gradient-text">Learn More</span>
                </button>

                {/* Glow Effect */}
                <div className={`absolute -inset-px bg-gradient-to-br ${program.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500 -z-10`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Cricket Journey?</h3>
            <p className="text-gray-400 mb-6">
              Join London&apos;s united cricket community and be part of something special.
            </p>
            <a
              href="#interest-section"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
