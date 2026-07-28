import { describe, it, expect } from 'vitest';
import { FOLLOW_ALONG_SESSIONS } from '@/app/c3h/lib/followAlong';

describe('FOLLOW_ALONG_SESSIONS', () => {
  it('covers batting, bowling and wicketkeeping', () => {
    const disciplines = FOLLOW_ALONG_SESSIONS.map((s) => s.discipline).sort();
    expect(disciplines).toEqual(['batting', 'bowling', 'keeping']);
  });

  it('each session opens with a breathing step and has real content', () => {
    for (const s of FOLLOW_ALONG_SESSIONS) {
      expect(s.steps.length).toBeGreaterThanOrEqual(10);
      expect(s.steps[0].breathe).toBe(true);
      expect(s.steps.every((st) => st.seconds > 0 && st.text.length > 0)).toBe(true);
    }
  });

  it('each session ends on a calming breath', () => {
    for (const s of FOLLOW_ALONG_SESSIONS) {
      expect(s.steps[s.steps.length - 1].breathe).toBe(true);
    }
  });

  it('rehearses recovery, not just perfect plays (has a "mistake" beat)', () => {
    for (const s of FOLLOW_ALONG_SESSIONS) {
      const joined = s.steps.map((st) => st.text).join(' ').toLowerCase();
      expect(joined).toContain('mistake');
      expect(joined).toContain('reset');
    }
  });
});
