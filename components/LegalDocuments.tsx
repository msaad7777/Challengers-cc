"use client";

import { useState } from 'react';

export default function LegalDocuments() {
  const [requestingDoc, setRequestingDoc] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Document requests are routed by mailto: directly to the Club's
  // Workspace inbox. This is more reliable than third-party form
  // services (which can silently break) and ensures the requester
  // and the Club both have a permanent email record.
  const CLUB_INBOX = 'contact@challengerscc.ca';

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const subject = `Document Request — ${requestingDoc || 'Unspecified Document'}`;
      const body = [
        `Hello Challengers Cricket Club,`,
        ``,
        `I would like to request a copy of the following document:`,
        ``,
        `Document: ${requestingDoc || 'Unspecified'}`,
        ``,
        `Requester details:`,
        `  Name: ${formData.name}`,
        `  Email: ${formData.email}`,
        ``,
        `Reason for the request:`,
        `${formData.reason}`,
        ``,
        `Thank you,`,
        `${formData.name}`,
      ].join('\n');

      const mailtoLink = `mailto:${CLUB_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // Open the user's default email client. They review + send the
      // pre-filled email; the request lands directly in the Club's
      // contact@challengerscc.ca inbox.
      window.location.href = mailtoLink;

      setSubmitMessage('Your email client has opened with a pre-filled request. Please review and send the email to complete your request. We will reply within 1–2 business days.');
      setFormData({ name: '', email: '', reason: '' });
      setTimeout(() => {
        setRequestingDoc(null);
        setSubmitMessage('');
      }, 8000);
    } catch {
      setSubmitMessage(`Could not open your email client. Please email us directly at ${CLUB_INBOX} with your name, the document name, and the reason for your request.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documents = [
    {
      title: "Certificate of Incorporation",
      description: "Official Canada Not-for-Profit Corporation registration (1746974-8) under CNCA",
      icon: "📜",
      tag: "Legal",
      requestable: true,
    },
    {
      title: "Constitution & By-Laws",
      description: "Federal CNCA Constitution and By-Laws — published openly for transparency",
      icon: "⚖️",
      tag: "Governance",
      requestable: false,
      viewUrl: "/legal/bylaws",
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect personal information (PIPEDA-aligned)",
      icon: "🔒",
      tag: "Policy",
      requestable: false,
      viewUrl: "/legal/privacy",
    },
    {
      title: "Code of Conduct",
      description: "Standards of behaviour for players, officers, and volunteers",
      icon: "🤝",
      tag: "Policy",
      requestable: false,
      viewUrl: "/legal/code-of-conduct",
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Legal <span className="gradient-text">Documents</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transparency and accountability as a federally-registered Not-for-Profit Corporation
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Registration Badge */}
        <div className="mb-12 flex justify-center">
          <div className="glass rounded-2xl p-6 border-2 border-primary-500/30 inline-flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border-2 border-primary-500/30">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-400">Verified Organization</div>
              <div className="text-lg font-bold gradient-text">Registered Canada Not-for-Profit Corporation</div>
              <div className="text-xs text-gray-500">Corporation Number: 1746974-8</div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {documents.map((doc, index) => (
            <div
              key={index}
              className={`glass rounded-2xl p-6 border-2 transition-all duration-300 ${
                doc.requestable
                  ? 'border-primary-500/30 hover:border-primary-500/50'
                  : 'border-white/10 opacity-75'
              }`}
            >
              {/* Icon and Tag */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{doc.icon}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.requestable
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {doc.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{doc.description}</p>

              {/* Request / View / Coming Soon Button */}
              {doc.requestable ? (
                <button
                  onClick={() => setRequestingDoc(doc.title)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-sm hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Request Document
                </button>
              ) : doc.viewUrl ? (
                <a
                  href={doc.viewUrl}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-sm hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Document
                </a>
              ) : (
                <div className="w-full py-3 glass rounded-lg text-center text-sm text-gray-500">
                  Coming Soon
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Request Modal */}
        {requestingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass rounded-2xl p-8 border-2 border-primary-500/30 max-w-md w-full relative">
              <button
                onClick={() => { setRequestingDoc(null); setSubmitMessage(''); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Request: <span className="gradient-text">{requestingDoc}</span></h3>
                <p className="text-sm text-gray-400 mb-2">
                  Please complete the form below. When you click <strong className="text-white">Send Request</strong>,
                  your default email client will open with a pre-filled email addressed to{' '}
                  <code className="text-primary-400">contact@challengerscc.ca</code>. Review the email and click
                  Send to complete your request.
                </p>
                <p className="text-xs text-gray-500">
                  Public documents (Bylaws, Privacy Policy, Code of Conduct, Financial Policy) are also viewable
                  directly without a request. The Certificate of Incorporation can also be retrieved from{' '}
                  <a href="https://www.ic.gc.ca/app/scr/cc/CorporationsCanada/fdrlCrpSrch.html" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">Corporations Canada</a>{' '}
                  by searching corporation #1746974-8.
                </p>
              </div>

              {submitMessage ? (
                <div className={`p-4 rounded-lg ${submitMessage.includes('submitted') ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <p className="text-sm text-center">{submitMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="space-y-4">
                  <div>
                    <label htmlFor="req-name" className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      id="req-name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="req-email" className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="req-email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="req-reason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Request *</label>
                    <textarea
                      id="req-reason"
                      required
                      rows={3}
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                      placeholder="e.g., Sponsorship due diligence, grant application, membership verification..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Opening email client…'
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Request via Email
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center -mt-2">
                    Or email us directly at{' '}
                    <a href={`mailto:${CLUB_INBOX}`} className="text-primary-400 hover:text-primary-300 underline">{CLUB_INBOX}</a>
                  </p>
                </form>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                Documents are shared upon verification to protect organizational privacy.
                For urgent requests, email <a href="mailto:contact@challengerscc.ca" className="text-primary-400 hover:text-primary-300">contact@challengerscc.ca</a>
              </p>
            </div>
          </div>
        )}

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <div className="glass rounded-xl p-6 max-w-3xl mx-auto border border-primary-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold mb-2 text-primary-400">Transparency & Accountability</h4>
                <p className="text-sm text-gray-400">
                  As a registered non-profit corporation in Ontario, we operate with full transparency. Legal documents
                  are available upon request to ensure accountability to our members, sponsors, and the community.
                  Requests are verified to protect organizational privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
