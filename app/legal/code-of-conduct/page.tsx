import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Code of Conduct — Challengers Cricket Club',
  description: 'Standards of behaviour expected from players, coaches, board members, and volunteers of Challengers Cricket Club.',
};

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">
          <Link href="/legal" className="text-gray-500 text-sm hover:text-primary-400 inline-flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            All governance documents
          </Link>

          <div className="text-center mb-10">
            <span className="text-3xl">⚖️</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Code of Conduct</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 30 April 2026</p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Purpose</h2>
              <p className="text-sm">Challengers Cricket Club is a community of players, volunteers, and supporters from many faiths, cultures, and backgrounds. This Code of Conduct sets the minimum standard of behaviour expected from everyone associated with the Club. It applies on the field, off the field, online, and at any Club-organized event.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Our values</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li><strong className="text-white">Inclusion.</strong> Every member is welcome regardless of race, ethnicity, nationality, faith, gender, sexual orientation, age, ability, or first language.</li>
                <li><strong className="text-white">Respect.</strong> We treat each other, opponents, officials, and venues with dignity at all times.</li>
                <li><strong className="text-white">Integrity.</strong> We play fair, score honestly, and don&apos;t cheat — even when no one is watching.</li>
                <li><strong className="text-white">Volunteer spirit.</strong> The Club exists because people give their time freely. We are grateful for every contribution and never demand more than someone is willing to give.</li>
                <li><strong className="text-white">Newcomer-first.</strong> We are conscious that many of our members are new to Canada. We help each other, especially with logistics, language, and integration.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What we expect — On the field</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>Show up on time. If you can&apos;t, communicate with the captain.</li>
                <li>Accept umpiring decisions without abuse, even when you disagree. Concerns about umpiring should be raised quietly with the captain after the over or innings.</li>
                <li>Play hard but play fair. No deliberate slow play, no claiming catches that didn&apos;t carry, no obstructing the field outside the laws.</li>
                <li>No sledging that targets race, faith, gender, sexuality, family, country of origin, or any personal trait. Banter is fine; cruelty is not.</li>
                <li>If you see a teammate sledging in a way that crosses the line, the captain or any senior player can call it out and shut it down on the spot.</li>
                <li>Respect the venue: leave it cleaner than you found it. Pick up your trash.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What we expect — Off the field</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>Communication in WhatsApp, email, and in person remains respectful. No insults, no harassment.</li>
                <li>Internal Club business stays internal — including squad selection debates, financial discussions, and personnel matters. Disagreements get raised through the board, not on social media.</li>
                <li>Don&apos;t represent the Club to external parties (sponsors, leagues, media) without authorization from the board.</li>
                <li>Personal information shared by other members (contact details, family situations, medical details) is held in confidence.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Zero tolerance — what gets you removed</h2>
              <p className="text-sm">The following behaviour will result in <strong className="text-white">immediate suspension and a board review</strong>, with possible permanent expulsion:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>Physical violence or threats of violence toward any person</li>
                <li>Sexual harassment or sexual misconduct of any kind</li>
                <li>Discrimination, hate speech, or slurs targeting protected characteristics</li>
                <li>Bullying or repeated targeted abuse of a teammate, opponent, or official</li>
                <li>Theft from the Club, members, sponsors, or venues</li>
                <li>Match-fixing, illegal betting on Club matches, or related corruption</li>
                <li>Bringing illegal substances to Club events</li>
                <li>Any criminal conduct that brings the Club into disrepute</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Anti-doping</h2>
              <p className="text-sm">Members are expected to comply with the Canadian Anti-Doping Program (CADP) when participating in any sanctioned competition. Recreational use of performance-enhancing substances during Club activities is prohibited.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Social media</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>Personal social media is your own — but if you tag the Club, mention sponsors, or post about Club activities, you represent us by association. Post accordingly.</li>
                <li>Don&apos;t post photos or videos of teammates without their consent. Especially of young players or anyone who has opted out under the Volunteer Agreement.</li>
                <li>Don&apos;t share Club WhatsApp messages, internal documents, or board discussions externally.</li>
                <li>Sponsor logos and Club branding may only be used with board approval.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Reporting concerns</h2>
              <p className="text-sm">If you experience or witness behaviour that violates this Code, please report it. You have several options:</p>
              <ul className="space-y-2 mt-2 text-sm list-disc list-inside ml-2">
                <li>Speak directly to the person involved if you feel safe doing so.</li>
                <li>Raise it with your captain or any board member.</li>
                <li>Email the board confidentially at <a href="mailto:contact@challengerscc.ca" className="text-primary-400 underline hover:text-primary-300 break-all">contact@challengerscc.ca</a>.</li>
                <li>For urgent safety concerns or criminal conduct, contact local police directly.</li>
              </ul>
              <p className="text-sm mt-2">We will treat reports confidentially and will not retaliate against anyone who raises a concern in good faith. If a report involves a board member, that member will recuse themselves from the review.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Disciplinary process</h2>
              <p className="text-sm">For non-zero-tolerance violations, the Club follows a graduated approach:</p>
              <ol className="space-y-2 mt-2 text-sm list-decimal list-inside ml-2">
                <li><strong className="text-white">Verbal warning</strong> from a captain or board member — for minor or first-time issues.</li>
                <li><strong className="text-white">Written warning</strong> from the board — for repeated or more serious issues.</li>
                <li><strong className="text-white">Suspension</strong> from Club activities for a defined period, decided by the board.</li>
                <li><strong className="text-white">Permanent expulsion</strong> from the Club, decided by majority board vote.</li>
              </ol>
              <p className="text-sm mt-2">For zero-tolerance violations, the process starts at suspension or expulsion, with the board reviewing the matter at its earliest opportunity. The accused will be given a fair opportunity to respond before any final decision.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Acceptance</h2>
              <p className="text-sm">By signing the <Link href="/legal/volunteer-agreement" className="text-primary-400 underline hover:text-primary-300">Volunteer Agreement</Link> or the <Link href="/legal/liability-waiver" className="text-primary-400 underline hover:text-primary-300">Liability Waiver</Link>, members confirm they have read, understood, and accept this Code of Conduct.</p>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">Document version: v1.0 · 30 April 2026 · Pending legal review.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
