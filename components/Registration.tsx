"use client";

import { useState, FormEvent } from 'react';

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skillLevel: '',
    willingToPlay: '',
    playingRole: '',
    jerseySize: '',
    jerseyType: '',
    trouserWaistSize: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSfVYSWAYY8wgl_KIjsNwENzf2w57xp4ZcMBWXLeXRkY7L4DxQ/formResponse";
  const ENTRY_IDS = {
    name: "entry.1407381676",
    email: "entry.1934782175",
    phone: "entry.578432831",
    skillLevel: "entry.980943308",
    willingToPlay: "entry.1652603126",
    playingRole: "entry.1089654944",
    jerseySize: "entry.1146547898",
    jerseyType: "entry.1555965869",
    trouserWaistSize: "entry.1033675185"
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formBody = new URLSearchParams();
      formBody.append(ENTRY_IDS.name, formData.name);
      formBody.append(ENTRY_IDS.email, formData.email);
      formBody.append(ENTRY_IDS.phone, formData.phone);
      formBody.append(ENTRY_IDS.skillLevel, formData.skillLevel);
      formBody.append(ENTRY_IDS.willingToPlay, formData.willingToPlay);
      formBody.append(ENTRY_IDS.playingRole, formData.playingRole);
      formBody.append(ENTRY_IDS.jerseySize, formData.jerseySize);
      formBody.append(ENTRY_IDS.jerseyType, formData.jerseyType);
      formBody.append(ENTRY_IDS.trouserWaistSize, formData.trouserWaistSize);

      await fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      setSubmitMessage('Thank you! We\'ll be in touch soon.');
      setFormData({ name: '', email: '', phone: '', skillLevel: '', willingToPlay: '', playingRole: '', jerseySize: '', jerseyType: '', trouserWaistSize: '' });
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="interest-section" className="section-padding bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Join <span className="gradient-text">Our Club</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Become part of London&apos;s united cricket community. Fill out the form below to join us.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 hover:border-primary-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Join Our Club</h3>
                <p className="text-sm text-gray-400">Registration Form</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Fill out the form below to join Challengers Cricket Club. Share your details,
              cricket background, and preferences. We&apos;ll be in touch soon!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  placeholder="John Doe"
                />
              </div>

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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  placeholder="john@example.com"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  placeholder="(519) 555-0123"
                />
              </div>

              <div>
                <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level *
                </label>
                <select
                  id="skillLevel"
                  required
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select your level</option>
                  <option value="Beginner" className="bg-gray-900 text-white">Beginner</option>
                  <option value="Intermediate" className="bg-gray-900 text-white">Intermediate</option>
                  <option value="Advanced" className="bg-gray-900 text-white">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="willingToPlay" className="block text-sm font-medium text-gray-300 mb-2">
                  Willing to Play *
                </label>
                <select
                  id="willingToPlay"
                  required
                  value={formData.willingToPlay}
                  onChange={(e) => setFormData({ ...formData, willingToPlay: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select format</option>
                  <option value="T30" className="bg-gray-900 text-white">T30</option>
                  <option value="T20" className="bg-gray-900 text-white">T20</option>
                  <option value="Both" className="bg-gray-900 text-white">Both</option>
                </select>
              </div>

              <div>
                <label htmlFor="playingRole" className="block text-sm font-medium text-gray-300 mb-2">
                  Playing Role *
                </label>
                <select
                  id="playingRole"
                  required
                  value={formData.playingRole}
                  onChange={(e) => setFormData({ ...formData, playingRole: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select your role</option>
                  <option value="Batsman" className="bg-gray-900 text-white">Batsman</option>
                  <option value="Bowler" className="bg-gray-900 text-white">Bowler</option>
                  <option value="Wicket Keeper" className="bg-gray-900 text-white">Wicket Keeper</option>
                  <option value="All Rounder" className="bg-gray-900 text-white">All Rounder</option>
                </select>
              </div>

              <div>
                <label htmlFor="jerseySize" className="block text-sm font-medium text-gray-300 mb-2">
                  Jersey Size (Optional)
                </label>
                <select
                  id="jerseySize"
                  value={formData.jerseySize}
                  onChange={(e) => setFormData({ ...formData, jerseySize: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select jersey size (optional)</option>
                  <option value="XS" className="bg-gray-900 text-white">XS</option>
                  <option value="S" className="bg-gray-900 text-white">S</option>
                  <option value="M" className="bg-gray-900 text-white">M</option>
                  <option value="L" className="bg-gray-900 text-white">L</option>
                  <option value="XL" className="bg-gray-900 text-white">XL</option>
                  <option value="XXL" className="bg-gray-900 text-white">XXL</option>
                  <option value="XXXL" className="bg-gray-900 text-white">XXXL</option>
                </select>
              </div>

              <div>
                <label htmlFor="jerseyType" className="block text-sm font-medium text-gray-300 mb-2">
                  Jersey Type (Optional)
                </label>
                <select
                  id="jerseyType"
                  value={formData.jerseyType}
                  onChange={(e) => setFormData({ ...formData, jerseyType: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select jersey type (optional)</option>
                  <option value="Full Sleeve" className="bg-gray-900 text-white">Full Sleeve</option>
                  <option value="Half Sleeve" className="bg-gray-900 text-white">Half Sleeve</option>
                  <option value="Both (1 each)" className="bg-gray-900 text-white">Both (1 each)</option>
                </select>
              </div>

              <div>
                <label htmlFor="trouserWaistSize" className="block text-sm font-medium text-gray-300 mb-2">
                  Trouser Waist Size (Optional)
                </label>
                <input
                  type="text"
                  id="trouserWaistSize"
                  value={formData.trouserWaistSize}
                  onChange={(e) => setFormData({ ...formData, trouserWaistSize: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="e.g., 32, 34, 36 (optional)"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Submitting...' : 'Join Our Club'}
              </button>

              {submitMessage && (
                <div className={`p-4 rounded-lg ${submitMessage.includes('Thank you') ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <p className="text-sm text-center">{submitMessage}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Questions about registration? <a href="#contact" className="text-primary-400 hover:text-primary-300 underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
