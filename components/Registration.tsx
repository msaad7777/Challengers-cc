"use client";

import { useState, FormEvent, useRef } from 'react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Google Form URL - just change this if you create a new form
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfVYSWAYY8wgl_KIjsNwENzf2w57xp4ZcMBWXLeXRkY7L4DxQ/formResponse";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Submit the form to iframe
    if (formRef.current) {
      formRef.current.submit();
    }

    // Show success message after brief delay
    setTimeout(() => {
      setSubmitMessage('success');
      setFormData({ name: '', email: '', phone: '', skillLevel: '', willingToPlay: '', playingRole: '', jerseySize: '', jerseyType: '', trouserWaistSize: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="interest-section" className="section-padding bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Hidden iframe for form submission */}
      <iframe
        ref={iframeRef}
        name="hidden_iframe"
        id="hidden_iframe"
        style={{ display: 'none' }}
        onLoad={() => {
          if (isSubmitting) {
            setIsSubmitting(false);
          }
        }}
      />

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

            <form
              ref={formRef}
              action={GOOGLE_FORM_URL}
              method="POST"
              target="hidden_iframe"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="entry.1407381676"
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
                  name="entry.112847984"
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
                  name="entry.578432831"
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
                  name="entry.980943308"
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
                  name="entry.1652603126"
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
                  name="entry.1089654944"
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
                  name="entry.1146547898"
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
                  name="entry.1555965869"
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
                  name="entry.1033675185"
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

              {submitMessage === 'success' && (
                <div className="p-6 rounded-lg bg-primary-500/20 border border-primary-500/30">
                  <p className="text-sm text-center mb-4">
                    Thank you for registering! We&apos;ll add you to our official WhatsApp group soon. If you&apos;re not added within 48 hours, please email us at contact@challengerscc.ca
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-gray-300">Follow us on Instagram for updates, match results, and events!</p>
                    <a
                      href="https://www.instagram.com/challengers.cc/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-semibold shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                      </svg>
                      Follow @challengers.cc
                    </a>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Instagram CTA */}
        <div className="mt-12 text-center">
          <div className="glass rounded-2xl p-6 max-w-md mx-auto border border-white/10 hover:border-pink-500/30 transition-all duration-300">
            <p className="text-gray-300 mb-4">Stay connected with us on Instagram for the latest updates, match highlights, and club news!</p>
            <a
              href="https://www.instagram.com/challengers.cc/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-semibold shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
              </svg>
              Follow @challengers.cc
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            Questions about registration? <a href="#contact" className="text-primary-400 hover:text-primary-300 underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
