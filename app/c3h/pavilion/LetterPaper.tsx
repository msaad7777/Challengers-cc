// Reusable letterhead-on-Letter-paper wrapper for all formal letters
// (Letter of Direction, board resolutions, bank correspondence, etc.).
// Renders the dark-green header + footer bands around any children.
//
// Print behaviour
// ---------------
// In print mode, the header is fixed to the top of every page and the
// footer is fixed to the bottom of every page. The @page rule reserves
// matching top + bottom margins so the body content flows naturally in
// between without overlapping the fixed bands. This produces:
//
//   • Header band repeats at the top of pages 1, 2, 3…
//   • Footer band sits at the bottom of pages 1, 2, 3…
//   • On the last page, the footer is pinned to the bottom of the page
//     (NOT directly after the last paragraph) — which is what the bank
//     expects and what users expect to see in the saved PDF.
//
// This is the Chrome-recommended pattern for running headers/footers
// (the workflow is "open in Chrome → Save as PDF" so Chrome behaviour
// is the only one that matters for the export path). Safari and Edge
// behave the same way. Firefox handles the position:fixed-per-page
// pattern less consistently; the export path is documented as Chrome.
//
// Screen behaviour
// ----------------
// On screen, the paper is a flex column with min-height equal to a
// Letter sheet, so the footer is also pinned to the bottom of the
// preview "page" via flex:1 on the body. Mobile breakpoints stack the
// header (logo above contact) and footer (single column) so the
// preview stays readable on phones.
//
// Usage:
//   <LetterPaper>
//     <p>Letter body here…</p>
//   </LetterPaper>

import type { ReactNode } from 'react';

export default function LetterPaper({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        /* ── Print page setup ───────────────────────────────────────── */
        @page {
          size: letter;
          /* Reserve space at top + bottom for the fixed header + footer.
             Side margins are 0 because the bands themselves go edge to
             edge; body content has its own horizontal padding. */
          margin: 1.45in 0 0.95in 0;
        }
        @media print {
          html, body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }

        /* ── Paper (screen) ─────────────────────────────────────────── */
        .letter-paper {
          width: 100%;
          max-width: 8.5in;
          min-height: 11in;
          margin: 16px auto;
          background: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
        }
        @media print {
          .letter-paper {
            width: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            display: block !important;
          }
        }

        /* ── Header band ────────────────────────────────────────────── */
        .lp-header {
          background: #0c3d22;
          color: #e8f0ea;
          padding: 22px 56px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 2px solid #0a0a0a;
        }
        @media print {
          .lp-header {
            position: fixed;
            top: 0; left: 0; right: 0;
            margin: 0;
            height: 1.45in;
            border-bottom: 2px solid #0a0a0a;
          }
        }

        .lp-logo {
          width: 110px;
          height: 110px;
          background: #0a0a0a;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }
        .lp-logo img { width: 100%; height: 100%; object-fit: contain; }

        .lp-header-contact {
          text-align: right;
          font-size: 12.5px;
          line-height: 1.55;
        }
        .lp-header-contact .line { display: block; }
        .lp-header-contact a { color: inherit; text-decoration: none; }

        /* ── Body ───────────────────────────────────────────────────── */
        .lp-body {
          padding: 28px 56px 32px;
          background: #fff;
          color: #1a1a1a;
          font-size: 13.5px;
          line-height: 1.55;
          flex: 1;
        }
        @media print {
          .lp-body {
            /* @page margin already reserves top + bottom space for the
               fixed header/footer; body just needs side gutters. */
            padding: 0 0.5in;
          }
          .lp-body > * { break-inside: avoid-page; }
        }

        /* ── Footer band ────────────────────────────────────────────── */
        .lp-footer {
          background: #0c3d22;
          color: #e8f0ea;
          padding: 12px 56px;
          display: grid;
          grid-template-columns: 1fr 1.6fr 1.6fr;
          gap: 18px;
          align-items: center;
          font-size: 11.5px;
          line-height: 1.35;
        }
        @media print {
          .lp-footer {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            margin: 0;
            height: 0.95in;
            padding-left: 0.5in;
            padding-right: 0.5in;
          }
        }
        .lp-footer .item { display: flex; align-items: center; gap: 8px; }
        .lp-footer .icon {
          width: 20px; height: 20px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lp-footer .icon svg {
          width: 11px; height: 11px;
          stroke: currentColor; fill: none;
          stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
        }
        .lp-footer a { color: inherit; text-decoration: none; }

        /* ── Mobile responsiveness (screen only — print is Letter) ──── */
        @media (max-width: 700px) {
          .letter-paper {
            margin: 8px;
            width: auto;
            min-height: 0;
          }
          .lp-header {
            padding: 16px 18px;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 10px;
          }
          .lp-logo { width: 84px; height: 84px; }
          .lp-header-contact {
            text-align: center;
            font-size: 12px;
          }
          .lp-body {
            padding: 18px 18px 20px;
            font-size: 13px;
          }
          .lp-footer {
            padding: 12px 18px;
            grid-template-columns: 1fr;
            gap: 6px;
            text-align: left;
            font-size: 11px;
          }
          .lp-footer .item { justify-content: flex-start; }
        }
      `}</style>

      <div className="letter-paper">
        <div className="lp-header">
          <div className="lp-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ccc-logo.png" alt="Challengers Cricket Club" />
          </div>
          <div className="lp-header-contact">
            <span className="line">431-726-3434</span>
            <span className="line">
              <a href="mailto:contact@challengerscc.ca">contact@challengerscc.ca</a>
            </span>
            <span className="line">790 Capulet Lane</span>
            <span className="line">London ON N6H 0J8</span>
          </div>
        </div>

        <div className="lp-body">{children}</div>

        <div className="lp-footer">
          <div className="item">
            <span className="icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <a href="tel:+14317263434">431-726-3434</a>
          </div>
          <div className="item">
            <span className="icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span>790 Capulet Lane, London ON N6H 0J8</span>
          </div>
          <div className="item">
            <span className="icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
            <a href="mailto:contact@challengerscc.ca">contact@challengerscc.ca</a>
          </div>
        </div>
      </div>
    </>
  );
}
