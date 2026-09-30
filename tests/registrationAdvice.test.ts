import { describe, it, expect } from 'vitest';
import {
  buildAdvice,
  weekendSharePct,
  T30_FIXTURES,
  PART_SEASON_FEE,
  FULL_SEASON_TOPUP,
  type AdviceInput,
} from '@/lib/registrationAdvice';

const input = (over: Partial<AdviceInput> = {}): AdviceInput => ({
  gamesCommitted: 13,
  weekendAvailability: 'free',
  workPattern: 'full-time',
  ...over,
});

describe('buildAdvice — tier boundary', () => {
  it('treats exactly 50% of the season as full season', () => {
    const a = buildAdvice(input({ gamesCommitted: 13 }));
    expect(a.tier).toBe('full');
    expect(a.tierLabel).toBe('Full Season');
  });

  it('treats one match below 50% as part season', () => {
    const a = buildAdvice(input({ gamesCommitted: 12 }));
    expect(a.tier).toBe('part');
  });

  it('bills $150 now in both tiers — the fee now never changes', () => {
    expect(buildAdvice(input({ gamesCommitted: 3 })).feeNow).toBe(PART_SEASON_FEE);
    expect(buildAdvice(input({ gamesCommitted: 22 })).feeNow).toBe(PART_SEASON_FEE);
  });

  it('only asks for the March top-up from full season players', () => {
    expect(buildAdvice(input({ gamesCommitted: 22 })).feeLater).toBe(FULL_SEASON_TOPUP);
    expect(buildAdvice(input({ gamesCommitted: 5 })).feeLater).toBe(0);
    expect(buildAdvice(input({ gamesCommitted: 5 })).feeTotal).toBe(PART_SEASON_FEE);
    expect(buildAdvice(input({ gamesCommitted: 22 })).feeTotal).toBe(
      PART_SEASON_FEE + FULL_SEASON_TOPUP,
    );
  });
});

describe('buildAdvice — input clamping', () => {
  it('clamps above the fixture count', () => {
    const a = buildAdvice(input({ gamesCommitted: 999 }));
    expect(a.headline).toContain(`${T30_FIXTURES} of ${T30_FIXTURES}`);
  });

  it('clamps negatives to zero', () => {
    const a = buildAdvice(input({ gamesCommitted: -5 }));
    expect(a.tier).toBe('part');
    expect(a.caution).toMatch(/zero/i);
  });

  it('rounds fractional input', () => {
    expect(buildAdvice(input({ gamesCommitted: 12.6 })).tier).toBe('full');
  });
});

describe('buildAdvice — the availability cross-check', () => {
  it('flags a full-season commitment from someone who works most weekends', () => {
    const a = buildAdvice(input({ gamesCommitted: 20, weekendAvailability: 'most' }));
    expect(a.caution).toBeDefined();
    expect(a.caution).toContain('most weekends');
    expect(a.caution).toContain('20 matches');
  });

  it('flags an over-commitment from someone who works some weekends', () => {
    const a = buildAdvice(input({ gamesCommitted: 24, weekendAvailability: 'some' }));
    expect(a.caution).toContain('some weekends');
  });

  it('stays quiet when the commitment fits the stated availability', () => {
    expect(buildAdvice(input({ gamesCommitted: 5, weekendAvailability: 'most' })).caution)
      .toBeUndefined();
    expect(buildAdvice(input({ gamesCommitted: 14, weekendAvailability: 'some' })).caution)
      .toBeUndefined();
    expect(buildAdvice(input({ gamesCommitted: 18, weekendAvailability: 'free' })).caution)
      .toBeUndefined();
  });

  it('cautions against committing to virtually every match', () => {
    const a = buildAdvice(input({ gamesCommitted: 26, weekendAvailability: 'free' }));
    expect(a.caution).toMatch(/nobody in our 2026 squad played all/i);
  });

  it('zero games takes priority over every other caution', () => {
    const a = buildAdvice(input({ gamesCommitted: 0, weekendAvailability: 'most' }));
    expect(a.caution).toMatch(/Talk to us before you pay/i);
  });

  it('quotes the real weekend share in the mismatch warning', () => {
    const a = buildAdvice(input({ gamesCommitted: 20, weekendAvailability: 'most' }));
    expect(a.caution).toContain(`${weekendSharePct()}%`);
  });
});

describe('buildAdvice — playoff guidance', () => {
  it('uses the leagues own thresholds, not a single formula', () => {
    // LCL T30 is 50% + 1 of 14 = 8; LPL T30 Division 2 is a fixed 5 of 12.
    const a = buildAdvice(input({ gamesCommitted: 4 }));
    expect(a.playoff).toContain('8 of 14');
    expect(a.playoff).toContain('5 of 12');
  });

  it('warns part season players they may miss knockouts', () => {
    expect(buildAdvice(input({ gamesCommitted: 4 })).playoff).toMatch(/may not be available/i);
  });

  it('reassures full season players', () => {
    expect(buildAdvice(input({ gamesCommitted: 20 })).playoff).toMatch(/should clear/i);
  });
});

describe('weekendSharePct', () => {
  it('reports the 2026 weekend share as 91%', () => {
    expect(weekendSharePct()).toBe(91);
  });
});
