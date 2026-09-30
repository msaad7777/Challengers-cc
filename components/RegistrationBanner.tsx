import Link from 'next/link';

/**
 * Homepage strip announcing that 2027 registration is open.
 *
 * Sits directly under the Hero so it is the first thing after the fold.
 * Deliberately leads with the single $150 step rather than the two tiers —
 * the full-season decision is not made until March, and presenting both
 * numbers up front reads like a $300 ask. /join carries the full detail.
 */
export default function RegistrationBanner() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10 md:py-14 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-2xl border-2 border-primary-500/30 p-7 sm:p-9 md:p-11">
          <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 px-3.5 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
              2027 Registration Open
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Play for Challengers in <span className="gradient-text">2027</span>
              </h2>
              <p className="text-gray-300 mt-4 text-lg leading-relaxed">
                Registration starts with one step:{' '}
                <span className="text-white font-semibold">$150 secures your place.</span>{' '}
                No need to commit to a full season before you have even seen the fixture list.
              </p>
              <p className="text-gray-400 mt-3">
                The full-season option opens in March 2027, once both leagues have published
                their schedules and you can see what you are actually committing to.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <Link
                  href="/#registration"
                  className="px-7 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-bold text-white shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  Register for 2027
                </Link>
                <Link
                  href="/join"
                  className="px-7 py-3.5 bg-white/5 border border-white/10 rounded-lg font-semibold text-gray-200 hover:bg-white/10 transition-all"
                >
                  See what is included
                </Link>
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-white/10">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Your $150 covers
              </p>
              <ul className="mt-4 space-y-3.5">
                {[
                  ['Indoor winter nets', 'Start training with the squad this winter'],
                  ['Get to know the team', 'In the group well before the season starts'],
                  ['In the queue for jerseys', '2027 kit is ordered in registration order'],
                  ['Members portal access', 'Coaching hub, availability and match plans'],
                ].map(([title, detail]) => (
                  <li key={title} className="flex items-start gap-2.5">
                    <svg
                      className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      <span className="block text-sm font-semibold text-gray-200">{title}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
