"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VerifiedBanner from '@/components/VerifiedBanner';

const STRIPE_DONATION_LINK = 'https://donate.stripe.com/00w3cwaPAdAwdmT08j9R600';
const ZEFFY_DONATION_LINK = 'https://www.zeffy.com/en-CA/donation-form/challengers-cricket-building-community-through-sport';

const PAYMENT_OPTIONS = [
  { name: 'Club Registration', description: '2026 Season membership (includes indoor & outdoor practice)', price: '$100', icon: '🏏' },
  { name: 'LCL + LPL League Fee', description: 'London Cricket League & London Premier League combined', price: '$200', icon: '⚡' },
];

const SPONSORSHIP_TIERS = [
  { name: 'Title Sponsor (Only 1 Available)', price: '$3,000', icon: '🏆' },
  { name: 'Platinum Sponsor', price: '$1,000', icon: '🥇' },
  { name: 'Gold Sponsor', price: '$500', icon: '🥈' },
  { name: 'Community Partner', price: 'Any Amount', icon: '🤝' },
];

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
              <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm text-gray-300">Secure Payments</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Club <span className="gradient-text">Payments</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Pay for registration, practice sessions, league fees, and sponsorships securely online
            </p>

            <div className="max-w-3xl mx-auto glass rounded-2xl p-6 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Secure</div>
                  <div className="text-sm text-gray-400">Powered by Stripe</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Instant</div>
                  <div className="text-sm text-gray-400">Receipt Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">NFP</div>
                  <div className="text-sm text-gray-400">Registered Non-Profit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VerifiedBanner />

      {/* Payment Options */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          {/* Player Fees */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
              Player <span className="gradient-text">Fees</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PAYMENT_OPTIONS.map((option) => (
                <div key={option.name} className="glass rounded-xl p-6 border-2 border-white/10">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{option.name}</h3>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                    <div className="text-lg font-bold gradient-text">{option.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsorship Tiers */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              Sponsorship <span className="gradient-text">Tiers</span>
            </h2>
            <p className="text-center text-gray-400 mb-8">
              Support the club as a sponsor. View full benefits on our{' '}
              <a href="/sponsorship" className="text-primary-400 hover:text-primary-300 underline">sponsorship page</a>.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SPONSORSHIP_TIERS.map((tier) => (
                <div key={tier.name} className="glass rounded-xl p-6 border-2 border-accent-500/20 text-center">
                  <span className="text-3xl block mb-3">{tier.icon}</span>
                  <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
                  <div className="text-xl font-bold text-accent-400">{tier.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 max-w-xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">Ready to Pay?</h3>
              <p className="text-gray-400 mb-6">
                Your support helps us cover league registration, field rent, field insurance, unemployed members, equipment, and programs. Thank you for being a part of our community!
              </p>
              <div className="space-y-3">
                <a
                  href={ZEFFY_DONATION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  Pay via Zeffy (0% Fees)
                </a>
                <a
                  href={STRIPE_DONATION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3 glass glass-hover rounded-lg font-semibold text-sm border border-white/10 hover:border-primary-500/50 transition-all duration-300 text-center"
                >
                  Pay via Stripe (Credit/Debit Card)
                </a>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Zeffy: 100% goes to the club | Stripe: 2.2% + $0.30 fee applies
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  <strong>Challengers Cricket Club</strong><br />
                  Ontario NFP Corporation #1746974-8<br />
                  contact@challengerscc.ca
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                <span className="text-2xl font-bold gradient-text">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Your Payment</h3>
              <p className="text-sm text-gray-400">Review the options above and note your amount</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                <span className="text-2xl font-bold gradient-text">2</span>
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-400">Enter your amount and pay securely via Stripe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary-500/30">
                <span className="text-2xl font-bold gradient-text">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Receipt</h3>
              <p className="text-sm text-gray-400">Instant receipt with club details for your records</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">Is my payment secure?</h3>
              <p className="text-sm text-gray-400">Yes, all payments are processed through Stripe, a PCI-compliant payment processor used by millions of businesses worldwide.</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">Will I receive a receipt?</h3>
              <p className="text-sm text-gray-400">Yes, you will receive an email receipt from Stripe immediately after payment.</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
              <p className="text-sm text-gray-400">We accept all major credit and debit cards, Apple Pay, Klarna, and Link.</p>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-2">How do I know the correct amount for practice/league fees?</h3>
              <p className="text-sm text-gray-400">Fee amounts are shared by club management via WhatsApp group. If you&apos;re unsure, please contact us at contact@challengerscc.ca before paying.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
