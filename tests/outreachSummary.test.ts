import { describe, it, expect } from 'vitest';
import { createCipheriv, randomBytes } from 'crypto';
import { decryptSummary, staleHours } from '@/lib/outreach-summary';

// Same envelope publish-summary.js writes on the club Mac.
function encrypt(obj: unknown, key: Buffer) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf-8'), c.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: data.toString('base64') });
}

describe('decryptSummary', () => {
  const key = randomBytes(32);
  const summary = { generated: '2026-11-02T14:40:00.000Z', sent: { today: 100 } };

  it('round-trips the Mac envelope', () => {
    expect(decryptSummary(encrypt(summary, key), key.toString('base64'))).toEqual(summary);
  });

  it('rejects the wrong key', () => {
    expect(() => decryptSummary(encrypt(summary, key), randomBytes(32).toString('base64'))).toThrow();
  });

  it('rejects a short key', () => {
    expect(() => decryptSummary(encrypt(summary, key), randomBytes(16).toString('base64'))).toThrow(/32 bytes/);
  });
});

describe('staleHours', () => {
  it('measures age of the summary', () => {
    expect(staleHours({ generated: '2026-11-02T00:00:00Z' }, new Date('2026-11-03T06:00:00Z'))).toBe(30);
  });
});
