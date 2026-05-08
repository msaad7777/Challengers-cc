"use client";

// Tiny client-component wrapper around window.print() so that legal-document
// pages (bylaws, ip-ownership, etc.) can stay server-components and just
// import this button. Uses the print:hidden class so the button itself is
// not part of the printed PDF.

type Props = {
  label?: string;
  className?: string;
};

export default function PrintButton({
  label = '🖨️ Print / Save as PDF',
  className = '',
}: Props) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ||
        'print:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all'
      }
    >
      {label}
    </button>
  );
}
