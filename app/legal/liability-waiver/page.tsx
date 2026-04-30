import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Liability Waiver — Challengers Cricket Club',
  description: 'Liability Waiver and Acknowledgement of Risk for players of Challengers Cricket Club.',
};

export default function LiabilityWaiverPage() {
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
            <span className="text-3xl">🏏</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Liability Waiver</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Ontario NFP Corporation #1746974-8</p>
          </div>

          <div className="rounded-2xl p-5 mb-8 border-2 border-red-500/40 bg-red-500/5">
            <p className="text-sm text-red-200 leading-relaxed">
              <strong className="text-red-400">⚠️ Read carefully before signing.</strong> This is a legal document
              that affects your rights. By signing, you give up your right to sue the Club, its directors,
              its volunteers, its sponsors, and venue operators for injuries that arise from the inherent
              risks of cricket — even if those injuries are serious. If you do not understand any part of
              this Waiver, ask a board member to explain, or seek your own legal advice before signing.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Activity</h2>
              <p className="text-sm">This Waiver covers participation in any cricket-related activity organized, hosted, or facilitated by Challengers Cricket Club, including (without limitation):</p>
              <ul className="space-y-1.5 mt-2 text-sm list-disc list-inside ml-2">
                <li>Practice sessions (indoor and outdoor)</li>
                <li>League matches (LCL T30, LPL T30, and other competitive leagues)</li>
                <li>Friendly matches, tournaments, and exhibition games</li>
                <li>Training drills, nets, and coaching sessions</li>
                <li>Travel to and from matches and events arranged by the Club</li>
                <li>Social and team-building events organized by the Club</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Acknowledgement of Inherent Risks</h2>
              <p className="text-sm">I acknowledge that participation in cricket carries inherent risks that cannot be entirely eliminated, including but not limited to:</p>
              <ul className="space-y-1.5 mt-2 text-sm list-disc list-inside ml-2">
                <li>Being struck by a hard cricket ball at high speed (causing bruising, lacerations, fractures, dental injury, eye injury, or concussion)</li>
                <li>Being struck by a cricket bat</li>
                <li>Collisions with other players, fielders, walls, fences, or stumps</li>
                <li>Falls, slips, sprains, strains, fractures, ligament tears, and muscle injuries</li>
                <li>Heat-related illness, hypothermia, or weather-related injury</li>
                <li>Concussion and head injury, including the possibility of long-term effects</li>
                <li>Aggravation of pre-existing medical conditions</li>
                <li>Catastrophic injury, including paralysis or death (rare but possible)</li>
                <li>Injury arising from the conduct of other players, officials, or spectators</li>
                <li>Injury during travel to or from cricket activities</li>
              </ul>
              <p className="text-sm mt-3">I voluntarily assume these risks. I confirm I am physically and mentally fit to participate in cricket, or have been cleared by a qualified medical practitioner to do so.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Concussion Acknowledgement (Rowan&apos;s Law)</h2>
              <p className="text-sm">In accordance with Ontario&apos;s Rowan&apos;s Law (Concussion Safety), 2018, I confirm that I have read or had the opportunity to read the Government of Ontario&apos;s <a href="https://www.ontario.ca/page/rowans-law-concussion-safety" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">concussion awareness resources</a>. I understand the signs and symptoms of concussion, and I agree:</p>
              <ul className="space-y-1.5 mt-2 text-sm list-disc list-inside ml-2">
                <li>To report any suspected concussion to the Club&apos;s captain or board immediately</li>
                <li>To remove myself from play if I suspect I have a concussion</li>
                <li>Not to return to play after a concussion until cleared by a qualified medical practitioner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Release of Claims</h2>
              <p className="text-sm">In consideration of being permitted to participate in Club activities, I, on behalf of myself, my heirs, executors, administrators, and assigns, hereby <strong className="text-white">release, waive, and discharge</strong> the following parties (collectively, the &ldquo;Released Parties&rdquo;):</p>
              <ul className="space-y-1.5 mt-2 text-sm list-disc list-inside ml-2">
                <li>Challengers Cricket Club</li>
                <li>Its directors, officers, captains, coaches, and volunteers</li>
                <li>Its sponsors and partner organizations</li>
                <li>Owners and operators of any venue used by the Club</li>
                <li>Any league or governing body the Club competes within</li>
              </ul>
              <p className="text-sm mt-3">From any and all claims, demands, actions, and causes of action arising out of or in any way related to my participation in Club activities, including injuries arising from the negligence of the Released Parties, except for injuries caused by their gross negligence or wilful misconduct.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Indemnity</h2>
              <p className="text-sm">I agree to indemnify and hold harmless the Released Parties from any and all claims brought against them by any third party as a result of my actions while participating in Club activities, except where caused by the gross negligence or wilful misconduct of the Released Parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Medical Authorization</h2>
              <p className="text-sm">In the event of a medical emergency, I authorize the Club&apos;s captains, board members, or appointed designates to seek emergency medical treatment on my behalf. I understand I am responsible for any costs associated with my medical care that are not covered by provincial health insurance or my own private insurance.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Insurance</h2>
              <p className="text-sm">I confirm that I am covered by the Ontario Health Insurance Plan (OHIP) or have alternative health insurance that will cover any injury sustained during Club activities. I understand the Club does not provide individual medical or accident insurance for players. The Club may carry general liability and accident insurance for organizational protection, but this does not replace personal coverage.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Voluntary Signing</h2>
              <p className="text-sm">I confirm that I am signing this Waiver voluntarily and of my own free will. I have not been pressured or induced to sign. I have had the opportunity to ask questions and seek independent legal advice before signing. I understand that I am free not to sign — but if I do not sign, I will not be permitted to participate in Club activities.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Severability</h2>
              <p className="text-sm">If any provision of this Waiver is found by a court to be unenforceable, the remaining provisions remain in full force and effect.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. Governing Law</h2>
              <p className="text-sm">This Waiver is governed by the laws of the Province of Ontario and the federal laws of Canada applicable in Ontario. Any dispute arising from it shall be resolved in the courts of Ontario.</p>
            </section>

            <hr className="border-white/10" />

            <section>
              <h2 className="text-lg font-bold text-white mb-3">Signature</h2>
              <p className="text-sm mb-4"><strong className="text-white">I have read this Waiver. I understand it. I agree to its terms.</strong></p>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Player Full Name</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date of Birth (YYYY-MM-DD)</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Signature</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date Signed</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-400 block mb-1">Emergency Contact Name &amp; Phone</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">For Players Under 18</h2>
              <p className="text-sm mb-4">A parent or legal guardian must co-sign this Waiver. By signing, the parent/guardian confirms they have read and understood the Waiver and consent to the minor&apos;s participation.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Parent/Guardian Full Name</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Relationship to Player</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Parent/Guardian Signature</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Date Signed</label>
                  <div className="border-b border-white/30 h-8 print:border-black"></div>
                </div>
              </div>
            </section>

            <hr className="border-white/10" />

            <p className="text-xs text-gray-500 italic">Document version: v1.0 · 30 April 2026 · Pending legal review.</p>
          </div>

          <div className="text-center mt-6 print:hidden text-sm text-gray-500">
            To print or save as PDF: use your browser&apos;s <strong className="text-gray-300">File → Print</strong> menu (or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Ctrl/Cmd + P</kbd>).
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
