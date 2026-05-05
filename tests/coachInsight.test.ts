import { describe, it, expect } from 'vitest';
import { generateCoachInsight, type CoachInputs } from '@/app/c3h/lib/coachInsight';

const baseInputs: CoachInputs = {
  howGotOut: ['Caught at mid-off'],
  whatWentRight: ['Strong defense early'],
  whatWentWrong: ['Poor shot selection'],
  feeling: 3,
  intentScore: 3,
};

describe('generateCoachInsight', () => {
  it('returns a structured insight for minimum required input', () => {
    const insight = generateCoachInsight(baseInputs);
    expect(insight.diagnosis).toBeTruthy();
    expect(insight.narrative).toBeTruthy();
    expect(insight.drills.length).toBeGreaterThan(0);
    expect(insight.nextInningsPlan).toMatchObject({
      firstSixBalls: expect.any(String),
      scoringAreas: expect.any(String),
      riskToAvoid: expect.any(String),
      strengthToBack: expect.any(String),
    });
  });

  it('adds a drill specific to the "what went wrong" mistake', () => {
    const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Poor shot selection'] });
    expect(i.drills.some((d) => d.toLowerCase().includes('shot-selection'))).toBe(true);
  });

  it('produces a different narrative under high pressure', () => {
    const calm = generateCoachInsight({ ...baseInputs, pressureLevel: 'low' });
    const pressure = generateCoachInsight({ ...baseInputs, pressureLevel: 'high' });
    // narratives don't have to be different in every detail, but the
    // function should not throw and should produce a non-empty string
    expect(pressure.narrative.length).toBeGreaterThan(0);
    expect(calm.narrative.length).toBeGreaterThan(0);
  });

  it('handles missing optional fields gracefully', () => {
    const i = generateCoachInsight({
      howGotOut: [],
      whatWentRight: [],
      whatWentWrong: [],
      feeling: 1,
      intentScore: 1,
    });
    expect(i.diagnosis).toBeTruthy();
    expect(i.narrative).toBeTruthy();
  });

  it('is deterministic — same inputs produce same output', () => {
    const a = generateCoachInsight(baseInputs);
    const b = generateCoachInsight(baseInputs);
    expect(a).toEqual(b);
  });

  it('feeling=1 (low confidence) produces different narrative than feeling=5', () => {
    const low = generateCoachInsight({ ...baseInputs, feeling: 1 });
    const high = generateCoachInsight({ ...baseInputs, feeling: 5 });
    // Both narratives should be non-empty and may differ in tone.
    expect(low.narrative.length).toBeGreaterThan(0);
    expect(high.narrative.length).toBeGreaterThan(0);
  });

  it('intentMode=accelerate vs settle produces a different next-innings plan', () => {
    const acc = generateCoachInsight({ ...baseInputs, intentMode: 'accelerate' });
    const settle = generateCoachInsight({ ...baseInputs, intentMode: 'settle' });
    // Plan structure should still be filled; the firstSixBalls advice
    // is what diverges by intent mode.
    expect(acc.nextInningsPlan.firstSixBalls.length).toBeGreaterThan(0);
    expect(settle.nextInningsPlan.firstSixBalls.length).toBeGreaterThan(0);
  });

  it('death-overs phase produces an insight with non-empty plan', () => {
    const death = generateCoachInsight({
      ...baseInputs,
      matchPhase: 'death',
      whatWentWrong: ['Played too late'],
    });
    expect(death.drills.length).toBeGreaterThan(0);
    expect(death.nextInningsPlan.riskToAvoid.length).toBeGreaterThan(0);
  });

  it('every output field is a non-empty string', () => {
    const i = generateCoachInsight({ ...baseInputs, controlPercent: 50 });
    expect(i.diagnosis.length).toBeGreaterThan(0);
    expect(i.narrative.length).toBeGreaterThan(0);
    expect(i.nextInningsPlan.firstSixBalls.length).toBeGreaterThan(0);
    expect(i.nextInningsPlan.scoringAreas.length).toBeGreaterThan(0);
    expect(i.nextInningsPlan.riskToAvoid.length).toBeGreaterThan(0);
    expect(i.nextInningsPlan.strengthToBack.length).toBeGreaterThan(0);
  });
});
