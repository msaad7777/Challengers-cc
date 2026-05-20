// Reusable letterhead-on-Letter-paper wrapper for all formal letters
// (Letter of Direction, board resolutions, bank correspondence, etc.).
// Renders the dark-green header + footer bands around any children.
//
// Multi-page printing
// -------------------
// When printed, the header and footer bands automatically repeat on
// every page if the body overflows. This is achieved with the classic
// HTML <table>/<thead>/<tfoot> "running header/footer" technique:
// browsers treat thead and tfoot as block-level groups that repeat on
// every printed page. This works reliably in Chrome, Edge, and Safari
// (which is what the directors use). Firefox repeats <thead> but is
// inconsistent with <tfoot>; if Firefox support is ever needed we'll
// fall back to position:fixed.
//
// Screen rendering still shows the bands once at the top and once at
// the bottom; the body grows in between. Cmd+P → "Save as PDF" with
// "Background graphics" enabled is the canonical export path.
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
        @page { size: letter; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .letter-paper { box-shadow: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
        }

        /* The whole letter is a single table so thead/tfoot can repeat
           per printed page. Width must be 100% of the page to avoid
           layout shift between screen and print. */
        .letter-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .letter-table thead { display: table-header-group; }
        .letter-table tfoot { display: table-footer-group; }
        .letter-table td { padding: 0; vertical-align: top; }

        /* Header band */
        .lp-header {
          background: #0c3d22;
          color: #e8f0ea;
          padding: 22px 56px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          border-bottom: 2px solid #0a0a0a;
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

        /* Body */
        .lp-body {
          padding: 28px 56px 32px;
          background: #ffffff;
          color: #1a1a1a;
          font-size: 13.5px;
          line-height: 1.55;
        }

        /* Footer band */
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

        /* The paper itself — Letter at 8.5 × 11in. Screen view shows it
           on a grey backdrop; print discards the shadow + margin. */
        .letter-paper {
          width: 8.5in;
          min-height: 11in;
          margin: 16px auto;
          background: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }

        /* Allow children to break between pages cleanly */
        .lp-body > * { break-inside: avoid-page; }
        .lp-body .force-break { break-after: page; }
      `}</style>

      <div className="letter-paper">
        <table className="letter-table">
          <thead>
            <tr>
              <td>
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
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <div className="lp-body">{children}</div>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <td>
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
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
