/**
 * Link to the 2027 Sponsorship Package PDF.
 *
 * The PDF is hosted on the club's contact@ Google Drive (view-only, with
 * download/print/copy disabled for viewers), never in public/ — anything in
 * public/ has to be committed to git and is served with no login. Its source
 * lives in the gitignored /private/ folder.
 *
 * Paste the Drive share link below. While it is empty the button renders
 * nothing, so a missing link never ships as a dead button.
 */
export const SPONSOR_PACKAGE_URL = '';

export default function SponsorPackageLink({ className = '' }: { className?: string }) {
  if (!SPONSOR_PACKAGE_URL) return null;

  return (
    <a
      href={SPONSOR_PACKAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 glass glass-hover rounded-lg font-semibold border border-accent-500/30 hover:border-accent-500/60 transition-all duration-300 ${className}`}
    >
      <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      2027 Sponsorship Package (PDF)
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
