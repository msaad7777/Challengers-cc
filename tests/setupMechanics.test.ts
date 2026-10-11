import { describe, it, expect } from 'vitest';
import {
  GRIPS, STANCES, SETUP_CONSTANTS, setupFor, compareSetups,
  type BattingIntent,
} from '@/app/c3h/lib/setupMechanics';

describe('setupMechanics', () => {
  it('defines exactly one grip and one stance per intent', () => {
    for (const intent of ['build', 'strike'] as BattingIntent[]) {
      expect(GRIPS.filter((g) => g.intent === intent)).toHaveLength(1);
      expect(STANCES.filter((s) => s.intent === intent)).toHaveLength(1);
    }
  });

  it('pairs the grip and stance for an intent', () => {
    const { grip, stance } = setupFor('strike');
    expect(grip.intent).toBe('strike');
    expect(stance.intent).toBe('strike');
    expect(grip.name).toMatch(/power/i);
  });

  it('throws rather than guessing for an unknown intent', () => {
    expect(() => setupFor('slog' as BattingIntent)).toThrow(/slog/);
  });

  // The coaching point: the top hand is the thing that does NOT move. If a
  // future edit changes the top hand between grips, that is a real error.
  it('keeps the top-hand V on the outside edge in both grips', () => {
    for (const g of GRIPS) expect(g.topHand.toLowerCase()).toContain('outside edge');
  });

  it('keeps head-over-hands-over-back-foot alignment in both stances', () => {
    for (const s of STANCES) expect(s.alignment.toLowerCase()).toContain('back foot');
  });

  it('actually differentiates the bottom hand and the base', () => {
    expect(setupFor('build').grip.bottomHand).not.toBe(setupFor('strike').grip.bottomHand);
    expect(setupFor('build').stance.base).not.toBe(setupFor('strike').stance.base);
  });

  it('warns on both setups that neither is a default', () => {
    for (const s of STANCES) expect(s.caution.length).toBeGreaterThan(20);
  });

  it('compares the two setups across every aspect', () => {
    const rows = compareSetups();
    expect(rows).toHaveLength(5);
    for (const r of rows) {
      expect(r.build).toBeTruthy();
      expect(r.strike).toBeTruthy();
      expect(r.build).not.toBe(r.strike);
    }
  });

  it('states what holds true across both setups', () => {
    expect(SETUP_CONSTANTS.length).toBeGreaterThanOrEqual(3);
    expect(SETUP_CONSTANTS.join(' ').toLowerCase()).toContain('top hand');
  });

  // Compliance: we deliberately do not republish Julian Wood's unverified
  // percentage claim about extra swing. If it reappears, that is a regression.
  it('carries no unverified numeric performance claim', () => {
    const text = JSON.stringify({ GRIPS, STANCES, SETUP_CONSTANTS });
    expect(text).not.toMatch(/\d+\s?%/);
  });
});
