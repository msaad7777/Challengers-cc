export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Sponsor Spotlight' | 'Player Profile' | 'Club News' | 'Match Reports';
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
    slug: 'practice-match-2-2026-vs-chahtham-cc',
    title: 'Practice Match #2 — Challengers Beat Chahtham CC by 13 Runs at Thamesville',
    excerpt:
      'Challengers Cricket Club won their second 2026 practice match by 13 runs at Thamesville Cricket Ground — Rajath Shetty 45 off 24, Ankush Arora 3/23, and a tight death-overs squeeze that defended 177 against a fast Chahtham chase.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Second practice match of 2026 is in the books — and it&apos;s another win for the
        Challengers. We travelled to <strong class="text-white">Thamesville Cricket Ground</strong>
        on Sunday to face <strong class="text-white">Chahtham Cricket Club</strong> in a
        20-over fixture and came home with a <strong class="text-white">13-run victory</strong>,
        defending a first-innings 177/6.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Match Summary</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-3">
        <strong class="text-white">Toss:</strong> Challengers won the toss and elected to bat.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers posted <strong class="text-white">177/6 in 20 overs</strong>, with Rajath
        Shetty setting the tempo at the top, Qaiser Mahmood anchoring through the middle, and
        a string of useful cameos through the lower order. Chahtham came out fast in reply but
        couldn&apos;t sustain it — Challengers&apos; bowling unit kept chipping wickets in the
        powerplay and the middle overs to close out the chase at
        <strong class="text-white">164/6 in 20</strong>. Final margin: 13 runs.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Top Performers</h3>
      <div class="grid sm:grid-cols-2 gap-4 mb-6">
        <div class="glass rounded-xl p-5 border border-primary-500/20">
          <p class="text-sm font-bold text-primary-400 uppercase tracking-wider mb-3">
            🟢 Challengers CC
          </p>
          <ul class="text-gray-300 space-y-1.5 text-sm">
            <li><strong class="text-white">Batting</strong></li>
            <li>Rajath Shetty — 45 (24), 5×4, 1×6, SR 187.5</li>
            <li>Qaiser Mahmood — 29* (33)</li>
            <li>Siva — 26 (16), 2×4, 1×6, SR 162.5</li>
            <li>Shoeb Ahmad — 13* (8), 2×4, SR 162.5</li>
            <li class="pt-2"><strong class="text-white">Bowling</strong></li>
            <li>Ankush Arora — 3/23 in 3 overs (match-winning spell)</li>
            <li>Sujel — 1/8 in 2 overs (8 dots)</li>
            <li>Siva — 1/14 in 2 overs</li>
            <li>Gokul Prakash — 1/22 in 3 overs</li>
            <li class="pt-2"><strong class="text-white">Fielding</strong></li>
            <li>Shoeb Ahmad — 2 catches</li>
          </ul>
        </div>
        <div class="glass rounded-xl p-5 border border-blue-500/20">
          <p class="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
            🔵 Chahtham CC
          </p>
          <ul class="text-gray-300 space-y-1.5 text-sm">
            <li><strong class="text-white">Batting</strong></li>
            <li>Anwar — 44 (34), 2×4, 2×6</li>
            <li>Abhishek V — 27* (13), 3×6, SR 207.7</li>
            <li>Amroz — 22 (10), 3×6, SR 220.0</li>
            <li>Amar — 22 (20), 2×4, 1×6</li>
            <li>Harshil — 22 (15), 2×6, SR 146.7</li>
            <li class="pt-2"><strong class="text-white">Bowling</strong></li>
            <li>Aleem — 3/18 in 2 overs</li>
            <li>Sujel — 1/11 in 2 overs</li>
            <li>Harshil — 1/42 in 4 overs</li>
            <li>Vijay — 1/5 in 1 over</li>
          </ul>
        </div>
      </div>

      <h3 class="text-2xl font-bold text-white mb-4">How the Match Played Out</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-4">
        <strong class="text-white">First innings.</strong> Rajath Shetty came out swinging at
        the top and put on the foundation Challengers needed — five fours and a six in a
        24-ball 45 that gave the innings shape. Mohammed Saad (10 off 12) walked off to a
        Sujel delivery before Qaiser Mahmood took over the role of anchor, finishing
        unbeaten on 29 from 33. Siva chipped in with a quick 26 (16), and a tail of Shoeb
        Ahmad (13*), Farooq Choudhary (7*), Gokul Prakash (7), and Judin Thomas (6*) made
        sure the scoreboard kept ticking. 27 extras — 20 wides, 7 no-balls — pushed the
        total to <strong class="text-white">177/6</strong>.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        <strong class="text-white">Second innings.</strong> Anwar opened with intent for
        Chahtham — 44 off 34 with a couple of sixes — until <strong class="text-white">Ankush
        Arora</strong> ran through the middle order with 3/23 in 3 overs, removing Anwar,
        Aleem, and Harshil to swing the match decisively. Sujel set the tone in the
        powerplay with a tight 1/8 from 2 overs (eight dots), Siva grabbed Amar courtesy
        a sharp Shoeb Ahmad catch, and Gokul Prakash dismissed the dangerous Amroz with
        Mohammed Saad taking the catch. Abhishek V&apos;s late blitz (27* off 13) brought
        Chahtham close, but the chase fell <strong class="text-white">13 short</strong>
        at 164/6.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Watch the Full Match</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The full recording is up on the Challengers YouTube channel. Players, families, and
        anyone planning to face either side later in the season — feel free to dive in.
      </p>
      <div class="aspect-video rounded-xl overflow-hidden bg-black mb-6">
        <iframe
          src="https://www.youtube.com/embed/diIv64fmSqk"
          title="Challengers CC vs Chahtham CC — Practice Match #2 at Thamesville"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      </div>

      <h3 class="text-2xl font-bold text-white mb-4">Members — Reflect While It&apos;s Fresh</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Registered Challengers CC members can sign in to <strong class="text-white">C3H</strong>
        and add a personal reflection card for this match. Whether you faced Aleem&apos;s
        line, fielded one of Ankush&apos;s overs, or sat in the dugout — write it down before
        the next practice and the system will surface patterns and recommend Batting / Bowling
        Principles to focus on next session.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        👉 <a href="/c3h/replays" class="text-primary-400 hover:text-primary-300 underline font-semibold">Watch the match on C3H Match Replays</a>
        and click <em>Reflect on this match</em> to open your reflection journal.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Looking Ahead</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Two practice wins, two match recordings, and a settled-looking squad heading into
        league play. <strong class="text-white">LCL T30 opens May 10 vs London Predators</strong>
        at Northridge Cricket Ground; <strong class="text-white">LPL T30 the same day vs Maple
        Tigers</strong> at Silverwoods. Weekly Wednesday training resumes
        <strong class="text-white">May 13</strong>, 7:00 PM at Silverwoods.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Thank You</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Thank you to <strong class="text-white">Chahtham Cricket Club</strong> for the
        fixture and to everyone who made the trip to Thamesville — players, drivers, and
        families. Two practice matches in, and the standard for the season is set.
      </p>

      <p class="text-gray-400 text-sm italic">
        Challengers Cricket Club — London, Ontario&apos;s inclusive community cricket club.
        Registered Ontario Not-For-Profit Corporation #1746974-8. Follow us on
        <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">@challengers.cc</a>
        and subscribe on
        <a href="https://www.youtube.com/@Challengersccldn" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">YouTube</a>
        for match livestreams and highlights all season.
      </p>
    `,
    category: 'Match Reports',
    author: 'Challengers CC',
    date: '2026-05-04',
    image: '/ccc-logo.png',
    video: null,
    featured: true,
  },
  {
    slug: 'mohammed-saad-london-sports-volunteer-recognition-award-2026',
    title: 'Mohammed Saad Honoured with 2026 London Sports Volunteer Recognition Award',
    excerpt:
      'Challengers Cricket Club Director Mohammed Saad has been named a recipient of the 2026 London Sports Volunteer Recognition Award by the City of London and London Sports Council, with the reception scheduled for May 5 at The Grove.',
    content: `
      <p class="text-lg text-gray-300 leading-relaxed mb-6">
        We&apos;re proud to share that <strong class="text-white">Mohammed Saad</strong> — co-founder, Director, and Vice-Captain of Challengers Cricket Club — has been named a recipient of the <strong class="text-primary-400">2026 London Sports Volunteer Recognition Award</strong>, presented by the City of London and London Sports Council.
      </p>

      <h2 class="text-2xl font-bold text-white mt-8 mb-3">A reception in their honour</h2>
      <p class="text-gray-300 leading-relaxed mb-6">
        Saad joins 24 recipients from across London&apos;s sporting community — basketball, hockey, soccer, baseball, ringette, water polo, ultimate, and more — at a special reception on <strong class="text-white">Tuesday, May 5, 2026</strong>, from 5–8pm at <strong class="text-white">The Grove, Western Fair District</strong>.
      </p>

      <h2 class="text-2xl font-bold text-white mt-8 mb-3">On the field — a wicket-keeper who plays for the team</h2>
      <p class="text-gray-300 leading-relaxed mb-6">
        Saad is a <strong class="text-white">Wicket-Keeper Batsman</strong> and <strong class="text-white">Vice-Captain of the LPL T30 squad</strong>. Behind the stumps for every match, his focus has never been personal milestones — it&apos;s the rhythm and tempo of the whole team. The kind of cricketer who notices when a younger player is struggling at the crease and walks down the pitch to settle them, rather than waiting for the over to end.
      </p>
      <p class="text-gray-300 leading-relaxed mb-6">
        It&apos;s the same instinct that runs through everything he does at the club — whether it&apos;s recruiting newcomers, building the C3H portal, calling sponsors, or making sure the kit bag is at the ground on match day.
      </p>

      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 leading-relaxed list-disc list-inside space-y-2">
          <li>Club Role: Director &amp; Co-founder, Challengers Cricket Club</li>
          <li>Playing Role: Wicket-Keeper Batsman</li>
          <li>Captaincy: Vice-Captain — LPL T30 squad</li>
          <li>Profession: Information Technology</li>
          <li>2026 Honour: London Sports Volunteer Recognition Award (City of London)</li>
        </ul>
      </div>

      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          &ldquo;I&apos;m not here to chase personal numbers. I&apos;m here to see every player on this team succeed — that&apos;s what cricket is, and that&apos;s what Challengers is.&rdquo;
        </p>
        <cite class="text-gray-400 mt-2 block">Mohammed Saad — Wicket-Keeper Batsman &amp; Director, Challengers Cricket Club</cite>
      </blockquote>

      <h2 class="text-2xl font-bold text-white mt-8 mb-3">What this means for Challengers</h2>
      <p class="text-gray-300 leading-relaxed mb-4">
        Since incorporating as an Ontario Not-for-Profit Corporation in November 2025, Challengers has built — almost entirely on volunteer time — the infrastructure of a serious community club:
      </p>
      <ul class="space-y-2 text-gray-300 mb-6 ml-4">
        <li>✅ Two competitive league entries (LCL T30 + LPL T30) for the 2026 season</li>
        <li>✅ Active coaching partnership with TPG Cricket Academy</li>
        <li>✅ Approved status with Google for Nonprofits, Google Ad Grants, YouTube Nonprofit Program, TechSoup, and Goodstack</li>
        <li>✅ Six confirmed sponsor partners across Platinum, Gold, and Community tiers</li>
        <li>✅ The C3H players&apos; portal — squad selection, field editor, training reflections, match replays</li>
        <li>✅ Community partnerships with Curry Culture Bistro and Kover Drive</li>
      </ul>
      <p class="text-gray-300 leading-relaxed mb-6">
        Saad has been the engine behind much of this infrastructure. The award is recognition of the hours behind the scenes that volunteer-led grassroots sport always quietly demands.
      </p>

      <h2 class="text-2xl font-bold text-white mt-8 mb-3">A shared award</h2>
      <p class="text-gray-300 leading-relaxed mb-6">
        This recognition belongs to the wider Challengers community — every player who showed up to training in cold London mornings, every sponsor who took the call, every newcomer who found a place in our changing rooms. Saad will accept it on behalf of all of us.
      </p>
      <p class="text-gray-300 leading-relaxed mb-6">
        Thank you to the <strong class="text-white">City of London</strong>, the <strong class="text-white">London Sports Council</strong>, and Executive Director <strong class="text-white">Dave DeKelver</strong> for seeing grassroots newcomer cricket and choosing to recognize it.
      </p>

      <p class="text-gray-400 italic text-sm mt-8">
        Photos and a follow-up post will be published after the May 5 ceremony. Stay tuned to <a href="https://challengerscc.ca/blog" class="text-primary-400 hover:text-primary-300 underline">challengerscc.ca/blog</a>.
      </p>
    `,
    category: 'Club News',
    author: 'Challengers Cricket Club',
    date: '2026-04-29',
    image: '/saad-pic.jpeg',
    video: null,
    featured: true,
  },
  {
    slug: 'first-practice-match-2026-vs-sarnia',
    title: 'Season Opener — First Practice Match vs Sarnia Cricket Club',
    excerpt:
      'Challengers CC opened the 2026 season with a high-scoring practice match in Sarnia. Strong batting from both sides, a successful chase, and the first reflection cards filled in The Nets.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        And we&apos;re off. The 2026 season for Challengers Cricket Club opened with a practice
        fixture against <strong class="text-white">Sarnia Cricket Club</strong> — a match that
        gave the squad an early read on conditions, fitness, and how the new structure of the
        team is shaping up before league play begins on May 10.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Match Summary</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-3">
        <strong class="text-white">Toss:</strong> SCC won the toss and elected to bat.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Sarnia put together a strong total of <strong class="text-white">208 all out in 30 overs</strong>,
        with four batters past 28 runs. Challengers responded with a focused chase, reaching the
        target in <strong class="text-white">29.1 overs</strong>. With both sides keen to use the full
        practice window, the innings continued for the remainder of the 30 overs — Challengers
        finishing on <strong class="text-white">215/7</strong>.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Top Performers</h3>
      <div class="grid sm:grid-cols-2 gap-4 mb-6">
        <div class="glass rounded-xl p-5 border border-primary-500/20">
          <p class="text-sm font-bold text-primary-400 uppercase tracking-wider mb-3">
            🟢 Challengers CC
          </p>
          <ul class="text-gray-300 space-y-1.5 text-sm">
            <li>Shiva — 33 runs</li>
            <li>Madhu — 27 runs</li>
            <li>Shivam — 23 runs</li>
            <li>Shoaib — 23 runs</li>
            <li>Ankush — 22 runs</li>
            <li>Manohar — 21 runs</li>
            <li>Qaiser — 21 runs</li>
          </ul>
        </div>
        <div class="glass rounded-xl p-5 border border-blue-500/20">
          <p class="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
            🔵 Sarnia Cricket Club
          </p>
          <ul class="text-gray-300 space-y-1.5 text-sm">
            <li>Fateh — 35 runs</li>
            <li>Vishal — 35 runs</li>
            <li>Arund — 35 runs</li>
            <li>Swaraj — 28 runs</li>
          </ul>
        </div>
      </div>

      <h3 class="text-2xl font-bold text-white mb-4">Watch the Full Match</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The full match recording is up on YouTube. Players, families, and supporters — feel free
        to dive in and study any part of the innings.
      </p>
      <div class="aspect-video rounded-xl overflow-hidden bg-black mb-6">
        <iframe
          src="https://www.youtube.com/embed/tSg-RzLFrCQ"
          title="Challengers CC vs Sarnia Cricket Club — 2026 Season Opener"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      </div>

      <h3 class="text-2xl font-bold text-white mb-4">Members — Reflect While It&apos;s Fresh</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Registered Challengers CC members can sign in to <strong class="text-white">C3H</strong>
        and add a personal reflection card for this match. The system pulls up your last few
        reflections, surfaces patterns, and recommends specific Batting Principles to focus on
        before next training.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        👉 <a href="/c3h/replays" class="text-primary-400 hover:text-primary-300 underline font-semibold">Watch the match on C3H Match Replays</a>
        and click <em>Reflect on this match</em> to open your reflection journal.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Looking Ahead</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Our LCL T30 season opens <strong class="text-white">May 10 vs London Predators</strong> at
        Northridge Cricket Ground. LPL T30 follows the same day vs Maple Tigers at Silverwoods.
        Weekly training continues every Wednesday from <strong class="text-white">May 13</strong>,
        7:00 PM at Silverwoods.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">Thank You</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Big thank you to <strong class="text-white">Sarnia Cricket Club</strong> for hosting and to
        every Challenger who showed up and made the day work — players, drivers, and family who
        travelled to Sarnia for the match. This is the standard we&apos;re setting for the season.
      </p>

      <p class="text-gray-400 text-sm italic">
        Challengers Cricket Club — London, Ontario&apos;s inclusive community cricket club.
        Registered Ontario Not-For-Profit Corporation #1746974-8. Follow us on
        <a href="https://www.instagram.com/challengers.cc/" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">@challengers.cc</a>
        and subscribe on
        <a href="https://www.youtube.com/@Challengersccldn" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">YouTube</a>
        for match livestreams and highlights all season.
      </p>
    `,
    category: 'Match Reports',
    author: 'Challengers CC',
    date: '2026-04-26',
    image: '/ccc-logo.png',
    video: null,
    featured: true,
  },
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
    slug: 'sai-thai-community-partner',
    title: 'Sponsor Spotlight: Sai Thai Chef, Bringing Rich Thai Flavours to Our Community',
    excerpt:
      'Sai Thai Chef joins Challengers Cricket Club as a Community Partner, bringing authentic Thai cuisine and a shared passion for bringing people together.',
    content: `
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Partner Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official partner introduction video featuring Sai Thai Chef and Challengers Cricket Club.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club is proud to welcome <strong class="text-white">Sai Thai</strong> as our
        newest Community Partner for the 2026 season. Known for its authentic flavours and commitment to quality,
        Sai Thai brings the rich taste of Thai cuisine to our community.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">A Perfect Partnership</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Cricket and great food go hand in hand. Whether it is a post-match meal with the team or fuelling
        up before a big game, Sai Thai brings the kind of flavours that bring people together. Their support
        reflects a shared passion for community, quality, and bringing people from all backgrounds to the same table.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Why Sai Thai?</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Sai Thai is known for its authentic Thai cuisine, prepared with care and quality ingredients. From
        classic Pad Thai to rich curries and fresh stir-fries, every dish is crafted to deliver the true
        taste of Thailand right here in our community.
      </p>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Good food brings people together, just like cricket. We are proud to support Challengers
          Cricket Club and the community they are building."
        </p>
        <cite class="text-gray-400 mt-2 block">Sai Thai</cite>
      </blockquote>
      <p class="text-gray-400 text-sm italic">
        Sai Thai is a Community Partner of Challengers Cricket Club. Supporting our partners means supporting the club.
        Mention Challengers CC when you visit!
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-04-14',
    image: '/sai-thai-sponsor.jpeg',
    video: '/videos/sai-thai-sponsor.mp4',
    featured: false,
  },
  {
    slug: 'curry-culture-community-partner',
    title: 'Sponsor Spotlight: Curry Culture Bistro — Authentic Indian Flavours in Kitchener',
    excerpt:
      'Curry Culture Bistro joins Challengers Cricket Club as a Community Partner, bringing authentic North Indian cuisine, Indo-Chinese favourites, and late-night hospitality to our players, families, and supporters across Ontario.',
    content: `
      <h3 class="text-2xl font-bold text-white mb-4">Watch Our Partner Intro</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Check out our official partner introduction video featuring Curry Culture Bistro and Challengers Cricket Club.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers Cricket Club is proud to welcome <strong class="text-white">Curry Culture Bistro</strong>,
        located at <strong class="text-white">29 King St E #5, Kitchener, ON</strong>, as our newest Community
        Partner for the 2026 season. Curry Culture Bistro serves authentic North Indian cuisine and Indo-Chinese
        favourites in a modern, welcoming bistro setting — bringing traditional spices, fresh ingredients, and
        warm hospitality to Kitchener-Waterloo.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">A Definite Stop on Match Day Trips</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Our players and families regularly travel through Kitchener-Waterloo on the way to and from matches across
        Ontario. <strong class="text-white">If you're travelling to or from Kitchener, Curry Culture Bistro is a
        definite stop for every Challenger.</strong> Whether it's a pre-game fuel-up, a celebratory team meal after
        a win, or a late-night plate on the road home — make the detour. You won't regret it.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Open When You Need It — Even After a Late Match</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Cricket matches run long, and the drive home gets even longer. Curry Culture Bistro's hours are
        custom-made for match days:
      </p>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-white">Monday – Saturday:</strong> 7:30 AM – 4:00 AM</li>
        <li><strong class="text-white">Sunday:</strong> 10:00 AM – 12:00 AM</li>
      </ul>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Open well past midnight most nights — perfect for teams heading home after a long day at the ground.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Signature Dishes to Order</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-4">
        A few highlights from the Curry Culture Bistro menu:
      </p>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-white">Butter Chicken</strong> — a Canadian Indian-food classic, done right</li>
        <li><strong class="text-white">Dal Makhani</strong> — slow-cooked black lentils in butter and cream</li>
        <li><strong class="text-white">Paneer Tikka Masala</strong> — rich, fragrant, full-flavoured</li>
        <li><strong class="text-white">Hyderabadi Dum Biryani</strong> — aromatic, layered, unmistakable</li>
        <li><strong class="text-white">Chole Bhatura</strong> — the comfort-food favourite</li>
        <li><strong class="text-white">Street food specials</strong> — Pani Puri, Samosa Chaat, Pav Bhaji</li>
        <li><strong class="text-white">Indo-Chinese & Hakka</strong> — noodles, Manchurian, and fusion classics</li>
      </ul>
      <h3 class="text-2xl font-bold text-white mb-4">What People Are Saying</h3>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic mb-4">
          "Best Indian food I've ever eaten. Top-notch service."
        </p>
        <cite class="text-gray-400 block">— Jess M</cite>
      </blockquote>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic mb-4">
          "Most delicious food ever. Home taste."
        </p>
        <cite class="text-gray-400 block">— Jaspreet Kaur</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Visit Curry Culture Bistro</h3>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-none space-y-2">
        <li>📍 <strong class="text-white">Address:</strong> 29 King St E #5, Kitchener, ON N2G 2K4</li>
        <li>📞 <strong class="text-white">Phone:</strong> (548) 889-5779</li>
        <li>✉️ <strong class="text-white">Email:</strong> info@curryculturebistro.ca</li>
        <li>🌐 <strong class="text-white">Website:</strong> <a href="https://curryculturebistro.ca/" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 underline">curryculturebistro.ca</a></li>
        <li>📸 <strong class="text-white">Instagram:</strong> @curryculturebistro</li>
        <li>🚗 <strong class="text-white">Available on:</strong> DoorDash, takeout, dine-in, catering, private dining</li>
      </ul>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Food brings people together, and so does cricket. We are proud to support Challengers Cricket Club
          and the inclusive, growing community they are building across Ontario."
        </p>
        <cite class="text-gray-400 mt-2 block">Curry Culture Bistro, Kitchener</cite>
      </blockquote>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        📍 <strong class="text-white">Travelling through KW for a match?</strong> Plan your stop at Curry Culture
        Bistro and tell them Challengers CC sent you.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        👉 <a href="/partners/curry-culture-bistro" class="text-primary-400 hover:text-primary-300 underline font-semibold">Visit our partner page for Curry Culture Bistro</a>
        — quick links to order online, view the menu, make a reservation, or get directions.
      </p>
      <p class="text-gray-400 text-sm italic">
        Curry Culture Bistro is a Community Partner of Challengers Cricket Club. Supporting our partners means
        supporting the club. Mention Challengers CC when you visit!
      </p>
    `,
    category: 'Sponsor Spotlight',
    author: 'Challengers CC',
    date: '2026-04-24',
    image: '/curry-culture-sponsor.png',
    video: '/videos/curry-culture-sponsor.mp4',
    featured: false,
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
    slug: 'gokul-prakash-player-profile',
    title: 'Player Profile: Gokul Prakash, Director & Community Cricket Champion',
    excerpt:
      'Meet Gokul Prakash, a Director of Challengers Cricket Club, Hardware and Networking Engineer, and a man who has dedicated 15+ years to community service and growing cricket in Canada.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Some people play cricket. Others live it. <strong class="text-white">Gokul Prakash</strong> has been
        doing both for as long as he can remember. A founding director of Challengers Cricket Club, Gokul
        brings a lifelong passion for cricket and over 15 years of community service to everything he does.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">On the Field</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Gokul is not just a player. He is a match winner with the ball. A <strong class="text-white">Bowler
        of the Tournament</strong> award winner, Gokul is consistently one of the
        <strong class="text-white">top performing bowlers</strong> in any tournament he plays. His ability to
        pick up wickets at crucial moments, maintain pressure on batsmen, and lead the bowling attack makes
        him one of the most dangerous bowlers in London's cricket scene. Whether it is a practice session
        or a league match, Gokul gives everything he has and his dedication to growing cricket in Canada
        drives him to not just play but to build the sport from the ground up.
      </p>
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 20px; margin: 20px 0;">
        <h4 class="text-lg font-bold text-accent-400 mb-3 text-center">Achievements</h4>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 12px; padding: 16px 24px; text-align: center;">
            <div class="text-2xl mb-1">🏆</div>
            <div class="text-sm font-bold text-accent-400">Bowler of the Tournament</div>
          </div>
          <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px 24px; text-align: center;">
            <div class="text-2xl mb-1">🎯</div>
            <div class="text-sm font-bold text-primary-400">Leading Wicket Taker</div>
          </div>
        </div>
      </div>
      <div style="margin: 24px 0;">
        <img src="/Gokul-Achievement-1.jpeg" alt="Gokul Prakash - Bowler of the Tournament" style="width: 100%; border-radius: 12px;" />
        <p class="text-gray-500 text-xs text-center mt-2">Gokul Prakash receiving his Bowler of the Tournament award</p>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Beyond Cricket</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        By profession, Gokul is a <strong class="text-white">Hardware and Networking Engineer</strong>, bringing
        technical expertise and problem-solving skills to the club's operations. Outside of work and cricket,
        he pursues his passion for <strong class="text-white">YouTube blogging</strong> and
        <strong class="text-white">international travel</strong>, documenting his experiences and connecting
        with communities around the world. His 15+ years of volunteering in community-based events speaks
        to his deep commitment to making a positive impact wherever he goes.
      </p>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Quick Facts</h3>
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Club Role: Director, Challengers Cricket Club</li>
          <li>Playing Role: Bowler</li>
          <li>Achievement: Bowler of the Tournament</li>
          <li>Record: Consistently one of the top performing bowlers in any tournament</li>
          <li>Profession: Hardware and Networking Engineer</li>
          <li>Community Service: 15+ years of volunteering</li>
          <li>Interests: YouTube blogging, international travel</li>
        </ul>
      </div>
      <blockquote class="border-l-4 border-primary-500 pl-6 my-8">
        <p class="text-gray-300 text-lg italic">
          "Cricket is more than a game. It is a way to bring people together, build friendships, and
          create something meaningful for the community. That is why I am here."
        </p>
        <cite class="text-gray-400 mt-2 block">Gokul Prakash, Director, Challengers Cricket Club</cite>
      </blockquote>
      <h3 class="text-2xl font-bold text-white mb-4">Why Gokul Matters to Challengers CC</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        A founding director who plays, volunteers, and actively works to grow the sport in Canada is the
        backbone of any cricket club. Gokul Prakash is that backbone for Challengers CC. His dedication,
        experience, and genuine love for cricket and community make him irreplaceable.
      </p>
      <p class="text-gray-400 text-sm italic">
        Part of our Player Profile series. Stay tuned for more stories from the Challengers Cricket Club squad.
      </p>
    `,
    category: 'Player Profile',
    author: 'Challengers CC',
    date: '2026-04-13',
    image: '/Gokul-Prakash-Profile.jpeg',
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
    slug: '2026-full-schedule',
    title: '2026 Full Season Schedule — 26 Matches Across LCL & LPL',
    excerpt:
      'The complete 2026 season schedule for Challengers Cricket Club is here. 14 LCL T30 matches and 12 LPL T30 matches from May to September. View the full fixture list.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The 2026 season is officially loaded! Challengers Cricket Club will play <strong class="text-white">26 matches</strong>
        across two leagues — the London Cricket League (LCL T30) and the London Premier League (LPL T30) — running
        from May through September.
      </p>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0;">
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-primary-400">26</div>
          <div class="text-xs text-gray-400">Matches</div>
        </div>
        <div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-accent-400">2</div>
          <div class="text-xs text-gray-400">Leagues</div>
        </div>
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-blue-400">5</div>
          <div class="text-xs text-gray-400">Venues</div>
        </div>
        <div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-purple-400">May-Sep</div>
          <div class="text-xs text-gray-400">Season</div>
        </div>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">4 Clashing Dates to Watch</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        On four dates, we have both LCL and LPL matches on the same day. This means we need to manage
        two squads and plan availability carefully.
      </p>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-red-400">May 10</strong> — LPL vs Maple Tigers (10 AM) + LCL vs London Predators (1 PM)</li>
        <li><strong class="text-red-400">June 27</strong> — LPL vs Premier XI (9 AM) + LCL vs Western CA B (8 AM)</li>
        <li><strong class="text-red-400">July 25</strong> — LPL vs London Rhinos (9 AM) + LCL vs LCC Mavericks (1 PM)</li>
        <li><strong class="text-red-400">August 2</strong> — LPL vs NLCC (10 AM) + LCL vs Western CA B (8 AM)</li>
      </ul>
      <div style="text-align: center; margin: 24px 0;">
        <a href="/schedule" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          View Full Schedule
        </a>
      </div>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Players can mark their availability for each match through the C3H portal. Captains will announce
        the playing 12 two days before each match. Let's have a great season!
      </p>
    `,
    category: 'Club News',
    author: 'Challengers CC',
    date: '2026-04-20',
    image: null,
    video: null,
    featured: true,
  },
  {
    slug: 'lcl-t30-schedule-2026',
    title: 'LCL T30 Schedule Is Out! 14 Matches Across London & Sarnia',
    excerpt:
      'The 2026 London Cricket League T30 schedule has been released! Challengers CC will play 14 matches from May to September across four venues. Check out the full fixture list.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The wait is over! The <strong class="text-white">2026 LCL T30 league schedule</strong> has officially
        been released and Challengers Cricket Club is locked in for <strong class="text-white">14 matches</strong>
        running from May through September. It is going to be an action-packed season!
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Season at a Glance</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0;">
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-primary-400">14</div>
          <div class="text-xs text-gray-400">Matches</div>
        </div>
        <div style="background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-accent-400">4</div>
          <div class="text-xs text-gray-400">Venues</div>
        </div>
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 16px; text-align: center;">
          <div class="text-2xl font-bold text-blue-400">May - Sep</div>
          <div class="text-xs text-gray-400">Season</div>
        </div>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">Key Fixtures to Watch</h3>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-white">Season Opener (May 10)</strong> vs London Predators at Northridge Cricket Ground</li>
        <li><strong class="text-white">Away Trip to Sarnia (June 14)</strong> vs Sarnia Spartans at Mike Vier Park</li>
        <li><strong class="text-white">Canada Day Clash (July 1)</strong> vs London Rising Stars</li>
        <li><strong class="text-white">Back-to-Back Weekend (July 25-26)</strong> vs LCC Mavericks & London Rising Stars</li>
        <li><strong class="text-white">Season Finale Double Header (Sep 12-13)</strong> vs Inferno Spartans & Tigers Cricket Club</li>
      </ul>
      <h3 class="text-2xl font-bold text-white mb-4">Our Opponents</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        This season we face some of the strongest teams in the London Cricket League including London Predators,
        Forest City Cricketers, Sarnia Spartans, Western Cricket Academy B, London Rising Stars, LCC Maple Stars,
        LCC Mavericks, London Eagle Predators, Inferno Spartans, and Tigers Cricket Club. Every match is going
        to be a battle and we are ready for it.
      </p>
      <h3 class="text-2xl font-bold text-white mb-4">Venues</h3>
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(234,179,8,0.1)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <ul class="text-gray-300 text-lg leading-relaxed list-disc list-inside space-y-2">
          <li>Northridge Cricket Ground, London</li>
          <li>North London Athletic Fields, London</li>
          <li>Silverwoods Cricket Ground, London</li>
          <li>Mike Vier Park, Sarnia</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="/schedule" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(to right, #10b981, #059669); color: white; font-weight: 600; border-radius: 8px; text-decoration: none; font-size: 16px;">
          View Full Schedule
        </a>
      </div>
      <h3 class="text-2xl font-bold text-white mb-4">LCL T20 & LPL Coming Soon</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        The T30 is just the beginning. We are also registered for the LCL T20 league and the London Premier
        League (LPL). Those schedules will be published as soon as fixtures are confirmed. Keep an eye on
        our <a href="/schedule" class="text-primary-400 hover:text-primary-300 underline">Schedule page</a>
        for updates.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Let's go Challengers! Game on!
      </p>
    `,
    category: 'Club News',
    author: 'Challengers CC',
    date: '2026-04-13',
    image: null,
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
  {
    slug: 'c3h-player-portal-benefits',
    title: 'What Every Registered Player Gets: The C3H Portal',
    excerpt:
      'Your membership includes free access to C3H — our private player development portal with shot planning, training programs, match reflections, squad tools, live scoring, and more.',
    content: `
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        When you register with Challengers Cricket Club, you don't just get a spot on the team. You get free access to
        <strong class="text-white">C3H</strong> — our private members-only player development portal, built specifically
        for Challengers players. No extra cost. No subscriptions. It's included with your season membership.
      </p>

      <div style="background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.15)); border: 2px solid rgba(59,130,246,0.3); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 class="text-2xl font-bold text-white mb-2">7 Features. All Free. All Yours.</h3>
        <p class="text-gray-300">Sign in with your registered Gmail at <a href="https://www.challengerscc.ca/c3h" class="text-primary-400 hover:text-primary-300 underline">challengerscc.ca/c3h</a></p>
      </div>

      <h3 class="text-2xl font-bold text-white mb-4">1. The Nets — Match Reflections</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        After every match, log how you felt, how you got out, what went right, and what went wrong. The system
        tracks your patterns over time and gives you <strong class="text-white">personalized coaching tips</strong>
        based on your data. If you keep getting caught at slips, the system notices and tells you exactly what
        to work on. It's like having a coach in your pocket.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">2. Shot Planner & Wagon Wheel</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        An interactive wagon wheel where you can tap each zone to see which shots go there. Rate every shot as
        <span class="text-primary-400 font-bold">Strong</span>,
        <span class="text-accent-400 font-bold">Working On</span>, or
        <span class="text-red-400 font-bold">Avoid</span>.
        Then build <strong class="text-white">game plans vs specific bowler types</strong> — fast, medium, off spin,
        leg spin, left-arm. Know exactly which shots you will play before you walk out to bat. Switch between
        right-handed and left-handed batter views.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">3. Training Programs & Drills</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Four structured 2-week training programs with <strong class="text-white">35+ YouTube video guides</strong>
        linked at exact timestamps. Each program has 4 sessions with specific drills and reps:
      </p>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-white">Drive Mastery</strong> — Straight drive, cover drive, on drive, lofted drive</li>
        <li><strong class="text-white">Leg Spin Bowling</strong> — Grip, wrist action, top spinner, slider, googly</li>
        <li><strong class="text-white">Power Hitting</strong> — Hand speed, timing, swing path, attacking spin</li>
        <li><strong class="text-white">Strike Rotation</strong> — Rotating vs spin and seam bowling</li>
      </ul>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Plus the AB de Villiers 360 Batting Masterclass playlist and TPG Cricket Academy coaching videos.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">4. The Dugout — Match Availability</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        See every match for the season. Mark yourself as Available, Maybe, or Unavailable for each match
        so the captain knows who's in. No more WhatsApp confusion — everything is in one place.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">5. The Dugout — Squad & Field (Captains Only)</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Captains get additional tools to manage the team:
      </p>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-white">Squad Selection</strong> — Pick the playing 12, assign roles (captain, vice-captain, keeper, batting sub, bowling sub)</li>
        <li><strong class="text-white">Batting Order</strong> — Drag players up and down to set the batting lineup</li>
        <li><strong class="text-white">Field Position Editor</strong> — Drag fielders on a full cricket ground, auto-detect positions (Cover, Point, Mid-wicket, etc.), mirror for left-hand batters, and share a clean screenshot with the team</li>
        <li><strong class="text-white">Squad Card</strong> — Generate a match-day squad card to share in the group</li>
      </ul>

      <h3 class="text-2xl font-bold text-white mb-4">6. The Scorer — Live Ball-by-Ball Scoring</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Full match scoring with coin toss, player selection, and ball-by-ball entry. Track runs, extras
        (wides, no balls, byes, leg byes), wickets with dismissal types, and fielder credits. Live batting
        stats (runs, balls, fours, sixes, strike rate) and bowling figures (overs, maidens, runs, wickets,
        economy). Auto-saves to the cloud so anyone can take over scoring mid-match.
      </p>

      <h3 class="text-2xl font-bold text-white mb-4">7. Mental Game Guide</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        A dedicated <a href="/mental-game" class="text-primary-400 hover:text-primary-300 underline">Mental Game page</a>
        with the 3-Step Bounce Back routine, pre-match mental scripts, the LOOK-BREATHE-SAY pre-ball routine,
        a 3-Phase Innings Plan, performance tracking KPIs, shot maps, pro quotes for inspiration, and
        training videos. Everything a batter needs to prepare mentally before stepping onto the field.
      </p>

      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(234,179,8,0.15)); border: 2px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 class="text-2xl font-bold text-white mb-4">Additional Resources Included</h3>
        <ul class="text-gray-300 text-lg leading-relaxed space-y-3">
          <li><strong class="text-white">Full Season Schedule</strong> — All 26 matches (LCL T30 + LPL T30) with dates, venues, and times on our <a href="/schedule" class="text-primary-400 hover:text-primary-300 underline">Schedule page</a></li>
          <li><strong class="text-white">Indoor Practice at Kover Drive</strong> — Access to London's premier indoor cricket facility through our community partnership</li>
          <li><strong class="text-white">Coaching by TPG Cricket Academy</strong> — Professional coaching sessions with Coach Manish Giri</li>
          <li><strong class="text-white">Community Partners</strong> — Discounts and perks from our sponsor partners</li>
          <li><strong class="text-white">Club Communication</strong> — Direct access to board members and captains through the portal</li>
          <li><strong class="text-white">Season Merchandise</strong> — Official Challengers CC jerseys and team gear</li>
        </ul>
      </div>

      <h3 class="text-2xl font-bold text-white mb-4">Coming Soon</h3>
      <ul class="text-gray-300 text-lg leading-relaxed mb-6 list-disc list-inside space-y-2">
        <li><strong class="text-white">Season Stats & Leaderboards</strong> — Track your season averages, top performers, and match history</li>
        <li><strong class="text-white">The Pavilion</strong> — Board governance tools for resolutions, voting, and meeting records</li>
      </ul>

      <h3 class="text-2xl font-bold text-white mb-4">How to Access</h3>
      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        All registered players already have access. Just go to
        <a href="https://www.challengerscc.ca/c3h" class="text-primary-400 hover:text-primary-300 underline">challengerscc.ca/c3h</a>
        and sign in with the Gmail address you registered with. If you're having trouble logging in,
        reach out at <a href="mailto:contact@challengerscc.ca" class="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>.
      </p>

      <p class="text-gray-300 text-lg leading-relaxed mb-6">
        Challengers CC is a registered Ontario nonprofit. All membership fees go directly toward league fees,
        equipment, ground bookings, and player development. C3H is a free member benefit — not a paid product.
      </p>

      <p class="text-gray-300 text-lg leading-relaxed">
        This is what sets Challengers apart. We don't just play cricket — we invest in our players' growth,
        on and off the field. Welcome to C3H.
      </p>
    `,
    category: 'Club News',
    author: 'Challengers CC',
    date: '2026-04-24',
    image: null,
    video: null,
    featured: true,
  },
];

export const categories = ['All', 'Match Reports', 'Sponsor Spotlight', 'Player Profile', 'Club News'] as const;

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
