/**
 * Google Ads conversion tracking.
 *
 * The gtag script is loaded in app/layout.tsx with the conversion ID below,
 * but until this module was added nothing ever fired a conversion event —
 * which is why the Ads account reported zero conversions despite real clicks.
 *
 * To switch a conversion on:
 *   Google Ads → Goals → Conversions → New conversion action → Website
 *   → after creating it, open "Tag setup" → "Use Google tag" and copy the
 *   send_to label (the part AFTER the slash, e.g. `abcDEF123_gHI`).
 *   Paste it into CONVERSION_LABELS below.
 *
 * An empty label is a deliberate no-op, so shipping before the Ads actions
 * exist is safe — nothing throws and nothing fires.
 */

export const GOOGLE_ADS_ID = 'AW-18005598397';

export const CONVERSION_LABELS = {
  /** Player registration / interest form submitted. */
  registration: '',
  /** Sponsorship enquiry submitted. */
  sponsorship: '',
  /** General contact form submitted. */
  contact: '',
} as const;

export type ConversionKey = keyof typeof CONVERSION_LABELS;

type GtagFn = (
  command: 'event',
  action: string,
  params: Record<string, unknown>,
) => void;

/**
 * Report a conversion to Google Ads. Safe to call anywhere: it no-ops during
 * SSR, when the tag has not loaded, and when the label is not configured yet.
 */
export function trackConversion(key: ConversionKey, value?: number): void {
  if (typeof window === 'undefined') return;

  const label = CONVERSION_LABELS[key];
  if (!label) return;

  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== 'function') return;

  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    ...(value !== undefined ? { value, currency: 'CAD' } : {}),
  });
}
