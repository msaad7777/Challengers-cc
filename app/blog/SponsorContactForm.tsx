"use client";

import { useState } from 'react';

interface SponsorContactFormProps {
  sponsorName: string;
  sponsorEmail: string;
  sponsorTitle: string;
}

export default function SponsorContactForm({ sponsorName, sponsorEmail, sponsorTitle }: SponsorContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const subject = encodeURIComponent(`Inquiry for ${sponsorName} — Referred by Challengers Cricket Club`);
    const body = encodeURIComponent(
      `Hi ${sponsorName},\n\n` +
      `I found you through Challengers Cricket Club's website and would like to connect.\n\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n\n` +
      `Message:\n${formData.message}\n\n` +
      `---\n` +
      `Referred by: Challengers Cricket Club (challengerscc.ca)\n` +
      `${sponsorName} is a ${sponsorTitle} of Challengers Cricket Club`
    );

    // Open mailto with pre-filled content — sends to sponsor + CC to club
    window.location.href = `mailto:${sponsorEmail}?cc=contact@challengerscc.ca&subject=${subject}&body=${body}`;

    setTimeout(() => {
      setStatus('sent');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1000);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(234,179,8,0.08))',
      border: '1px solid rgba(16,185,129,0.3)',
      borderRadius: '16px',
      padding: '32px',
      margin: '24px 0',
    }}>
      <h3 className="text-2xl font-bold text-white mb-2 text-center">
        Contact {sponsorName}
      </h3>
      <p className="text-gray-400 text-center mb-2 text-sm">
        Referred by Challengers Cricket Club
      </p>
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent flex-1 max-w-[100px]"></div>
        <span className="text-primary-400 text-xs font-medium px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
          {sponsorTitle}
        </span>
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent flex-1 max-w-[100px]"></div>
      </div>

      {status === 'sent' ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">&#9989;</div>
          <h4 className="text-xl font-bold text-white mb-2">Opening your email client!</h4>
          <p className="text-gray-400">
            Your message to {sponsorName} has been prepared with Challengers Cricket Club referral included.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white placeholder-gray-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Your Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white placeholder-gray-500"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white placeholder-gray-500"
              placeholder="(519) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Message *</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white placeholder-gray-500 resize-none"
              placeholder="I'm interested in buying/selling property in London..."
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-white shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === 'sending' ? 'Preparing...' : `Send Message to ${sponsorName}`}
          </button>
          <p className="text-gray-500 text-xs text-center">
            This will open your email client with the message pre-filled. A copy will be sent to Challengers Cricket Club so we can track referrals for our sponsors.
          </p>
        </form>
      )}
    </div>
  );
}
