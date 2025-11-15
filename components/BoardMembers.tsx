import Image from 'next/image';

export default function BoardMembers() {
  const boardMembers = [
    {
      name: "Mohammed Saad",
      title: "Director",
      role: "Board of Directors",
      bio: "Science graduate with 10 years of cricket leadership experience as director and founding member of multiple cricket clubs across the globe. Established IT foundations and positive club environments while dedicated to community betterment through non-profit work since childhood.",
      image: "/saad-final.jpeg",
      initials: "MS"
    },
    {
      name: "Gokul Prakash",
      title: "Director",
      role: "Board of Directors",
      bio: "Hardware and Networking Engineer with a lifelong passion for cricket and community service. Dedicated to growing cricket in Canada while pursuing interests in YouTube blogging and international travel. Volunteered in various community-based events for community betterment over the past 15 years.",
      image: "/gokul-final.jpeg",
      initials: "GP"
    },
    {
      name: "Tarek Islam",
      title: "Director",
      role: "Board of Directors",
      bio: "Banking Advisor and batting all-rounder bringing strategic judgment and competitive spirit to club leadership. Co-founder of the Bangladesh Association of London, Ontario, and Nucleus71 political think tank. Former Vice President of Kabi Nazrul College Debating Society and National Debating Competition representative. University of Dhaka graduate committed to purposeful leadership and community engagement.",
      image: "/Tarek-Director.jpeg",
      initials: "TI"
    },
    {
      name: "Ankush Arora",
      title: "Director",
      role: "Player Development & Team Morale",
      bio: "Civil Engineer bringing analytical precision to club operations. A mystery spin bowler with an athletic personality, known for his energetic presence and unwavering support that lifts team spirits on and off the field.",
      image: "/Ankush-boardm.jpeg",
      initials: "AA"
    },
    {
      name: "Quraishi Qaiser Mahmood",
      title: "Treasurer",
      role: "Financial Management",
      bio: "Elite Zonal Wicket-keeper Batsman from Karnataka, India. Chief Estimator and Cost Consultant for Heavy Civil Projects in Canada. A hard-hitting batsman passionate about growing cricket in Canada and ensuring the club's financial excellence.",
      image: "/qaiser-treasurer.jpeg",
      initials: "QQM"
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Meet Our <span className="gradient-text">Board</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Dedicated leaders committed to building London&apos;s premier cricket community
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Board Members Grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {boardMembers.map((member, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 hover:border-primary-500/50 border-2 border-white/10 transition-all duration-300 group w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
            >
              {/* Photo/Avatar */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  {member.image ? (
                    <>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary-500/30 group-hover:border-primary-500/50 transition-all">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))',
                            mixBlendMode: 'normal'
                          }}
                        />
                      </div>
                      {/* Decorative ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 blur-xl group-hover:blur-2xl transition-all"></div>
                    </>
                  ) : (
                    <>
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border-2 border-primary-500/30 group-hover:border-primary-500/50 transition-all">
                        <span className="text-4xl font-bold gradient-text">{member.initials}</span>
                      </div>
                      {/* Decorative ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 blur-xl group-hover:blur-2xl transition-all"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary-400 font-semibold text-sm mb-1">{member.title}</p>
                <p className="text-gray-500 text-xs mb-4">{member.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
              </div>

              {/* Decorative element */}
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-gray-400">
              Our board is dedicated to transparency, community engagement, and the growth of cricket in London, Ontario.
              As a registered non-profit corporation, we operate with integrity and accountability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
