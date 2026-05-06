import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LegalDocsGrid from './LegalDocsGrid';

export const metadata = {
  title: 'Governance & Legal — Challengers Cricket Club',
  description: 'Volunteer Agreement, Liability Waiver, Privacy Policy, Code of Conduct, and other governance documents for Challengers Cricket Club.',
};

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border border-primary-500/20">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="text-xs uppercase tracking-wider text-primary-400 font-semibold">Governance &amp; Legal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Governance &amp; <span className="gradient-text">Legal</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Challengers Cricket Club is a Not-for-Profit Corporation (#1746974-8), entirely volunteer-run, with no paid staff or contractors. These documents codify how we operate.
            </p>
          </div>

          {/* Honest disclaimer */}
          <div className="rounded-2xl p-5 mb-10 border-2 border-accent-500/30 bg-accent-500/5">
            <p className="text-sm text-gray-200 leading-relaxed">
              <strong className="text-accent-400">A note on these documents:</strong> They are starter drafts prepared in good faith
              by the club&apos;s volunteer board. They have <strong>not yet been reviewed by a lawyer</strong>.
              We are pursuing pro-bono review through Pro Bono Ontario and the Ontario Nonprofit Network in 2026.
              Until then, these documents reflect our intent and operating practice — they are not legal advice
              and should not be relied on as such by anyone outside the club.
            </p>
          </div>

          {/* Founding facts */}
          <div className="glass rounded-2xl p-6 mb-10 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-3">About the Organization</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Legal name:</strong> Challengers Cricket Club</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Corporate type:</strong> Not-for-Profit Corporation</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Corporation Number:</strong> 1746974-8</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Date of incorporation:</strong> November 2025</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Registered office:</strong> London, Ontario, Canada</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Operations:</strong> 100% volunteer-run. No employees, no paid staff, no paid contractors.</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Funding:</strong> member contributions, voluntary sponsorships, in-kind support. Surplus reinvested in club operations only.</span></li>
              <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">CRA charity status:</strong> not yet registered. Application planned for 2026-2027.</span></li>
            </ul>
          </div>

          <LegalDocsGrid />

          <div className="mt-10 text-center text-xs text-gray-500">
            <p>Questions about governance? Contact the board at{' '}
              <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 underline break-all">contact@challengerscc.ca</a>
            </p>
            <p className="mt-1">Last updated: 6 May 2026</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
