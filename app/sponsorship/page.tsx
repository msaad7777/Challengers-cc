"use client";

import { useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SponsorshipPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    sponsorshipLevel: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSeER8z1nKUCUfuRZdIUDEQ0qvHIvp-XtwufQHALyt3hWUBtVA/formResponse";
  const ENTRY_IDS = {
    organizationName: "entry.1917539462",
    contactName: "entry.2112366391",
    email: "entry.1606284375",
    phone: "entry.1557446055",
    sponsorshipLevel: "entry.861380879",
    message: "entry.1857964256"
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formBody = new URLSearchParams();
      formBody.append(ENTRY_IDS.organizationName, formData.organizationName);
      formBody.append(ENTRY_IDS.contactName, formData.contactName);
      formBody.append(ENTRY_IDS.email, formData.email);
      formBody.append(ENTRY_IDS.phone, formData.phone);
      formBody.append(ENTRY_IDS.sponsorshipLevel, formData.sponsorshipLevel);
      formBody.append(ENTRY_IDS.message, formData.message);

      await fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      setSubmitMessage('Thank you for your interest! We\'ll be in touch soon to discuss partnership opportunities.');
      setFormData({ organizationName: '', contactName: '', email: '', phone: '', sponsorshipLevel: '', message: '' });
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try emailing us directly at contact@challengerscc.ca');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sponsorshipTiers = [
    {
      name: "Title Sponsor",
      price: "$3,000",
      subtitle: "Only 1 Available",
      color: "from-accent-600 to-accent-500",
      icon: "🏆",
      benefits: [
        "Exclusive naming rights for the 2026 season",
        "Example: \"Challengers Cricket Club powered by <Your Business>\"",
        "Largest logo placement on all player jerseys (front center)",
        "Primary branding on all social media posters & announcements",
        "Top-tier visibility at matches, events, tryouts & camps",
        "Homepage logo placement on challengerscc.ca (premium size)",
        "Special acknowledgment in all club press releases & promotions",
        "Sponsor representative shout-out at season opening event",
        "Free stall/table at any club events or tournaments",
        "Priority access for any future partnership expansions"
      ]
    },
    {
      name: "Platinum Sponsor",
      price: "$1,000",
      subtitle: "Ideal for growing businesses",
      color: "from-primary-600 to-primary-500",
      icon: "🥇",
      benefits: [
        "Logo on all player jerseys (sleeve placement – medium size)",
        "Secondary branding on social media match posts",
        "Logo placement on challengerscc.ca (standard size)",
        "Brand shout-out in club communications",
        "Invited to meet players/team at select practice sessions",
        "Acknowledged at home matches"
      ]
    },
    {
      name: "Gold Sponsor",
      price: "$500",
      subtitle: "Perfect for small & medium businesses",
      color: "from-primary-500 to-accent-500",
      icon: "🥈",
      benefits: [
        "Logo on practice kits (smaller size)",
        "Branding on select social media posts",
        "Logo placement on challengerscc.ca (supporting section)",
        "Acknowledgment in seasonal club email/newsletter",
        "Invitation to club community events"
      ]
    },
    {
      name: "Community Partner",
      price: "Any Amount / In-Kind",
      subtitle: "Local shops, restaurants, or individuals",
      color: "from-gray-600 to-gray-500",
      icon: "🤝",
      benefits: [
        "Store credit, discounts, gift cards, equipment donations",
        "Membership perks for athletes",
        "Logo on challengerscc.ca",
        "Social media recognition",
        "Mention at community events",
        "Helping grow youth & adult cricket in London, Ontario"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 md:pt-40 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
              <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-sm text-gray-300">Partnership Opportunities</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Sponsor <span className="gradient-text">Challengers Cricket Club</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Support local cricket & grow your brand in London, Ontario
            </p>

            <div className="max-w-3xl mx-auto glass rounded-2xl p-6 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Est. 2025</div>
                  <div className="text-sm text-gray-400">Now Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Non-Profit</div>
                  <div className="text-sm text-gray-400">Ontario Corporation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">Inclusive</div>
                  <div className="text-sm text-gray-400">All Welcome</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sponsor Section */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why <span className="gradient-text">Sponsor Us?</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Community Impact</h3>
              <p className="text-sm text-gray-400">Support cricket development and community engagement in London, Ontario</p>
            </div>

            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Brand Visibility</h3>
              <p className="text-sm text-gray-400">High exposure across matches, events, social media, and digital platforms</p>
            </div>

            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Tax Benefits</h3>
              <p className="text-sm text-gray-400">Registered Ontario non-profit corporation - tax receipts available</p>
            </div>

            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Ground Floor</h3>
              <p className="text-sm text-gray-400">Be a founding sponsor of London&apos;s premier cricket club from day one</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="section-padding bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Sponsorship <span className="gradient-text">Packages</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the partnership level that fits your organization
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sponsorshipTiers.map((tier, index) => (
              <div key={index} className="glass rounded-2xl p-8 border-2 border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{tier.subtitle}</p>
                    <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${tier.color} text-sm font-semibold`}>
                      {tier.price}
                    </div>
                  </div>
                  <div className="text-4xl ml-4">
                    {tier.icon}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#sponsorship-form"
                  className="block w-full py-3 glass glass-hover rounded-lg font-semibold text-center text-sm group-hover:bg-white/10 transition-all duration-300"
                >
                  <span className="gradient-text">{index === 0 ? 'Express Interest' : 'Contact Us'}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Payment <span className="gradient-text">Options</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Choose the payment method that works best for you
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Online Payment */}
            <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 hover:border-primary-500/50 transition-all relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary-500/20 text-primary-400 text-xs font-bold px-3 py-1 rounded-full">
                AVAILABLE NOW
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Online Payment</h3>
              <p className="text-sm text-gray-400 mb-4">
                Secure online payments via credit card or debit card
              </p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Instant confirmation
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Secure encrypted payment
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tax receipt via email
                </li>
              </ul>
              <a
                href="/payments"
                className="block w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-center shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                Pay Online Now
              </a>
            </div>

            {/* Cheque Payment */}
            <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Cheque</h3>
              <p className="text-sm text-gray-400 mb-4">
                Make cheque payable to:
              </p>
              <div className="bg-black/30 rounded-lg p-4 mb-4 border border-primary-500/20">
                <p className="font-mono text-sm text-primary-400 font-semibold">
                  Challengers Cricket Club
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Mail to the address provided after form submission, or hand deliver at our events.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tax receipt provided
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmation via email
                </li>
              </ul>
            </div>

            {/* Cash Payment */}
            <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 hover:border-primary-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Cash (In-Person)</h3>
              <p className="text-sm text-gray-400 mb-4">
                Pay in person at our events or by appointment
              </p>
              <div className="bg-black/30 rounded-lg p-4 mb-4 border border-accent-500/20">
                <p className="text-sm text-accent-400 font-semibold">
                  Contact us to arrange payment
                </p>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Immediate receipt
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tax receipt provided
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Meet the team
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="glass rounded-xl p-6 border border-primary-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-primary-400">Tax Receipts Available</h4>
                  <p className="text-sm text-gray-400">
                    As a registered Ontario non-profit corporation, we can provide official tax receipts for all sponsorship contributions.
                    Receipts will be issued via email within 2 business days of payment confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Form */}
      <section id="sponsorship-form" className="section-padding bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Get <span className="gradient-text">Started</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Fill out the form below and we&apos;ll be in touch to discuss partnership opportunities
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
          </div>

          <div className="glass rounded-2xl p-8 md:p-12 border-2 border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
                    Organization/Business Name *
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="(519) 555-0123"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sponsorshipLevel" className="block text-sm font-medium text-gray-300 mb-2">
                  Interested Sponsorship Level *
                </label>
                <select
                  id="sponsorshipLevel"
                  required
                  value={formData.sponsorshipLevel}
                  onChange={(e) => setFormData({ ...formData, sponsorshipLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select a level</option>
                  <option value="Title Sponsor - $3,000" className="bg-gray-900 text-white">🏆 Title Sponsor - $3,000</option>
                  <option value="Platinum Sponsor - $1,000" className="bg-gray-900 text-white">🥇 Platinum Sponsor - $1,000</option>
                  <option value="Gold Sponsor - $500" className="bg-gray-900 text-white">🥈 Gold Sponsor - $500</option>
                  <option value="Community Partner - Any Amount/In-Kind" className="bg-gray-900 text-white">🤝 Community Partner - Any Amount/In-Kind</option>
                  <option value="Custom Package" className="bg-gray-900 text-white">💼 Custom Package</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message / Additional Information
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                  placeholder="Tell us about your organization and sponsorship goals..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-lg shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Sponsorship Inquiry'}
              </button>

              {submitMessage && (
                <div className={`p-4 rounded-lg ${submitMessage.includes('Thank you') ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <p className="text-sm text-center">{submitMessage}</p>
                </div>
              )}
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm mb-2">Or contact us directly:</p>
              <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 font-semibold">
                contact@challengerscc.ca
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
