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
    slug: 'makzin-media-community-partner',
    title: 'Partner Spotlight: MakZiN Media, Building Digital Solutions for Our Community',
    excerpt:
      'MakZiN Media joins Challengers Cricket Club as a Community Partner. A London-based software development agency with 11+ years of experience building custom web apps, e-commerce, and cloud solutions.',
    content: `
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Partner Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official partner introduction video featuring MakZiN Media and Challengers Cricket Club.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club is excited to welcome <strong class="text-white">MakZiN Media Inc.</strong> as
        our newest Community Partner for the 2026 season. Based right here in London, Ontario, MakZiN Media is a
        professional software development agency with over 11 years of experience delivering custom digital solutions
        for businesses of all sizes.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">A London Success Story</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Founded with the belief that every business deserves access to quality software, MakZiN Media has delivered
        50+ projects for 30+ happy clients across Canada and beyond. From startups to established enterprises, their
        team builds custom web applications, mobile apps, and cloud infrastructure that scales with your business.
      </p>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "We built MakZiN Media because we kept seeing the same problem. Small and mid-sized businesses were getting
          stuck with bad software, or no software at all, simply because they weren't enterprise-sized. Good tech
          shouldn't depend on how big your company is."
        </p>
        <cite class="text-gray-400 mt-2 block">Misbahuddin Mohammed, President, MakZiN Media Inc.</cite>
      </blockquote>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Services MakZiN Media Offers</h3>
        <ul class="text-gray-300 text-lg leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li>Custom Web Development (React, Vue.js, Nuxt, TypeScript)</li>
          <li>Mobile App Development (iOS & Android)</li>
          <li>Cloud & DevOps (AWS, Docker, Kubernetes)</li>
          <li>E-commerce Platforms</li>
          <li>AI Integration & Intelligent Automation</li>
          <li>IT Consultation & Strategy</li>
          <li>Ongoing Maintenance & Support</li>
        </ul>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Why This Partnership Matters</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Cricket clubs and community organizations need strong digital presence to grow. Having a partner like
        MakZiN Media who understands technology and community gives Challengers CC a competitive edge. Whether
        it is building a better website, automating operations, or creating digital tools for the club,
        MakZiN Media has the expertise to make it happen.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Need a Website or App Built?</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        If you are a business owner, startup founder, or organization looking for a reliable tech partner in
        London, MakZiN Media delivers custom solutions that drive real results. Mention Challengers Cricket Club
        when you reach out!
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 24px 0;">
        <a href="https://makzin.media/" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Visit MakZiN Media
        </a>
        <a href="https://makzin.media/#contact" target="_blank" rel="noopener noreferrer"
          style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Get a Free Quote
        </a>
      </div>
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin: 24px 0;">
        <h4 class="text-lg font-bold text-white mb-3 text-center">MakZiN Media Inc. Contact Info</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; color: #9ca3af; font-size: 14px;">
          <span>151B York St, London, ON N6A 1A8</span>
          <span>+1 519-914-0980</span>
          <span>info@makzin.media</span>
        </div>
      </div>
      <p class="text-gray-400 text-sm italic">
        MakZiN Media is a Community Partner of Challengers Cricket Club. Supporting our partners means supporting the club.
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-04-09',
    image: null,
    video: '/videos/makzin-media-sponsor.mp4',
    featured: false,
    sponsorContact: {
      name: 'MakZiN Media',
      email: 'info@makzin.media',
      title: 'Community Partner',
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
    slug: 'madhu-reddy-player-profile',
    title: 'Player Profile: Madhu Reddy, Secretary & All-Rounder',
    excerpt:
      'Meet Madhu Reddy, a Senior Network Security Engineer with double masters, and a versatile all-rounder who has been playing cricket since his teens. A true asset to Challengers Cricket Club.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Every successful team is built on players who can adapt, deliver, and lead when it matters most. At
        Challengers Cricket Club, <strong class="text-white">Madhu Reddy</strong> stands out as a reliable
        all-rounder, bringing consistency, intelligence, and competitive edge to every game.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        With the bat, Madhu combines composure with calculated aggression, capable of anchoring innings or
        accelerating when required. With the ball, he delivers disciplined spells and breaks partnerships at
        crucial moments. In the field, his awareness, energy, and sharp execution set the standard for the team.
        Madhu has been playing cricket since his teens and brings years of experience to every match.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Off the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Beyond cricket, Madhu serves as the <strong class="text-white">Secretary</strong> of Challengers Cricket Club
        and is a <strong class="text-white">Senior Network Security Engineer</strong> in the IT industry. He holds
        <strong class="text-white">double master's degrees in Electronics and Communications</strong>, bringing the
        same analytical precision and discipline to his professional career and club administration that he brings
        to the cricket field. His passion for active sports and competitive mindset make him a natural fit for
        Challengers CC.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Club Role: Secretary, Challengers Cricket Club</li>
          <li>Playing Role: All-Rounder (Bat & Ball)</li>
          <li>Profession: Senior Network Security Engineer</li>
          <li>Education: Double Master's in Electronics & Communications</li>
          <li>Playing cricket since: Teenage years</li>
          <li>Hobbies: Active sports</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Cricket is where discipline meets passion. Every game is a chance to push yourself further
          and lift the team around you."
        </p>
        <cite class="text-gray-400 mt-2 block">Madhu Reddy, All-Rounder, Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">The Calm Under Pressure</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Known for his calm presence and team-first mentality, Madhu brings stability in high-pressure situations.
        His ability to stay composed and make smart decisions makes him a trusted figure within the squad. When
        the game is on the line, Madhu is the player you want out there.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Why Madhu Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        A player who can contribute with both bat and ball, stay calm under pressure, and set the standard in
        the field is invaluable. Madhu Reddy is exactly that player for Challengers Cricket Club. His experience,
        work ethic, and competitive spirit make him one of the key players to watch this 2026 season.
      </p>
      <p class="text-gray-400 text-sm italic">
        Part of our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-09',
    image: '/Madhu-Reddy.jpeg',
    video: null,
    featured: false,
  },
  {
    slug: 'fahad-aktar-player-profile',
    title: 'Player Profile: Fahad Aktar, AI Consultant & Constant Learner',
    excerpt:
      'Meet Fahad Aktar, an AI consultant, teacher, and mentor who applies the same philosophy of constant learning and improvement to his cricket as he does to his career.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Some players bring more than just skill to the team. <strong class="text-white">Fahad Aktar</strong>
        brings a mindset. As an AI consultant, teacher, and mentor by profession, Fahad believes in constant
        learning and improvement, and that philosophy shapes everything he does on the cricket field.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Fahad approaches cricket the way he approaches technology: study, adapt, and improve. Every session
        is an opportunity to refine technique, analyze what went wrong, and come back stronger. That growth
        mindset makes him the kind of player who gets better every time he steps onto the field. His
        willingness to learn from every delivery, every innings, and every match is what sets him apart.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Beyond Cricket</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        As an <strong class="text-white">AI consultant</strong>, Fahad works at the cutting edge of technology,
        helping businesses leverage artificial intelligence to solve real problems. He is also a
        <strong class="text-white">teacher and mentor</strong>, guiding others through their learning journeys.
        That combination of tech expertise and teaching instinct makes him a natural fit in a team environment
        where knowledge sharing and collective growth matter.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Profession: AI Consultant, Teacher & Mentor</li>
          <li>Philosophy: Constant learning and improvement</li>
          <li>Approach to cricket: Study, adapt, get better every game</li>
          <li>Strength: Growth mindset on and off the field</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "I believe in constant learning and improvement and that's what I have been trying to apply
          on my cricket as well!"
        </p>
        <cite class="text-gray-400 mt-2 block">Fahad Aktar, Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Why Fahad Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        A team full of talented players is good. A team full of players who are constantly trying to get
        better is unstoppable. Fahad brings that energy to Challengers Cricket Club. His professional
        background in AI and mentoring, combined with his hunger to improve as a cricketer, makes him a
        player who elevates everyone around him.
      </p>
      <p class="text-gray-400 text-sm italic">
        Part of our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-10',
    image: '/Fahad-Aktar.jpeg',
    video: null,
    featured: false,
  },
  {
    slug: 'dr-shoab-ahmad-player-profile',
    title: 'Player Profile: Dr. Shoab Ahmad, Physician & Cricket Purist',
    excerpt:
      'Meet Dr. Shoab Ahmad, a physician by profession but a cricket purist at heart. When he is not saving lives, he is out on the field doing what he loves most.',
    content: `

      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Not every cricketer walks onto the field after a shift at the hospital. <strong class="text-white">Dr. Shoab Ahmad</strong>
        does. A physician by profession and a cricket purist at heart, Shoab brings a unique blend of precision,
        calm under pressure, and relentless passion for the game to Challengers Cricket Club.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Shoab plays cricket the way it was meant to be played. No shortcuts, no gimmicks. His approach to the
        game is pure and technical, built on years of loving the sport. Whether batting, bowling, or fielding,
        he brings the same focus and composure that defines his medical career. In high-pressure situations,
        having a player with the steady hands of a doctor is exactly what a team needs.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Beyond Cricket</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        When Shoab is not on the cricket field or at the hospital, you will find him with his hands deep in a
        DIY project. He has a passion for working on electricals, electronics, mechanics, and cars. The same
        analytical mind that diagnoses patients and reads bowlers also loves taking things apart and putting
        them back together.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Profession: Physician</li>
          <li>Cricket Style: Purist, technically sound</li>
          <li>Hobbies: DIY electricals, electronics, mechanics, cars</li>
          <li>What drives him: Love for the game in its purest form</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Cricket is the one place where everything else fades away. No phones, no pagers, no emergencies.
          Just you, the ball, and the game. That is why I play."
        </p>
        <cite class="text-gray-400 mt-2 block">Dr. Shoab Ahmad, Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Why Dr. Shoab Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Every team needs players who love the game for what it is. Shoab is that player. His calm demeanour,
        professional discipline, and genuine passion for cricket make him a valued member of the Challengers
        squad. Plus, having a doctor on the team who can also fix your car is not a bad deal.
      </p>
      <p class="text-gray-400 text-sm italic">
        Part of our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-10',
    image: '/DrShoab-Ahmad.jpeg',
    video: null,
    featured: false,
  },
  {
    slug: 'saikrishna-goriparthi-player-profile',
    title: 'Player Profile: Saikrishna Goriparthi, Right-Hand Bat & Off-Break Bowler',
    excerpt:
      'Meet Saikrishna Goriparthi, a right-handed batsman and right-arm off-break bowler who captained his college team to a district championship. A competitor who thrives under pressure.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club welcomes <strong class="text-white">Saikrishna Goriparthi</strong>, a
        right-handed batsman and right-arm off-break bowler whose cricket journey is built on leadership,
        competition, and a deep love for the game.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Saikrishna is a versatile cricketer who contributes with both bat and ball. As a right-handed batsman,
        he brings solid technique and the ability to build innings or accelerate when needed. With his right-arm
        off-break bowling, he adds a tactical spin option that can break partnerships and control the run rate
        in crucial phases of the game.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">A Proven Leader</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Leadership runs in Saikrishna's cricket DNA. He captained his departmental Civil Engineering cricket
        team and represented his college cricket team, leading them to a <strong class="text-white">district
        championship victory</strong>. That experience of leading a team to a title brings a winning mentality
        and composure that every squad needs.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Batting: Right-handed batsman</li>
          <li>Bowling: Right-arm off-break</li>
          <li>Leadership: Captained departmental Civil Engineering team</li>
          <li>Achievement: District championship winner with college team</li>
          <li>Background: Civil Engineering</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "I enjoy cricket because it brings out my competitive spirit and teaches me teamwork, discipline,
          and the ability to perform under pressure."
        </p>
        <cite class="text-gray-400 mt-2 block">Saikrishna Goriparthi, Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Why Saikrishna Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        A district championship-winning cricketer who can bat, bowl off-spin, and captain a side is exactly
        the kind of player who elevates a team. Saikrishna brings proven leadership, a competitive edge, and
        the experience of performing when it matters most. Watch out for him this 2026 season.
      </p>
      <p class="text-gray-400 text-sm italic">
        Part of our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-10',
    image: '/Sai-Goriparthi.jpeg',
    video: null,
    featured: false,
  },
  {
    slug: 'judin-thomas-player-profile',
    title: 'Player Profile: Judin Thomas, Bowling All-Rounder',
    excerpt:
      'Meet Judin Thomas, a bowling all-rounder with a background in finance and marketing. A cricket enthusiast who brings discipline from the banking world to the cricket field.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club welcomes <strong class="text-white">Judin Thomas</strong>, a bowling all-rounder
        who combines sharp cricketing instincts with a professional mindset shaped by years in the banking industry.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Judin is a bowling all-rounder who leads the attack with the ball. His ability to swing the ball early,
        maintain tight lines, and pick up wickets at key moments makes him a vital part of the Challengers bowling
        unit. With the bat, he adds valuable runs lower down the order, often turning tight games in the team's
        favour with crucial cameos.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Beyond Cricket</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        A former bank employee with experience in finance and marketing, Judin brings discipline, analytical
        thinking, and a results-driven mindset to everything he does. He is also a passionate stock market
        investor who enjoys studying markets and building financial knowledge off the field.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Playing Role: Bowling All-Rounder</li>
          <li>Background: Former bank employee, finance & marketing</li>
          <li>Interests: Stock market investing, active sports</li>
          <li>Cricket enthusiast with years of playing experience</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Cricket and investing have a lot in common. Both require patience, timing, and the courage
          to take your shot when the opportunity is right."
        </p>
        <cite class="text-gray-400 mt-2 block">Judin Thomas, Bowling All-Rounder, Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Why Judin Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Every team needs a player who can break partnerships with the ball and chip in with the bat when it counts.
        Judin Thomas is that player. His professional discipline, competitive fire, and love for cricket make him a
        valuable addition to the Challengers Cricket Club squad for the 2026 season.
      </p>
      <p class="text-gray-400 text-sm italic">
        Part of our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-09',
    image: '/Judin-Thomas.jpeg',
    video: null,
    featured: false,
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
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Club Role: Director, Challengers Cricket Club</li>
          <li>Playing Role: Batting All-Rounder</li>
          <li>Playing cricket since his teens</li>
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
    title: '2026 Season Kickoff: Registration Closed, Season Is ON!',
    excerpt:
      'The Challengers Cricket Club 2026 season is officially underway! Registration is now closed. Missed out? We would love to have you in 2027.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The wait is over. Challengers Cricket Club is officially kicking off the
        <strong class="text-white">2026 season</strong>, and we could not be more excited about what lies
        ahead. After months of planning, sponsorship outreach, and community building, the club is stronger
        and more prepared than ever.
      </p>
      <div style="background: linear-gradient(135deg, rgba(234,179,8,0.15), rgba(16,185,129,0.15)); border: 2px solid rgba(234,179,8,0.4); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 class="text-2xl font-bold text-white mb-2">2026 Registration is Officially CLOSED!</h3>
        <p class="text-gray-300 text-lg mb-4">
          Our squad is locked in and ready to compete. Thank you to every player who registered for the 2026 season.
          It is going to be one for the books!
        </p>
        <p class="text-gray-400">
          Missed out? Don't worry! Drop us a message at
          <a href="mailto:contact@challengerscc.ca" class="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>
          and we will put you on the priority list for the <strong class="text-white">2027 season</strong>.
          We would love to have you on the team next year!
        </p>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Growing Our Sponsor Family</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        This season, we are proud to have an incredible lineup of sponsors backing the club. From our
        Platinum Sponsor Bhupinder Singh to Gold Sponsors like Freddy George, Ashvak Sheik, and RabyIT, plus community
        partners Kover Drive, MakZiN Media, and TPG Cricket Academy. Every sponsor plays a vital role in making this
        season possible.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">What Is New This Year</h3>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li>Expanded practice schedule with professional coaching from TPG Cricket Academy</li>
        <li>Indoor training at Kover Drive Sports, London's premier cricket facility</li>
        <li>Competing in LCL, LPL, UFCL and leagues across Ontario</li>
        <li>New payment options including Zeffy (0% processing fees) alongside Stripe</li>
        <li>Google Ad Grants powering our outreach to new players and sponsors</li>
        <li>A dedicated blog to keep the community informed and celebrate our sponsors and players</li>
        <li>Sponsor introduction videos for every partner</li>
      </ul>
      <h3 class="text-2xl font-bold text-white mb-4">Want to Join in 2027?</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        If you missed registration this year, don't sweat it! We are already planning for an even bigger 2027 season.
        Send us an email at <a href="mailto:contact@challengerscc.ca" class="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>
        with your name and contact info, and we will reach out as soon as 2027 registration opens. Spots will fill up fast!
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Stay Connected</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Follow us on <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">Instagram @challengers.cc</a>
        for match updates, behind-the-scenes content, and community highlights. You can also reach us at
        <a href="mailto:contact@challengerscc.ca" class="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Let's go Challengers! This is going to be a season to remember. Game on!
      </p>
    `,
    category: 'Club News',
    author: 'Challengers CC',
    date: '2026-04-09',
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
