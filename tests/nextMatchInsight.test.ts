import { describe, it, expect } from 'vitest';
import { generateNextMatchInsight, type NextMatchReflectionInput } from '@/app/c3h/lib/nextMatchInsight';

const baseRefl = (over: Partial<NextMatchReflectionInput>): NextMatchReflectionInput => ({
  match: 'Practice Match',
  matchIndex: 0,
  howGotOut: 'Bowled',
  whatWentRight: [],
  whatWentWrong: [],
  intentScore: 3,
  feeling: 3,
  ...over,
});

describe('generateNextMatchInsight', () => {
  it('returns empty-ish output when there are no match-linked reflections', () => {
    const r = generateNextMatchInsight([baseRefl({ matchIndex: 99 })]);
    expect(r.aggregate.matches).toBe(0);
    expect(r.competitionStats).toHaveLength(0);
    expect(r.topDismissalPattern).toBeNull();
    expect(r.topMistakePattern).toBeNull();
  });

  it('aggregates a single reflection correctly', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M3 — vs NLCC (May 31)', runsScored: 30, ballsFaced: 20, dotBallsFaced: 8 }),
    ]);
    expect(r.aggregate.matches).toBe(1);
    expect(r.aggregate.runs).toBe(30);
    expect(r.aggregate.balls).toBe(20);
    expect(r.aggregate.strikeRate).toBe(150);
    expect(r.aggregate.dotBallPercent).toBe(40);
  });

  it('separates LPL and LCL into distinct competition rows', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M3 — vs NLCC (May 31)', runsScored: 24, ballsFaced: 20 }),
      baseRefl({ match: 'LCL M2 — vs Forest City Cricketers (May 18)', runsScored: 50, ballsFaced: 40 }),
    ]);
    const lpl = r.competitionStats.find((c) => c.key === 'LPL');
    const lcl = r.competitionStats.find((c) => c.key === 'LCL');
    expect(lpl?.runs).toBe(24);
    expect(lpl?.balls).toBe(20);
    expect(lpl?.strikeRate).toBe(120);
    expect(lcl?.runs).toBe(50);
    expect(lcl?.balls).toBe(40);
    expect(lcl?.strikeRate).toBe(125);
  });

  it('practice matches go into the Practice competition (not LPL/LCL/Other)', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'Practice Match', runsScored: 10, ballsFaced: 12 }),
      baseRefl({ match: 'Nets — Saturday session', runsScored: 5, ballsFaced: 8 }),
    ]);
    const practice = r.competitionStats.find((c) => c.key === 'Practice');
    expect(practice?.matches).toBe(2);
    expect(practice?.runs).toBe(15);
    expect(practice?.balls).toBe(20);
  });

  it('coach review surfaces a cross-competition gap when SR difference is significant', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', runsScored: 12, ballsFaced: 20 }),       // SR 60
      baseRefl({ match: 'LCL M1', runsScored: 50, ballsFaced: 30 }),       // SR ~167
    ]);
    const joined = r.coachReview.join(' ');
    expect(joined).toMatch(/gap/i);
    expect(joined).toMatch(/London Premier League|London Cricket League/);
  });

  it('coach review flags slow aggregate SR (<75)', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', runsScored: 10, ballsFaced: 20 }),       // SR 50
      baseRefl({ match: 'LPL M2', runsScored: 8, ballsFaced: 18 }),        // SR ~44
    ]);
    const joined = r.coachReview.join(' ');
    expect(joined.toLowerCase()).toContain('strike rate');
    expect(joined.toLowerCase()).toContain('dot');
  });

  it('coach review celebrates elite SR (>=130)', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', runsScored: 30, ballsFaced: 20 }),       // SR 150
      baseRefl({ match: 'LPL M2', runsScored: 40, ballsFaced: 25 }),       // SR 160
    ]);
    const joined = r.coachReview.join(' ').toLowerCase();
    expect(joined).toMatch(/elite|tempo|trust/);
  });

  it('flags a repeating dismissal pattern (count >= 2)', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', howGotOut: 'Bowled' }),
      baseRefl({ match: 'LPL M2', howGotOut: 'Bowled' }),
      baseRefl({ match: 'LCL M1', howGotOut: 'Caught — Slips/Gully' }),
    ]);
    expect(r.topDismissalPattern?.dismissal).toBe('Bowled');
    expect(r.topDismissalPattern?.count).toBe(2);
    expect(r.coachReview.join(' ').toLowerCase()).toContain('pattern');
  });

  it('flags a repeating mistake pattern (count >= 2) when no dominant dismissal', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', howGotOut: 'Bowled', whatWentWrong: ['Poor footwork'] }),
      baseRefl({ match: 'LCL M1', howGotOut: 'Not out', whatWentWrong: ['Poor footwork'] }),
    ]);
    expect(r.topMistakePattern?.mistake).toBe('Poor footwork');
    expect(r.topMistakePattern?.count).toBe(2);
  });

  it('aggregates bowler-style dismissals when player tracks them', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', dismissalBowlerArm: 'right', dismissalBowlerStyle: 'leg-spin' }),
      baseRefl({ match: 'LCL M1', dismissalBowlerArm: 'right', dismissalBowlerStyle: 'leg-spin' }),
      baseRefl({ match: 'LPL M2', dismissalBowlerArm: 'left', dismissalBowlerStyle: 'fast' }),
    ]);
    expect(r.topBowlerStyle?.style).toBe('leg-spin');
    expect(r.topBowlerStyle?.arm).toBe('right');
    expect(r.topBowlerStyle?.count).toBe(2);
    expect(r.coachReview.join(' ').toLowerCase()).toContain('leg-spin');
  });

  it('ignores "Not out" and "Did not bat" in dismissal counts', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1', howGotOut: 'Not out' }),
      baseRefl({ match: 'LPL M2', howGotOut: 'Did not bat' }),
      baseRefl({ match: 'LCL M1', howGotOut: 'Bowled' }),
    ]);
    expect(r.topDismissalPattern?.dismissal).toBe('Bowled');
    expect(r.topDismissalPattern?.count).toBe(1);
  });

  it('produces a non-empty rallying cue regardless of inputs', () => {
    const r = generateNextMatchInsight([baseRefl({ match: 'LPL M1' })]);
    expect(r.goIntoNextMatchWith.length).toBeGreaterThan(5);
  });

  it('is deterministic — same inputs produce same output', () => {
    const inputs = [
      baseRefl({ match: 'LPL M1', runsScored: 24, ballsFaced: 20, whatWentWrong: ['Poor footwork'] }),
      baseRefl({ match: 'LCL M1', runsScored: 40, ballsFaced: 30, whatWentWrong: ['Poor footwork'] }),
    ];
    const a = generateNextMatchInsight(inputs);
    const b = generateNextMatchInsight(inputs);
    expect(a).toEqual(b);
  });

  it('handles reflections with missing optional fields gracefully', () => {
    const r = generateNextMatchInsight([
      baseRefl({ match: 'LPL M1' }), // no runs/balls/dot balls
      baseRefl({ match: 'LCL M1', runsScored: 20, ballsFaced: 15 }),
    ]);
    expect(r.aggregate.matches).toBe(2);
    expect(r.aggregate.runs).toBe(20);
    expect(r.aggregate.balls).toBe(15);
    expect(r.aggregate.strikeRate).toBeCloseTo(133.3, 0);
  });
});
