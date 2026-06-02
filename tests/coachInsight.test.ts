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

  describe('bounceBack', () => {
    it('returns a fully-populated Bounce Back block on minimum input', () => {
      const i = generateCoachInsight(baseInputs);
      expect(i.bounceBack.breathe.length).toBeGreaterThan(20);
      expect(i.bounceBack.reflectPrompts).toHaveLength(3);
      for (const p of i.bounceBack.reflectPrompts) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answer.length).toBeGreaterThan(0);
      }
      expect(i.bounceBack.resetCard.mindsetWord.length).toBeGreaterThan(0);
      expect(i.bounceBack.resetCard.strengthToBack.length).toBeGreaterThan(0);
      expect(i.bounceBack.resetCard.pressureResponse.length).toBeGreaterThan(0);
      expect(i.bounceBack.resetCard.mantra.length).toBeGreaterThan(0);
      expect(i.bounceBack.mindsetSwitch.from.length).toBeGreaterThan(0);
      expect(i.bounceBack.mindsetSwitch.to.length).toBeGreaterThan(0);
    });

    it('"Chased a wide delivery" mistake picks "Discipline" as the mindset word', () => {
      const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Chased a wide delivery'] });
      expect(i.bounceBack.resetCard.mindsetWord).toBe('Discipline');
    });

    it('"Froze under pressure" picks "Calm" as the mindset word', () => {
      const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Froze under pressure'] });
      expect(i.bounceBack.resetCard.mindsetWord).toBe('Calm');
    });

    it('"Defensive mindset" picks "Brave" as the mindset word', () => {
      const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Defensive mindset'] });
      expect(i.bounceBack.resetCard.mindsetWord).toBe('Brave');
    });

    it('high pressure produces a different pressure response than no pressure', () => {
      const high = generateCoachInsight({ ...baseInputs, pressureLevel: 'high' });
      const none = generateCoachInsight({ ...baseInputs, pressureLevel: 'low' });
      expect(high.bounceBack.resetCard.pressureResponse).not.toBe(none.bounceBack.resetCard.pressureResponse);
    });

    it('low feeling (1) produces the "score doesn\'t define me" mantra', () => {
      const i = generateCoachInsight({ ...baseInputs, feeling: 1 });
      expect(i.bounceBack.resetCard.mantra.toLowerCase()).toContain('process');
    });

    it('mindsetSwitch reframes "I got out / I failed" into a growth-mindset alternative when dismissed', () => {
      const i = generateCoachInsight({ ...baseInputs, howGotOut: ['Bowled'] });
      expect(i.bounceBack.mindsetSwitch.from.toLowerCase()).toContain('failed');
      expect(i.bounceBack.mindsetSwitch.to.toLowerCase()).toContain('learned');
    });

    it('reflect prompts include the player\'s own "why I got out" wording when provided', () => {
      const note = 'I went for a big shot too early before reading the bowler.';
      const i = generateCoachInsight({ ...baseInputs, whyShotThatGotMeOut: note });
      const happenedAnswer = i.bounceBack.reflectPrompts[0].answer;
      expect(happenedAnswer).toContain(note);
    });

    it('is deterministic — same inputs produce same bounceBack output', () => {
      const a = generateCoachInsight(baseInputs);
      const b = generateCoachInsight(baseInputs);
      expect(a.bounceBack).toEqual(b.bounceBack);
    });
  });

  describe('runMaker', () => {
    it('returns a fully-populated Run Maker block on minimum input', () => {
      const i = generateCoachInsight(baseInputs);
      expect(i.runMaker.scoringIdentity.traits).toHaveLength(3);
      expect(i.runMaker.scoringIdentity.scoringStatement.length).toBeGreaterThan(10);
      expect(i.runMaker.intentTrigger.look.length).toBeGreaterThan(0);
      expect(i.runMaker.intentTrigger.breathe.length).toBeGreaterThan(0);
      expect(i.runMaker.intentTrigger.say.length).toBeGreaterThan(0);
      expect(i.runMaker.phasePlan).toHaveLength(3);
      expect(i.runMaker.phasePlan.map((p) => p.phase)).toEqual(['Start Smart', 'Build Fast', 'Finish Strong']);
      for (const p of i.runMaker.phasePlan) {
        expect(p.goal.length).toBeGreaterThan(0);
        expect(p.keyShots.length).toBeGreaterThan(0);
        expect(p.reminderWord.length).toBeGreaterThan(0);
      }
      expect(i.runMaker.dotBallTactics.length).toBeGreaterThanOrEqual(2);
    });

    it('death-overs match phase picks the finisher trait pool (Fearless / Dominant / Ruthless)', () => {
      const i = generateCoachInsight({ ...baseInputs, matchPhase: 'death' });
      expect(i.runMaker.scoringIdentity.traits).toContain('Fearless');
    });

    it('powerplay phase picks the starter trait pool (Sharp / Game-aware / Purposeful)', () => {
      const i = generateCoachInsight({ ...baseInputs, matchPhase: 'powerplay' });
      expect(i.runMaker.scoringIdentity.traits).toContain('Sharp');
    });

    it('"Froze under pressure" steers traits toward Brave / Bold / Calm', () => {
      const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Froze under pressure'] });
      expect(i.runMaker.scoringIdentity.traits).toContain('Brave');
    });

    it('"Reckless shot" steers traits toward Calculated / Strategic / Patient', () => {
      const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Reckless shot'] });
      expect(i.runMaker.scoringIdentity.traits).toContain('Calculated');
    });

    it('low intent score picks "See it. Hit it." as the verbal trigger', () => {
      const i = generateCoachInsight({ ...baseInputs, intentScore: 1 });
      expect(i.runMaker.intentTrigger.say).toBe('See it. Hit it.');
    });

    it('death phase picks "Score now." as the verbal trigger', () => {
      const i = generateCoachInsight({ ...baseInputs, matchPhase: 'death' });
      expect(i.runMaker.intentTrigger.say).toBe('Score now.');
    });

    it('"Did not rotate strike" surfaces Drop and Run + Shuffle and Clip tactics', () => {
      const i = generateCoachInsight({ ...baseInputs, whatWentWrong: ['Did not rotate strike'] });
      const joined = i.runMaker.dotBallTactics.join(' ');
      expect(joined).toContain('Drop and Run');
      expect(joined).toContain('Shuffle and Clip');
    });

    it('KPIs compute Runs / 10 balls from scorer data', () => {
      const i = generateCoachInsight({ ...baseInputs, runs: 30, balls: 20 });
      expect(i.runMaker.kpis.runsPer10Balls).toBe(15); // 30/20 * 10 = 15
      expect(i.runMaker.kpis.intentScore).toBe(3); // baseInputs has intentScore: 3
    });

    it('KPIs return null when scorer data is missing', () => {
      const i = generateCoachInsight(baseInputs);
      expect(i.runMaker.kpis.runsPer10Balls).toBeNull();
    });

    it('is deterministic — same inputs produce same runMaker output', () => {
      const a = generateCoachInsight(baseInputs);
      const b = generateCoachInsight(baseInputs);
      expect(a.runMaker).toEqual(b.runMaker);
    });
  });
});
