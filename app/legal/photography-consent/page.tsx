import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignBlock from './SignBlock';

export const metadata = {
  title: 'Photography & Media Consent — Challengers Cricket Club',
  description: 'Consent terms for the use of photos, videos, livestreams, and other recordings of Challengers Cricket Club members in Club communications, social media, and live broadcasts.',
};

export default function PhotographyConsentPage() {
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
            <span className="text-3xl">📸</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-3">Photography &amp; Media Consent</h1>
            <p className="text-sm text-gray-500">Challengers Cricket Club · Effective 4 May 2026</p>
          </div>

          {/* Plain-language summary */}
          <div className="rounded-2xl p-5 mb-8 border-2 border-accent-500/30 bg-accent-500/5">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">Plain-language summary.</strong> Cricket happens in public. Photos
              of practices, matches, team gatherings, and award nights help us run the Club, share the season with
              families, and recruit sponsors. By registering with Challengers Cricket Club you consent to your image
              and likeness being captured and used in our communications, livestreams, and social media. You can
              withdraw or limit this consent at any time, in writing — no questions asked.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 text-gray-200 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Who this applies to</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>All registered members of Challengers Cricket Club</li>
                <li>Parents or guardians of registered members under the age of 18, who consent on behalf of the minor</li>
                <li>Guests and visitors at Club events, who consent by attending publicly-advertised activities</li>
                <li>Volunteers, board members, coaches, and any other adults present at Club activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">What we capture</h2>
              <p className="text-sm">In the ordinary course of running the Club, we capture and may use:</p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li><strong className="text-white">Photographs</strong> of practices, matches, team gatherings, sponsor cheque presentations, awards nights, and Club events</li>
                <li><strong className="text-white">Video recordings</strong> of matches and highlights, including drone footage where authorized by the venue</li>
                <li><strong className="text-white">Livestream broadcasts</strong> of matches via the Club&apos;s YouTube channel or third-party platforms</li>
                <li><strong className="text-white">Audio</strong>, including post-match interviews, podcast recordings, and crowd ambience captured during livestreams</li>
                <li><strong className="text-white">Names, jersey numbers, and statistics</strong> alongside images, when used for player profiles, match reports, or scoreboards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">How we use captured material</h2>
              <p className="text-sm">Captured material may be used for any of the following Club purposes without further specific consent, provided the use is consistent with our mission and the
                <Link href="/legal/code-of-conduct" className="text-primary-400 hover:text-primary-300 underline mx-1">Code of Conduct</Link>:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>The Club&apos;s website (challengerscc.ca), blog, and members&apos; portal</li>
                <li>Social media accounts (Instagram, Facebook, YouTube, X, LinkedIn) operated by or on behalf of the Club</li>
                <li>Public livestreams of matches and the resulting on-demand recordings</li>
                <li>Newsletters, fundraising appeals, sponsor pitch decks, grant applications, and annual reports</li>
                <li>Recruitment materials for new members and volunteers</li>
                <li>Training, coaching, and self-review by individual players (e.g. via C3H match replays)</li>
                <li>Press, media, and journalism coverage of Club events, when reasonably foreseeable from the public nature of the activity</li>
              </ul>
              <p className="text-sm mt-3">
                Material is licensed to the Club perpetually and royalty-free for these uses. The Club retains the right to crop, caption, edit, and combine material with other content. The Club does <strong className="text-white">not</strong> sell raw photo libraries to third parties or license imagery for commercial advertising outside the Club&apos;s own fundraising and recruitment.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Special protection for minors (under 18)</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>A parent or guardian must consent to this Policy in writing on behalf of any registered member under the age of 18.</li>
                <li>Names of minors will not be combined with images of minors in <strong className="text-white">externally-facing material</strong> (public website, public social media, public livestream graphics) unless the parent or guardian gives specific additional written consent for the named individual.</li>
                <li>Members&apos;-only material — for example, internal C3H portal scoreboards visible only to logged-in members — may pair name and image. Logged-in family members can see this. The general public cannot.</li>
                <li>The Club does not use images of minors in fundraising appeals or sponsor decks without separate written parent/guardian consent for each named child.</li>
                <li>Drone footage, close-up photography, and any video that focuses on identifiable minors at length will only be used externally with parent/guardian sign-off.</li>
                <li>Parents and guardians may withdraw consent for their child at any time. See the &ldquo;Opt-out&rdquo; section below.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Opt-out and withdrawal of consent</h2>
              <p className="text-sm">You can withdraw or limit your consent at any time. Send an email to
                <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 underline mx-1">contact@challengerscc.ca</a>
                naming yourself (or your child) and stating one of the following:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2 mt-2">
                <li>&ldquo;Withdraw my consent entirely.&rdquo; The Club will exclude you from future photography, video, and livestreams to the extent reasonably possible at large public events. Existing material in archived posts or recordings will not be retroactively scrubbed (impractical for livestreams already published) but will not be re-used in new material.</li>
                <li>&ldquo;No external use of my image.&rdquo; Internal members&apos;-only use (C3H portal, internal training reviews) is fine; external use (public website, social media, sponsor decks) is excluded.</li>
                <li>&ldquo;No use with my name attached.&rdquo; The Club may use your image but will not pair it with your name in captions, headlines, or alt text.</li>
                <li>&ldquo;Remove this specific item.&rdquo; You can request takedown of a specific photo, video, or post. The Club will comply within 14 days for items it controls. Items already shared by third parties (re-shared by sponsors, picked up by media) may be outside the Club&apos;s ability to recall.</li>
              </ul>
              <p className="text-sm mt-3">
                Withdrawing photo consent does <strong className="text-white">not</strong> affect your membership, eligibility to play, or any other Club rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Livestreams and broadcasts</h2>
              <p className="text-sm">
                The Club livestreams matches on our public YouTube channel and may stream via partner platforms when sponsored. Livestreams capture every player on the field, the umpires, scorers, dugout occupants, and members of the public who choose to attend a publicly-advertised match. By taking the field or attending a Club match, you acknowledge the live broadcast nature of the event.
              </p>
              <p className="text-sm mt-2">
                Members under 18 are protected by the &ldquo;Special protection for minors&rdquo; section above for any non-incidental focus on them in stream graphics, lower-thirds, replays, or post-match highlight cuts. Parents who do not want their child livestreamed should notify the Club at least 48 hours before the match so we can position cameras and review on-screen graphics accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Material captured by third parties</h2>
              <p className="text-sm">
                When Club events are covered by independent press, opposing teams, parents, or unaffiliated photographers, the Club has no contractual ability to control how that material is used. This Policy governs what the Club itself does with captured material and how we handle takedown requests for material we control. For material captured and published by third parties, complaints should be directed to the publisher.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Coordination with the Privacy Policy</h2>
              <p className="text-sm">
                Photographs and recordings of identifiable individuals are personal information under PIPEDA. This Policy operates alongside the Club&apos;s
                <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300 underline mx-1">Privacy Policy</Link>
                — both apply, and the more protective term governs in any conflict. Material captured under this Policy is stored, retained, and disclosed in accordance with the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Storage and retention</h2>
              <ul className="space-y-2 text-sm list-disc list-inside ml-2">
                <li>Match livestreams and highlights are kept on the Club&apos;s YouTube channel indefinitely as part of the Club&apos;s history record, subject to specific takedown requests.</li>
                <li>Practice photos and event photos are kept for as long as they have ongoing Club value (typically 5–10 years), then archived or deleted.</li>
                <li>Raw photo and video files are stored on Club-controlled cloud accounts. Access is limited to board members and authorized volunteers (typically the social-media coordinator, the YouTube channel manager, and the photographer of record for that event).</li>
                <li>Material featuring minors is reviewed annually and items no longer needed are deleted.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Members&apos; portal (C3H)</h2>
              <p className="text-sm">
                The Club&apos;s members&apos; portal (C3H) is gated by individual login and only accessible to verified Club members. Material visible inside C3H — match replays, training reflection cards, internal scorecards, individual performance reviews — is not &ldquo;public&rdquo; for the purposes of this Policy. By using C3H you consent to the same material flowing through the Club&apos;s authorized contractors who operate the platform on the Club&apos;s behalf, under written data-protection agreements. See the
                <Link href="/legal/ip-ownership" className="text-primary-400 hover:text-primary-300 underline mx-1">Software &amp; IP Ownership Acknowledgement</Link>
                for the platform-operator relationship.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Questions, complaints, takedown requests</h2>
              <p className="text-sm">
                Direct any questions about this Policy, complaints about specific items, or takedown requests to the Club at
                <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 underline mx-1">contact@challengerscc.ca</a>.
                We aim to respond to takedown requests within 14 days for material under our control. Disputes that cannot be resolved by direct correspondence may be escalated under the Club&apos;s Complaint &amp; Dispute Resolution Procedure (in development).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Consent &amp; signature</h2>
              <p className="text-sm mb-4">
                By signing below, I confirm that I have read this Photography &amp; Media Consent and that I have made my
                consent / opt-out choice. The Club will respect my choice in all future communications and materials.
              </p>
              <SignBlock />
            </section>

          </div>

          <div className="mt-8 text-xs text-gray-500 text-center">
            <p>Effective: 4 May 2026 · Version 1.0 · Pending lawyer review</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
