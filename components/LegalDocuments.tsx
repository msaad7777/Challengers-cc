export default function LegalDocuments() {
  const documents = [
    {
      title: "Certificate of Incorporation",
      description: "Official Ontario NFP Corporation registration (1746974-8)",
      icon: "📜",
      fileUrl: "/documents/CCC-COI.pdf", // Upload your PDF here
      available: false, // Set to true once PDF is uploaded
      tag: "Legal"
    },
    {
      title: "Club Bylaws",
      description: "Organizational structure and governance rules",
      icon: "⚖️",
      fileUrl: "/documents/bylaws.pdf",
      available: false,
      tag: "Governance"
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your information",
      icon: "🔒",
      fileUrl: "/documents/privacy-policy.pdf",
      available: false,
      tag: "Policy"
    },
    {
      title: "Terms of Service",
      description: "Terms and conditions for club membership and services",
      icon: "📋",
      fileUrl: "/documents/terms-of-service.pdf",
      available: false,
      tag: "Policy"
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
            Transparency and accountability as a registered Ontario non-profit corporation
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
              <div className="text-lg font-bold gradient-text">Registered Ontario NFP Corporation</div>
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
                doc.available
                  ? 'border-primary-500/30 hover:border-primary-500/50 cursor-pointer'
                  : 'border-white/10 opacity-75'
              }`}
            >
              {/* Icon and Tag */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{doc.icon}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.available
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {doc.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{doc.description}</p>

              {/* Download Button */}
              {doc.available ? (
                <a
                  href={doc.fileUrl}
                  download
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-sm hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              ) : (
                <div className="w-full py-3 glass rounded-lg text-center text-sm text-gray-500">
                  Coming Soon
                </div>
              )}
            </div>
          ))}
        </div>

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
                  As a registered non-profit corporation in Ontario, we operate with full transparency. All documents
                  are available for review to ensure accountability to our members, sponsors, and the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
