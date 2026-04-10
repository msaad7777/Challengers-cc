export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Sponsor Spotlight' | 'Player Profile' | 'Club News';
  author: string;
  date: string;
  image: string | null;
  video: string | null;
  featured: boolean;
  sponsorContact?: {
    name: string;
    email: string;
    title: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'bhupinder-singh-platinum-sponsor',
    title: 'Sponsor Spotlight: Bhupinder Singh — Our Platinum Partner',
    excerpt:
      'Meet Bhupinder Singh, a trusted Realtor at Century 21 First Canadian Corp and the Platinum Sponsor of Challengers Cricket Club for the 2026 season.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club is proud to welcome <strong class="text-white">Bhupinder Singh</strong> as our
        Platinum Sponsor for the 2026 season. As an experienced Realtor at
        <strong class="text-white">Century 21 First Canadian Corp</strong>, Bhupinder brings the same dedication
        and professionalism to the community that he brings to every client relationship.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">A Shared Commitment to Community</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        When we first reached out to Bhupinder about sponsorship, his response was immediate. He understood
        the value of supporting a grassroots cricket club that serves the diverse communities of London, Ontario.
        For Bhupinder, this partnership is about more than branding — it is about investing in the people
        and families who make our city vibrant.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">What Platinum Sponsorship Means</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        As our Platinum Sponsor, Bhupinder's name and Century 21 branding are featured prominently on player
        jerseys, social media posts, event banners, and right here on our website. His support helps fund
        practice sessions, league fees, equipment, and youth development programs.
      </p>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Cricket is more than a sport — it brings families together and builds bridges across cultures.
          I am honoured to support Challengers Cricket Club and the positive impact they are making in London."
        </p>
        <cite class="text-gray-400 mt-2 block">— Bhupinder Singh, Century 21 First Canadian Corp</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Sponsor Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official sponsor introduction video featuring Bhupinder Singh and Challengers Cricket Club.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Looking for a Realtor in London?</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Whether you are buying your first home, upgrading to a bigger space, selling a property, or looking for
        investment opportunities in London and the surrounding area — Bhupinder Singh is your go-to realtor.
        With deep local knowledge, a client-first approach, and years of experience in the Ontario real estate
        market, Bhupinder makes the process smooth and stress-free.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Services Bhupinder Offers</h3>
        <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
          <li>Residential buying and selling</li>
          <li>First-time home buyer guidance</li>
          <li>Investment property consultation</li>
          <li>Pre-construction and new builds</li>
          <li>Market analysis and property valuation</li>
          <li>Relocation assistance for newcomers to Canada</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://getrealwithinder.com/" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none;">
          Visit Bhupinder's Website
        </a>
      </div>
      <p class="text-gray-400 text-sm italic">
        Bhupinder Singh is a Platinum Sponsor of Challengers Cricket Club. Supporting our sponsors means supporting the club.
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-03-15',
    image: null,
    video: '/videos/Bhupinder-Final-Insta.mp4',
    featured: true,
    sponsorContact: {
      name: 'Bhupinder Singh',
      email: 'bhupinder@century21.ca',
      title: 'Platinum Sponsor',
    },
  },
  {
    slug: 'rabyit-gold-sponsor',
    title: 'Sponsor Spotlight: RabyIT — Gold Sponsor Powering Our Season',
    excerpt:
      'RabyIT joins Challengers Cricket Club as a Gold Sponsor, bringing expertise in Accounting, Payroll & Tax Services to our growing partnership family.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        We are thrilled to announce <strong class="text-white">RabyIT</strong> as a Gold Sponsor for the
        Challengers Cricket Club 2026 season. With over <strong class="text-white">350 agents across four
        global locations</strong>, RabyIT is a leading business process outsourcing company built on
        reliability, innovation, and genuine care for its clients — values that align perfectly with our club's mission.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Why RabyIT Chose Challengers</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        RabyIT's team understands the importance of community investment. By partnering with a registered
        Ontario non-profit corporation, they are supporting youth development, diversity in sport, and
        healthy recreation for families in London. Their sponsorship directly funds equipment, venue
        bookings, and player development programs.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Gold Sponsor Benefits</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        As a Gold Sponsor, RabyIT receives prominent logo placement on player jerseys, recognition across
        all club social media channels, branding at matches and events, and a dedicated feature right here
        on our website. Their commitment helps us build a sustainable future for cricket in our region.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Sponsor Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official sponsor introduction video featuring RabyIT and Challengers Cricket Club.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Looking to Scale Your Business?</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        RabyIT is a leading business process outsourcing company with over 350 agents across four global locations
        serving 25+ satisfied clients. Whether you need call center solutions, technical support, or software
        development — RabyIT delivers fast, reliable, and cost-effective results.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Services RabyIT Offers</h3>
        <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
          <li>Call Center Solutions</li>
          <li>Customer Success Management</li>
          <li>Technical Support</li>
          <li>Content Moderation</li>
          <li>Data Processing</li>
          <li>Software Development (ST-CRM)</li>
          <li>Professional Services</li>
        </ul>
        <p class="text-gray-400 text-sm">Headquartered in London, ON with partner offices in Dhaka, New York, and Dominican Republic.</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://rabyit.com/" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none;">
          Visit RabyIT Website
        </a>
      </div>
      <p class="text-gray-400 text-sm italic">
        RabyIT is a Gold Sponsor of Challengers Cricket Club. Supporting our sponsors means supporting the club.
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-03-20',
    image: null,
    video: '/videos/RabyIt-final-insta.mp4',
    featured: false,
    sponsorContact: {
      name: 'RabyIT',
      email: 'info@rabyit.com',
      title: 'Gold Sponsor',
    },
  },
  {
    slug: 'freddy-george-gold-sponsor',
    title: 'Sponsor Spotlight: Freddy George, Gold Sponsor & Financial Advisor',
    excerpt:
      'Meet Freddy George, a Licensed Financial Advisor and Gold Sponsor of Challengers Cricket Club. He is not just supporting the team on the field but helping members build strong financial habits off the field too.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club is proud to welcome <strong class="text-white">Freddy George</strong> as our
        Gold Sponsor for the 2026 season. Freddy is a Licensed Financial Advisor who brings the same
        commitment and care to our cricket community that he brings to every client he serves.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">More Than a Sponsor</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        What makes Freddy unique as a sponsor is that he does not just support the team financially. He
        genuinely wants to help every member of Challengers CC build strong financial habits and achieve
        their personal goals. He has offered to conduct free financial literacy sessions for our team
        members and their families.
      </p>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "As a sponsor, I don't just want to support the team on the field, but also off the field by
          helping everyone here build strong financial habits and achieve their personal goals."
        </p>
        <cite class="text-gray-400 mt-2 block">Freddy George, Licensed Financial Advisor</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Sponsor Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official sponsor introduction video featuring Freddy George and Challengers Cricket Club.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">How Freddy Can Help You</h3>
        <ul class="text-gray-300 text-lg leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li>Saving for the future and retirement planning</li>
          <li>Managing investments and growing your wealth</li>
          <li>Protecting what matters most with insurance</li>
          <li>Personalized financial planning for individuals and families</li>
          <li>Free financial literacy sessions for Challengers CC members</li>
        </ul>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Book a Free Session with Freddy</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Freddy is offering a free financial literacy session to all Challengers Cricket Club members and
        their families. Fill out his form and he will personally reach out to schedule a session with you.
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 24px 0;">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSddFlpgvxVSdJHShOUCfDmWA5G3PoFMJ9-mvjFdyHUnLHl6cQ/viewform" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Book Free Financial Session
        </a>
      </div>
      <p class="text-gray-400 text-sm italic">
        Freddy George is a Gold Sponsor of Challengers Cricket Club. Supporting our sponsors means supporting the club.
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-04-04',
    image: null,
    video: '/videos/freddy-george-sponsor.mp4',
    featured: true,
    sponsorContact: {
      name: 'Freddy George',
      email: 'freddy.george@example.com',
      title: 'Gold Sponsor',
    },
  },
  {
    slug: 'kover-drive-community-partner',
    title: 'Sponsor Spotlight: Kover Drive — Our Home for Indoor Practice',
    excerpt:
      'Kover Drive Sports is London\'s premier indoor cricket facility and Challengers Cricket Club\'s official Community Partner. Book a lane and train with us.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Every great cricket team needs a great training ground. For Challengers Cricket Club, that home is
        <strong class="text-white">Kover Drive Sports</strong> — London's premier indoor cricket and multi-sport
        facility, and our official Community Partner for the 2026 season.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">London's Best Indoor Cricket Facility</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Located at <strong class="text-white">Oxbury Mall, 1299 Oxford St E, London, ON</strong>, Kover Drive
        offers a state-of-the-art indoor setup with multiple cricket lanes, pro-grade nets, advanced pitching
        machines, and a dedicated training zone. Whether you are working on your batting, bowling, or fielding,
        Kover Drive provides the perfect environment to sharpen your skills year-round.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Why We Chose Kover Drive</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        When we were looking for a practice facility for Challengers CC, Kover Drive stood out immediately.
        The quality of the lanes, the welcoming atmosphere, and the passion of the team running it made it
        an easy decision. Our players train here regularly, and the facility has become a second home for the club.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">What Kover Drive Offers</h3>
        <ul class="text-gray-300 text-lg leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li>Multiple cricket lanes with pro-grade nets</li>
          <li>Advanced bowling/pitching machines</li>
          <li>Dedicated training zone</li>
          <li>Online booking system — reserve your lane in seconds</li>
          <li>Open daily 8 AM to 10 PM</li>
          <li>Free parking at Oxbury Mall</li>
          <li>Flexible memberships for individuals and teams</li>
          <li>Safe, secure, and welcoming environment</li>
        </ul>
        <p class="text-gray-400 text-sm">Contact Kover Drive for current rates and availability.</p>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Partner Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official partner introduction video featuring Kover Drive and Challengers Cricket Club.
      </p>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Kover Drive is more than a facility — it is where our team comes together to train, compete,
          and build the bonds that make us stronger on match day."
        </p>
        <cite class="text-gray-400 mt-2 block">— Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Book Your Session</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Whether you are a Challengers CC member or just a cricket enthusiast looking for a quality indoor
        facility in London — Kover Drive is the place. Book your lane online and experience London's best
        indoor cricket setup.
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 24px 0;">
        <a href="https://koverdrivesports.ca/booking" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Book a Lane Now
        </a>
        <a href="https://koverdrivesports.ca/" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Visit Website
        </a>
      </div>
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin: 24px 0;">
        <h4 class="text-lg font-bold text-white mb-3 text-center">Kover Drive Sports — Contact Info</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; color: #9ca3af; font-size: 14px;">
          <span>1299 Oxford St E, London, ON</span>
          <span>+1 (519) 702-2683</span>
          <span>koverdrivelondonon@gmail.com</span>
        </div>
      </div>
      <p class="text-gray-400 text-sm italic">
        Kover Drive Sports is a Community Partner of Challengers Cricket Club. Mention Challengers CC when you book!
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-04-09',
    image: null,
    video: '/videos/koverdrive-blog.mp4',
    featured: true,
    sponsorContact: {
      name: 'Kover Drive Sports',
      email: 'koverdrivelondonon@gmail.com',
      title: 'Community Partner',
    },
  },
  {
    slug: 'tarek-islam-player-profile',
    title: 'Player Profile: Tarek Islam, Director & All-Rounder',
    excerpt:
      'Meet Tarek Islam, one of the founding directors of Challengers Cricket Club and a fine all-rounder who brings leadership both on and off the field.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Every cricket team needs players who can do it all: bat, bowl, field, and lead. At Challengers Cricket Club,
        <strong class="text-white">Tarek Islam</strong> is exactly that player. A genuine all-rounder and one of the
        founding directors of the club, Tarek is an asset to any team he plays for.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Tarek is a batting all-rounder with a competitive spirit that lifts the entire team. Whether he is anchoring
        an innings with the bat, picking up crucial wickets, or taking sharp catches in the field, he delivers when
        it matters most. His strategic judgment and calm under pressure make him a go-to player in high-stakes matches
        across the LCL, LPL, and UFCL leagues.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Off the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Beyond cricket, Tarek serves as a <strong class="text-white">Director</strong> on the Challengers Cricket Club
        board. His background as a Banking Advisor brings financial discipline and strategic thinking to club operations.
        He is also the co-founder of the <strong class="text-white">Bangladesh Association of London, Ontario</strong> and
        the <strong class="text-white">Nucleus71 political think tank</strong>, a testament to his commitment to
        community building and purposeful leadership.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Leadership Credentials</h3>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Director, Challengers Cricket Club</li>
          <li>Co-founder, Bangladesh Association of London, Ontario</li>
          <li>Co-founder, Nucleus71 Political Think Tank</li>
          <li>Former Vice President, Kabi Nazrul College Debating Society</li>
          <li>National Debating Competition Representative</li>
          <li>University of Dhaka Graduate</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Cricket teaches you discipline, teamwork, and how to handle pressure. The same skills you need
          to build a community. Challengers Cricket Club is where both come together."
        </p>
        <cite class="text-gray-400 mt-2 block">Tarek Islam, Director & All-Rounder</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Why He Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Having someone like Tarek on your team, a player who can win matches with bat and ball, and simultaneously
        help govern the club with professionalism, is rare. His dual role as director and all-rounder makes him one of
        the most valuable members of Challengers Cricket Club. Whether we are chasing a target on the field or building
        partnerships off it, Tarek is always in the game.
      </p>
      <p class="text-gray-400 text-sm italic">
        This is the first in our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-09',
    image: '/Tarek-Islam.jpeg',
    video: null,
    featured: true,
  },
  {
    slug: '2026-season-kickoff',
    title: '2026 Season Kickoff: What to Expect This Year',
    excerpt:
      'The Challengers Cricket Club 2026 season is here. From new sponsors to expanded programs, here is everything you need to know about the year ahead.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The wait is over. Challengers Cricket Club is officially kicking off the
        <strong class="text-white">2026 season</strong>, and we could not be more excited about what lies
        ahead. After months of planning, sponsorship outreach, and community building, the club is stronger
        and more prepared than ever.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Growing Our Sponsor Family</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        This season, we are proud to have an incredible lineup of sponsors backing the club. From our
        Platinum Sponsor Bhupinder Singh to Gold Sponsors like Freddy, Ashvak, and RabyIT, plus community
        partners Kover Drive and TPG Cricket Academy — every sponsor plays a vital role in making this
        season possible.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Registration Is Open</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Registration for the 2026 season is now open. Whether you are a seasoned cricketer or picking up
        a bat for the first time, Challengers CC welcomes players of all skill levels. Our programs include
        weekly practice sessions, league matches, youth development clinics, and social events.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">What Is New This Year</h3>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li>Expanded practice schedule with professional coaching from TPG Cricket Academy</li>
        <li>New payment options including Zeffy (0% processing fees) alongside Stripe</li>
        <li>Google Ad Grants powering our outreach to new players and sponsors</li>
        <li>A dedicated blog (you are reading it!) to keep the community informed</li>
        <li>Youth-focused programs to introduce cricket to the next generation</li>
      </ul>
      <h3 class="text-2xl font-bold text-white mb-4">Stay Connected</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Follow us on <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">Instagram @challengers.cc</a>
        for match updates, behind-the-scenes content, and community highlights. You can also reach us at
        <a href="mailto:contact@challengerscc.ca" class="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        This is going to be a season to remember. Welcome to Challengers Cricket Club — let us build
        something great together.
      </p>
    `,
    category: 'Club News',
    author: 'Challengers CC',
    date: '2026-04-01',
    image: null,
    video: null,
    featured: true,
  },
];

export const categories = ['All', 'Sponsor Spotlight', 'Player Profile', 'Club News'] as const;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return blogPosts.slice(0, limit);

  const sameCat = blogPosts.filter(
    (p) => p.slug !== currentSlug && p.category === current.category
  );
  const others = blogPosts.filter(
    (p) => p.slug !== currentSlug && p.category !== current.category
  );

  return [...sameCat, ...others].slice(0, limit);
}
