import { describe, it, expect } from 'vitest';
import {
  detectLeagueFromLabel,
  getPlayingXI,
  getTwelfthMan,
  validatePlan,
  buildHuddleScript,
  getLeadership,
  type MatchPlan,
  type PlayerAssignment,
} from '@/app/c3h/lib/matchPlan';

const player = (over: Partial<PlayerAssignment>): PlayerAssignment => ({
  playerName: 'Player X',
  email: 'x@x.com',
  ...over,
});

const basePlan = (over: Partial<MatchPlan>): MatchPlan => ({
  matchId: 'm1',
  matchLabel: 'LPL M5 — vs Tigers',
  league: 'LPL',
  captainName: 'Tarek',
  vcName: 'Saad',
  squad: [],
  mindsetWord: 'Calm',
  status: 'draft',
  createdBy: 'saad@x.com',
  createdAt: '2026-06-08T00:00:00Z',
  updatedAt: '2026-06-08T00:00:00Z',
  ...over,
});

describe('detectLeagueFromLabel', () => {
  it('detects LPL by prefix', () => {
    expect(detectLeagueFromLabel('LPL M3 — vs NLCC')).toBe('LPL');
  });
  it('detects LCL by prefix', () => {
    expect(detectLeagueFromLabel('LCL M2 — vs Forest City Cricketers')).toBe('LCL');
  });
  it('detects Practice by "practice" keyword', () => {
    expect(detectLeagueFromLabel('Practice Match')).toBe('Practice');
  });
  it('detects Practice by "nets" keyword', () => {
    expect(detectLeagueFromLabel('Nets — Saturday session')).toBe('Practice');
  });
  it('falls back to Other for unknown labels', () => {
    expect(detectLeagueFromLabel('Friendly vs XYZ')).toBe('Other');
  });
  it('handles empty / null inputs gracefully', () => {
    expect(detectLeagueFromLabel('')).toBe('Other');
  });
});

describe('getPlayingXI', () => {
  it('orders players by batting order ascending', () => {
    const squad = [
      player({ email: 'a', battingOrder: 3 }),
      player({ email: 'b', battingOrder: 1 }),
      player({ email: 'c', battingOrder: 2 }),
    ];
    const xi = getPlayingXI(squad);
    expect(xi.map((p) => p.email)).toEqual(['b', 'c', 'a']);
  });

  it('excludes twelfth man (batting order 12) from XI', () => {
    const squad = [
      ...Array.from({ length: 11 }, (_, i) => player({ email: `p${i + 1}`, battingOrder: i + 1 })),
      player({ email: '12th', battingOrder: 12 }),
    ];
    const xi = getPlayingXI(squad);
    expect(xi).toHaveLength(11);
    expect(xi.find((p) => p.email === '12th')).toBeUndefined();
  });

  it('caps result at 11 even if more players are assigned batting orders', () => {
    const squad = Array.from({ length: 13 }, (_, i) => player({ email: `p${i + 1}`, battingOrder: i + 1 }));
    const xi = getPlayingXI(squad);
    expect(xi).toHaveLength(11);
  });
});

describe('getTwelfthMan', () => {
  it('returns the player with batting order 12', () => {
    const squad = [
      player({ email: 'a', battingOrder: 1 }),
      player({ email: '12th', battingOrder: 12 }),
    ];
    expect(getTwelfthMan(squad)?.email).toBe('12th');
  });

  it('returns undefined when no twelfth man is assigned', () => {
    expect(getTwelfthMan([])).toBeUndefined();
  });
});

describe('validatePlan', () => {
  it('flags missing match id', () => {
    const plan = basePlan({ matchId: '' });
    expect(validatePlan(plan)).toContain('Match not selected');
  });

  it('flags missing captain + VC', () => {
    const plan = basePlan({ captainName: '', vcName: '' });
    const issues = validatePlan(plan);
    expect(issues).toContain('Captain not named');
    expect(issues).toContain('Vice-captain not named');
  });

  it('flags squad smaller than 11', () => {
    const squad = Array.from({ length: 5 }, (_, i) => player({ email: `p${i}`, battingOrder: i + 1, isWicketkeeper: i === 0 }));
    const plan = basePlan({ squad });
    expect(validatePlan(plan).some((s) => s.includes('need at least 11'))).toBe(true);
  });

  it('flags squad larger than 12', () => {
    const squad = Array.from({ length: 13 }, (_, i) => player({ email: `p${i}`, battingOrder: ((i % 11) + 1), isWicketkeeper: i === 0 }));
    const plan = basePlan({ squad });
    expect(validatePlan(plan).some((s) => s.includes('max is 12'))).toBe(true);
  });

  it('flags duplicate batting orders', () => {
    const squad = [
      player({ email: 'a', battingOrder: 1, isWicketkeeper: true }),
      player({ email: 'b', battingOrder: 1 }), // duplicate
      ...Array.from({ length: 9 }, (_, i) => player({ email: `p${i}`, battingOrder: i + 2 })),
    ];
    const plan = basePlan({ squad });
    expect(validatePlan(plan).some((s) => s.includes('Duplicate batting orders'))).toBe(true);
  });

  it('flags missing wicketkeeper', () => {
    const squad = Array.from({ length: 11 }, (_, i) => player({ email: `p${i}`, battingOrder: i + 1 }));
    const plan = basePlan({ squad });
    expect(validatePlan(plan)).toContain('No wicketkeeper assigned');
  });

  it('flags multiple wicketkeepers', () => {
    const squad = Array.from({ length: 11 }, (_, i) => player({ email: `p${i}`, battingOrder: i + 1, isWicketkeeper: i < 2 }));
    const plan = basePlan({ squad });
    expect(validatePlan(plan).some((s) => s.includes('Multiple wicketkeepers'))).toBe(true);
  });

  it('flags missing mindset word', () => {
    const plan = basePlan({ mindsetWord: undefined });
    expect(validatePlan(plan)).toContain('Team mindset word not set');
  });

  it('returns empty array for a complete plan', () => {
    const squad = Array.from({ length: 11 }, (_, i) =>
      player({ email: `p${i}`, playerName: `Player ${i}`, battingOrder: i + 1, isWicketkeeper: i === 0 }),
    );
    const plan = basePlan({ squad });
    expect(validatePlan(plan)).toEqual([]);
  });
});

describe('getLeadership', () => {
  it('returns Tarek + Saad for LPL', () => {
    const l = getLeadership('LPL');
    expect(l.captainName).toBe('Tarek Islam');
    expect(l.vcName).toBe('Mohammed Saad');
  });

  it('returns Shahriar + Ankush for LCL', () => {
    const l = getLeadership('LCL');
    expect(l.captainName).toBe('Syed Shahriar');
    expect(l.vcName).toBe('Ankush Arora');
  });

  it('returns empty names for Practice (user fills in manually)', () => {
    const l = getLeadership('Practice');
    expect(l.captainName).toBe('');
    expect(l.vcName).toBe('');
  });

  it('returns empty names for Other (user fills in manually)', () => {
    const l = getLeadership('Other');
    expect(l.captainName).toBe('');
    expect(l.vcName).toBe('');
  });
});

describe('buildHuddleScript', () => {
  it('includes the mindset word', () => {
    const plan = basePlan({ mindsetWord: 'Calm' });
    const lines = buildHuddleScript(plan);
    expect(lines.join(' ').toLowerCase()).toContain('calm');
  });

  it('includes the team target when set', () => {
    const plan = basePlan({ teamTarget: 175 });
    const lines = buildHuddleScript(plan);
    expect(lines.join(' ')).toContain('175');
  });

  it('lists the openers when XI is complete', () => {
    const squad = [
      player({ email: 'o1', playerName: 'Alice', battingOrder: 1 }),
      player({ email: 'o2', playerName: 'Bob', battingOrder: 2 }),
      ...Array.from({ length: 9 }, (_, i) => player({ email: `p${i}`, playerName: `P${i}`, battingOrder: i + 3 })),
    ];
    const plan = basePlan({ squad });
    const lines = buildHuddleScript(plan);
    expect(lines.join(' ')).toContain('Alice');
    expect(lines.join(' ')).toContain('Bob');
  });

  it('lists opening bowlers when assigned', () => {
    const squad = [
      player({ email: 'o1', playerName: 'Alice', battingOrder: 1, bowlingRole: 'opening' }),
      player({ email: 'o2', playerName: 'Bob', battingOrder: 2, bowlingRole: 'opening' }),
      ...Array.from({ length: 9 }, (_, i) => player({ email: `p${i}`, playerName: `P${i}`, battingOrder: i + 3 })),
    ];
    const plan = basePlan({ squad });
    const lines = buildHuddleScript(plan);
    expect(lines.join(' ').toLowerCase()).toContain('opening with the ball');
  });

  it('produces a non-empty fallback when no fields are set', () => {
    const plan = basePlan({ mindsetWord: undefined, teamTarget: undefined, processFocuses: undefined, squad: [] });
    const lines = buildHuddleScript(plan);
    expect(lines.length).toBeGreaterThan(0);
  });

  it('joins process focuses into one line when present', () => {
    const plan = basePlan({ processFocuses: ['Watch the ball', 'Rotate strike', 'Trust the plan'] });
    const lines = buildHuddleScript(plan);
    const focusLine = lines.find((l) => l.toLowerCase().includes('process focuses'));
    expect(focusLine).toContain('Watch the ball');
    expect(focusLine).toContain('Rotate strike');
    expect(focusLine).toContain('Trust the plan');
  });
});
