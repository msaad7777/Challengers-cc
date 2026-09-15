import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TierCalculator from './TierCalculator';

export const metadata: Metadata = {
  title: 'Join for 2027 | Challengers Cricket Club',
  description:
    'Registration is open for the 2027 season. $150 secures your place; full-season members pay the balance in March. Cricket in London, Ontario — open to newcomers and experienced players alike.',
};

/**
 * Where the money goes. Percentages are of the core T30 season budget
 * (both leagues, 26 fixtures) — see the 2027 operating budget. Published
 * because members and funders both ask, and the answer is a good one.
 */
const ALLOCATION = [
  { label: 'League entry fees', pct: 44, detail: 'LCL and LPL T30 entry' },
  { label: 'Indoor winter nets', pct: 17, detail: 'Facility hire and indoor balls' },
  { label: 'Kit and equipment', pct: 12, detail: 'Jerseys, stumps, pads, keeping gear' },
  { label: 'Match days', pct: 12, detail: 'Match balls, food and water' },
  { label: 'Club running costs', pct: 11, detail: 'Admin, AGM, bank fees, contingency' },
  { label: 'Ground and insurance', pct: 4, detail: 'Outdoor booking and field insurance' },
];

export default function JoinPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-400 text-xs font-bold tracking-wide uppercase">
            Registration open
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-5">
            Play for Challengers in <span className="gradient-text">2027</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mt-5 max-w-2xl">
            We are a community cricket club in London, Ontario, playing two T30 leagues.
            In our first season we reached the LPL Division 2 semi-final. You do not need
            to have played here before, and you do not need to pay for a whole season up front.
          </p>
          <p className="text-gray-400 mt-4 max-w-2xl">
            <span className="text-white font-semibold">$150 secures your place.</span>{' '}
            Full-season members pay the remaining $150 in March 2027.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="glass rounded-2xl p-7 glass-hover">
              <h2 className="text-2xl font-bold text-white">Part Season</h2>
              <p className="text-4xl font-bold text-gray-200 mt-2">$150</p>
              <p className="text-gray-500 text-xs mt-1">Under 50% of the T30 season</p>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-400">
                <li>Under 50% of the T30 fixtures — 13 of 26 on 2026 numbers</li>
                <li>Indoor winter nets and outdoor practice</li>
                <li>Full access to the members portal and coaching hub</li>
                <li>Nothing further to pay</li>
              </ul>
            </div>
            <div className="glass rounded-2xl p-7 glass-hover border border-primary-500/30">
              <h2 className="text-2xl font-bold text-white">Full Season</h2>
              <p className="text-4xl font-bold text-primary-400 mt-2">$300</p>
              <p className="text-gray-500 text-xs mt-1">50% or more of the T30 season</p>
              <ul className="mt-5 space-y-2.5 text-sm text-gray-400">
                <li>50% or more of the T30 fixtures — 13 of 26 on 2026 numbers</li>
                <li>Everything in Part Season</li>
                <li><span className="text-gray-200">Selection managed so you reach playoff eligibility</span>, if you meet your availability commitment</li>
                <li>Priority consideration for selection, including playoff squads</li>
                <li>$150 now, $150 in March 2027</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TierCalculator />
        </div>
      </section>

      {/* Where the money goes */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Where your fee <span className="gradient-text">actually goes</span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl">
            We are a not-for-profit. Nobody takes a salary, and every dollar goes into running
            the season. This is the breakdown of our 2027 operating budget.
          </p>
          <div className="glass rounded-2xl p-6 sm:p-8 mt-6 space-y-4">
            {ALLOCATION.map((a) => (
              <div key={a.label}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-white font-semibold text-sm">{a.label}</span>
                  <span className="text-primary-400 font-bold text-sm tabular-nums">{a.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">{a.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Member fees cover roughly 60% of a season. The rest comes from our sponsors and
            community grants — which is why{' '}
            <Link href="/looking-for-sponsors" className="text-primary-400 hover:text-primary-300 underline">
              local business support
            </Link>{' '}
            matters so much.
          </p>
        </div>
      </section>

      {/* What is not included + terms */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">The 2027 fixture list is not out yet</h3>
            <p className="text-gray-400 mt-2">
              Neither league has published its 2027 schedule, and we do not yet know how many teams
              will be in each division. Every number on this page is therefore based on{' '}
              <span className="text-gray-200">2026, when we played 26 T30 matches</span> — 14 in the
              LCL and 12 in the LPL.
            </p>
            <p className="text-gray-400 mt-3">
              That is why the tiers are set by <span className="text-gray-200">percentage rather than
              a fixed number of games</span>. Whatever the 2027 count turns out to be, 50% or more is
              Full Season and below that is Part Season. Nothing you agree to now changes if the
              fixture list does.
            </p>
            <p className="text-gray-400 mt-3">
              One thing that may change it: the LPL operates promotion and relegation, and we reached
              the Division 2 semi-final. <span className="text-gray-200">If we go up to Division 1,
              both the number of fixtures and the playoff qualification threshold change.</span> We
              will confirm as soon as the leagues publish.
            </p>
            <p className="text-gray-400 mt-3">
              <span className="text-white font-semibold">Once the schedules are released</span>, you
              get access to the members portal to mark your availability match by match. That is what
              your commitment is measured against — not a number you picked in October.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">How selection works</h3>
            <p className="text-gray-400 mt-2">
              Registering as a Full Season member makes you available for more cricket. It does{' '}
              <span className="text-gray-200">not</span> guarantee you a place in any particular
              squad, and we would rather say that plainly now than have it come as a surprise in July.
            </p>
            <p className="text-gray-400 mt-3">
              Captains, vice-captains and the board pick each squad on four things: the availability
              you marked in advance, your attendance at practice, your current form and skill level,
              and{' '}
              <span className="text-gray-200">squad balance</span> — a side needs a certain number of
              bowlers, batters and a keeper, and the right mix for the opposition and the ground.
              Even a player available for every match will sometimes miss out because the balance
              calls for something else that week.
            </p>
            <p className="text-gray-400 mt-3">
              <span className="text-white font-semibold">What we do commit to.</span> If you are a
              Full Season member and you meet the availability you committed to, the club will
              actively manage selection across the season with the object of getting you to{' '}
              <span className="text-gray-200">playoff eligibility</span> — on 2026 numbers that was
              8 of 14 matches in the LCL and 5 of 12 in the LPL. We plan the first half of the season around this rather than leaving
              it to chance, so that one omission never costs you a place in a knockout.
            </p>
            <p className="text-gray-400 mt-3">
              This is a commitment we build the season around, not an aspiration — but it is not an
              absolute guarantee, and it cannot be. Injury, late withdrawals, weather, league
              rescheduling and your own availability all affect it. Where we fall short of it for a
              member who kept their side of the commitment, we will say so and explain why.
            </p>
            <p className="text-gray-400 mt-3">
              And if you are left out, a captain will tell you before the squad is announced, with the
              reason and when you are next in. Nobody at this club should find out by reading a team
              sheet.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">The T20 season is separate</h3>
            <p className="text-gray-400 mt-2">
              These fees cover the <span className="text-gray-200">T30 season only</span>. The LCL T20
              competition runs in September and is costed separately. We will confirm any T20 fee in
              August, once we know where our sponsorship stands. In 2026 sponsorship covered it in
              full and no additional fee was charged.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">Refunds</h3>
            <p className="text-gray-400 mt-2">
              Your fee is refundable until the club confirms its league entries, expected February
              2027. After that point the money is already committed to league deposits and winter
              facility bookings, and cannot be refunded. We will tell you the exact date before
              it passes.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">If you think you have been treated unfairly</h3>
            <p className="text-gray-400 mt-2">
              Raise it with your captain first. If that does not resolve it, write to{' '}
              <span className="text-gray-200">contact@challengerscc.ca</span> and the board will
              consider it and reply. We would much rather hear about a problem in June than lose a
              player in July.
            </p>
            <p className="text-gray-400 mt-3">
              Registration is subject to our{' '}
              <Link href="/legal/code-of-conduct" className="text-primary-400 hover:text-primary-300 underline">
                Code of Conduct
              </Link>{' '}
              and{' '}
              <Link href="/legal/terms-of-service" className="text-primary-400 hover:text-primary-300 underline">
                Terms of Service
              </Link>. You will be asked to confirm you have read the registration terms when you sign up.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-accent-500/20">
            <h3 className="text-xl font-bold text-white">Receipts and tax status</h3>
            <p className="text-gray-400 mt-2">
              Challengers Cricket Club is a federal{' '}
              <span className="text-gray-200">Not-for-Profit Corporation (No. 1746974-8)</span>,
              incorporated under the Canada Not-for-profit Corporations Act.
            </p>
            <p className="text-gray-400 mt-3">
              <span className="text-accent-400 font-semibold">We are not a registered charity.</span>{' '}
              You will receive a receipt confirming your payment, but it is a payment receipt only —
              not a charitable donation receipt. Registration fees are{' '}
              <span className="text-gray-200">not tax-deductible</span>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to play?</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Register your place for 2027. If you are new to the club or new to London, say so on
              the form — we will get you into winter nets and introduce you to the group.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-7">
              <Link
                href="/#registration"
                className="px-7 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-bold text-white shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                Register for 2027
              </Link>
              <Link
                href="/#contact"
                className="px-7 py-3.5 bg-white/5 border border-white/10 rounded-lg font-semibold text-gray-200 hover:bg-white/10 transition-all"
              >
                Ask a question first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
