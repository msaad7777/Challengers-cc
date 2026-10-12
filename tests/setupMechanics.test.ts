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

describe('bat path and space', () => {
  it('defines one bat path per intent and pairs it with the setup', async () => {
    const { BAT_PATHS, batPathFor, fullSetupFor, STRIKE_PATH_DEGREES } =
      await import('@/app/c3h/lib/setupMechanics');
    expect(BAT_PATHS).toHaveLength(2);
    expect(batPathFor('strike').intent).toBe('strike');
    const full = fullSetupFor('strike');
    expect(full.grip.intent).toBe('strike');
    expect(full.stance.intent).toBe('strike');
    expect(full.batPath.intent).toBe('strike');
    expect(STRIKE_PATH_DEGREES[0]).toBeLessThan(STRIKE_PATH_DEGREES[1]);
  });

  it('throws rather than guessing for an unknown intent', async () => {
    const { batPathFor } = await import('@/app/c3h/lib/setupMechanics');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => batPathFor('heave' as any)).toThrow(/heave/);
  });

  // The striking path is only safe from the striking setup. If a future edit
  // drops that warning, a player could take the bat path without the base.
  it('warns that the striking path needs the striking setup', async () => {
    const { batPathFor } = await import('@/app/c3h/lib/setupMechanics');
    expect(batPathFor('strike').tradeoff.toLowerCase()).toMatch(/grip|base|setup/);
  });

  it('republishes no exit-velocity or percentage figures', async () => {
    const m = await import('@/app/c3h/lib/setupMechanics');
    const text = JSON.stringify({ g: m.GRIPS, s: m.STANCES, b: m.BAT_PATHS, c: m.SETUP_CONSTANTS });
    expect(text).not.toMatch(/\d+\s?%/);
    expect(text.toLowerCase()).not.toMatch(/\d+\s?mph/);
  });
});
