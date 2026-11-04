import { describe, expect, it, vi } from 'vitest';
import { buildInquiryBody, submitInquiry } from '@/lib/inquiry-forms';

const sponsor = {
  organizationName: 'Test Org',
  contactName: 'Test Person',
  email: 'test@example.com',
  phone: '000-000-0000',
  sponsorshipLevel: 'Title Sponsor - $2,000',
};

describe('buildInquiryBody', () => {
  it('maps fields to the form entries and skips an empty optional message', () => {
    const body = buildInquiryBody('sponsor', sponsor);
    expect(body?.get('entry.861380879')).toBe('Title Sponsor - $2,000');
    expect(body?.has('entry.1857964256')).toBe(false);
  });

  it('rejects unknown forms, inherited names, missing fields and oversized values', () => {
    expect(buildInquiryBody('other', sponsor)).toBeNull();
    expect(buildInquiryBody('constructor', sponsor)).toBeNull();
    expect(buildInquiryBody('sponsor', { ...sponsor, email: ' ' })).toBeNull();
    expect(buildInquiryBody('contact', { name: 'A', email: 'a@b.c', message: 'x'.repeat(5001) })).toBeNull();
    expect(buildInquiryBody('contact', null)).toBeNull();
  });
});

describe('submitInquiry', () => {
  it.each([
    [200, true],
    [302, false],
    [400, false],
    [401, false],
  ])('treats Google status %i as saved=%s', async (status, saved) => {
    const fetchImpl = vi.fn().mockResolvedValue({ status });
    const body = buildInquiryBody('sponsor', sponsor)!;
    await expect(submitInquiry('sponsor', body, fetchImpl as unknown as typeof fetch)).resolves.toBe(saved);
  });
});
