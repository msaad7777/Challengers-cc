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
        If you are buying or selling property in London and the surrounding area, consider reaching out to
        Bhupinder. His expertise, local knowledge, and client-first approach make him a trusted choice.
        Supporting our sponsors means supporting the club.
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-03-15',
    image: null,
    video: '/videos/Bhupinder-Final-Insta.mp4',
    featured: true,
  },
  {
    slug: 'rabyit-gold-sponsor',
    title: 'Sponsor Spotlight: RabyIT — Gold Sponsor Powering Our Season',
    excerpt:
      'RabyIT joins Challengers Cricket Club as a Gold Sponsor, bringing expertise in Accounting, Payroll & Tax Services to our growing partnership family.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        We are thrilled to announce <strong class="text-white">RabyIT</strong> as a Gold Sponsor for the
        Challengers Cricket Club 2026 season. Specializing in <strong class="text-white">Accounting, Payroll
        & Tax Services</strong>, RabyIT is a business built on precision, reliability, and genuine care
        for its clients — values that align perfectly with our club's mission.
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
      <h3 class="text-2xl font-bold text-white mb-4">Need Accounting or Tax Help?</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Whether you are a small business owner, freelancer, or individual looking for reliable accounting,
        payroll, or tax services, RabyIT has you covered. Reach out to them and mention Challengers Cricket
        Club — supporting our sponsors keeps the club running strong.
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-03-20',
    image: null,
    video: '/videos/RabyIt-final-insta.mp4',
    featured: false,
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
