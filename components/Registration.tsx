"use client";

import { useState, FormEvent, useRef, useEffect } from 'react';
import { trackConversion } from '@/lib/gtag';
import {
  buildAdvice,
  T30_FIXTURES,
  weekendSharePct,
  weekendCodeFor,
  workPatternCodeFor,
  WEEKEND_OPTIONS,
  WORK_PATTERN_OPTIONS,
} from '@/lib/registrationAdvice';

/**
 * Google Form field mapping. Every input's `name` comes from here rather than
 * being written inline, so the whole mapping is auditable in one place.
 *
 * ⚠️ THE LAST THREE ARE NOT WIRED UP YET. The questions exist on this page and
 * drive the on-page recommendation, but the Google Form has no matching fields,
 * so their answers are NOT recorded. To capture them:
 *   1. Open the Google Form and add three questions (any order):
 *        "In 2027 you will be..."            (multiple choice)
 *        "Weekend availability"              (multiple choice)
 *        "Matches you can commit to (of 26)" (short answer)
 *   2. Preview the form, inspect each field, and copy its `entry.NNNNNN` name.
 *   3. Paste them below. Nothing else needs to change.
 * A blank id means the input renders with no `name`, so it is simply not
 * submitted — never silently posted to the wrong question.
 * See GOOGLE_FORMS_SETUP.md for the full walkthrough.
 */
const ENTRY_IDS = {
  name: 'entry.1407381676',
  email: 'entry.112847984',
  phone: 'entry.578432831',
  skillLevel: 'entry.980943308',
  willingToPlay: 'entry.1652603126',
  playingRole: 'entry.1089654944',
  jerseySize: 'entry.1146547898',
  jerseyType: 'entry.1555965869',
  trouserWaistSize: 'entry.1033675185',
  workPattern: '',
  weekendAvailability: '',
  gamesCommitted: '',
} as const;

/** Undefined (rather than "") so React omits the attribute entirely. */
const fieldName = (key: keyof typeof ENTRY_IDS): string | undefined =>
  ENTRY_IDS[key] || undefined;

/** A genuine person does not complete this form in under four seconds. */
const MIN_HUMAN_SECONDS = 4;

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skillLevel: '',
    willingToPlay: '',
    playingRole: '',
    workPattern: '',
    weekendAvailability: '',
    gamesCommitted: 13,
    jerseySize: '',
    jerseyType: '',
    trouserWaistSize: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // The form submits human-readable labels (they have to match the Google Form
  // choices exactly); the advice engine works in codes.
  const advice = buildAdvice({
    gamesCommitted: formData.gamesCommitted,
    weekendAvailability: weekendCodeFor(formData.weekendAvailability),
    workPattern: workPatternCodeFor(formData.workPattern),
  });

  // Google Form URL - just change this if you create a new form
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfVYSWAYY8wgl_KIjsNwENzf2w57xp4ZcMBWXLeXRkY7L4DxQ/formResponse";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Two client-side filters for automated submissions: a field no human can
    // see, and a floor on how fast the form can be completed. Both fail quietly
    // — a bot is shown the same success state, so it learns nothing.
    const tooFast =
      mountedAt.current > 0 &&
      (Date.now() - mountedAt.current) / 1000 < MIN_HUMAN_SECONDS;
    const looksAutomated = honeypot.trim().length > 0 || tooFast;

    if (!looksAutomated && formRef.current) {
      formRef.current.submit();
    }

    // Show success message after brief delay
    setTimeout(() => {
      if (!looksAutomated) {
        trackConversion('registration');
      }
      setSubmitMessage('success');
      setFormData({ name: '', email: '', phone: '', skillLevel: '', willingToPlay: '', playingRole: '', workPattern: '', weekendAvailability: '', gamesCommitted: 13, jerseySize: '', jerseyType: '', trouserWaistSize: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="registration" className="section-padding bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Legacy anchor — older links and emails point at #interest-section. */}
      <span id="interest-section" aria-hidden="true" />
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
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-4 border border-accent-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-400">2027 Registration Open</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Join <span className="gradient-text">Our Club</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Registration for the 2027 season is open. <span className="text-white font-semibold">$150 secures your place</span> — indoor winter nets, time with the squad before the season starts, and a spot in the queue for 2027 jerseys. The full-season option opens in March.
          </p>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto mt-3">
            Full fees, what is included and how selection works are on the{' '}
            <a href="/join" className="text-primary-400 hover:text-primary-300 underline">2027 season page</a>.
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
              Fill out the form below to register for the 2027 season. Share your details, cricket
              background and kit sizes, and we&apos;ll be in touch with how to pay your $150 and what
              happens next. New to the club or new to London? Say so — we&apos;ll get you into winter
              nets and introduce you to the group.
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
                  name={fieldName('name')}
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
                  name={fieldName('email')}
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
                  name={fieldName('phone')}
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
                  name={fieldName('skillLevel')}
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
                  name={fieldName('willingToPlay')}
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
                  name={fieldName('playingRole')}
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

              {/* ── Availability ──────────────────────────────────────────
                  Most of a season is decided here, not in the cricket answers
                  above: 30 of our 33 fixtures in 2026 fell on a weekend. */}
              <div className="pt-2 mt-2 border-t border-white/10">
                <h4 className="text-base font-bold text-white">Your 2027 availability</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {weekendSharePct()}% of our 2026 fixtures were on a Saturday or Sunday — the only
                  three that were not fell on public holidays. These answers matter more than
                  anything above.
                </p>
              </div>

              <div>
                <label htmlFor="workPattern" className="block text-sm font-medium text-gray-300 mb-2">
                  In 2027 you will be *
                </label>
                <select
                  id="workPattern"
                  name={fieldName('workPattern')}
                  required
                  value={formData.workPattern}
                  onChange={(e) => setFormData({ ...formData, workPattern: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select one</option>
                  {WORK_PATTERN_OPTIONS.map((o) => (
                    <option key={o.code} value={o.label} className="bg-gray-900 text-white">{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="weekendAvailability" className="block text-sm font-medium text-gray-300 mb-2">
                  Do you work weekends? *
                </label>
                <select
                  id="weekendAvailability"
                  name={fieldName('weekendAvailability')}
                  required
                  value={formData.weekendAvailability}
                  onChange={(e) => setFormData({ ...formData, weekendAvailability: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-white"
                >
                  <option value="" className="bg-gray-900 text-gray-400">Select one</option>
                  {WEEKEND_OPTIONS.map((o) => (
                    <option key={o.code} value={o.label} className="bg-gray-900 text-white">{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gamesCommitted" className="block text-sm font-medium text-gray-300 mb-2">
                  Matches you can genuinely commit to *
                </label>
                <input
                  type="range"
                  id="gamesCommitted"
                  min={0}
                  max={T30_FIXTURES}
                  value={formData.gamesCommitted}
                  onChange={(e) => setFormData({ ...formData, gamesCommitted: Number(e.target.value) })}
                  className="w-full accent-primary-500 cursor-pointer"
                  aria-describedby="registration-advice"
                />
                <input type="hidden" name={fieldName('gamesCommitted')} value={formData.gamesCommitted} />
                <div className="flex justify-between text-[11px] text-gray-500 font-mono mt-1">
                  <span>0</span><span>13 · half a season</span><span>{T30_FIXTURES}</span>
                </div>
              </div>

              {/* Rule-based guidance — lib/registrationAdvice.ts */}
              <div
                id="registration-advice"
                aria-live="polite"
                className={`rounded-xl border p-5 ${
                  advice.tier === 'full'
                    ? 'bg-primary-500/10 border-primary-500/40'
                    : 'bg-white/5 border-white/15'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  What we would recommend
                </p>
                <p className={`mt-2 text-lg font-bold ${advice.tier === 'full' ? 'text-primary-400' : 'text-gray-200'}`}>
                  {advice.headline}
                </p>
                <p className="text-sm text-gray-400 mt-2">{advice.body}</p>
                <p className="text-sm text-gray-500 mt-2">{advice.playoff}</p>
                {advice.caution && (
                  <p className="text-sm text-accent-400/90 mt-3 pt-3 border-t border-white/10">
                    {advice.caution}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="jerseySize" className="block text-sm font-medium text-gray-300 mb-2">
                  Jersey Size (Optional)
                </label>
                <select
                  id="jerseySize"
                  name={fieldName('jerseySize')}
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
                  name={fieldName('jerseyType')}
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
                  name={fieldName('trouserWaistSize')}
                  value={formData.trouserWaistSize}
                  onChange={(e) => setFormData({ ...formData, trouserWaistSize: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="e.g., 32, 34, 36 (optional)"
                />
              </div>

              {/* Not visible to a person, not announced to a screen reader, and
                  impossible to tab into — anything in here came from a script. */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
              >
                <label htmlFor="website-url">Leave this field empty</label>
                <input
                  type="text"
                  id="website-url"
                  name="website-url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  What happens after you submit
                </p>
                <ol className="space-y-3">
                  {[
                    ['1', 'We read your form', 'A person, not an autoresponder. If anything looks unclear we will just ask.'],
                    ['2', `Pay your $${advice.feeNow} registration`, 'We send you the payment details. Your place is held once it clears.'],
                    ['3', 'You are added to the WhatsApp group', 'This happens after payment — it is where nets, fixtures and selection are organised.'],
                    ['4', 'Winter nets start', 'You are in the squad from that point, not from the first match in May.'],
                  ].map(([n, title, detail]) => (
                    <li key={n} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-400 text-xs font-bold flex items-center justify-center">
                        {n}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-gray-200">{title}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">{detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
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
                  <p className="text-sm text-center mb-2">
                    <strong>Thank you for registering.</strong> We&apos;ll be in touch with how to pay
                    your $150 — and once that clears we&apos;ll add you to the club WhatsApp group,
                    where nets and fixtures get organised.
                  </p>
                  <p className="text-xs text-center text-gray-400 mb-4">
                    Not heard from us within 48 hours? Email{' '}
                    <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300 underline">contact@challengerscc.ca</a>.
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-gray-300">Follow us for updates, match results, and events!</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <a
                        href="https://www.instagram.com/challengers.cc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-semibold shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                        </svg>
                        Instagram
                      </a>
                      <a
                        href="https://www.facebook.com/share/1Fk4YXFpoN/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-semibold shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                      <a
                        href="https://www.youtube.com/@Challengersccldn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Social Media CTA */}
        <div className="mt-12 text-center">
          <div className="glass rounded-2xl p-6 max-w-lg mx-auto border border-white/10 hover:border-primary-500/30 transition-all duration-300">
            <p className="text-gray-300 mb-4">Stay connected with us for the latest updates, match highlights, and club news!</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.instagram.com/challengers.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-semibold shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://www.facebook.com/share/1Fk4YXFpoN/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-semibold shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a
                href="https://www.youtube.com/@Challengersccldn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-semibold shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            Questions about registration? <a href="#contact" className="text-primary-400 hover:text-primary-300 underline">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
