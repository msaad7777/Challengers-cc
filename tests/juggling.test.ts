import { describe, it, expect } from 'vitest';
import {
  JUGGLING_LEVELS,
  JUGGLING_TOTAL,
  nextJugglingTarget,
  canClearLevel,
} from '@/app/c3h/lib/juggling';

describe('juggling levels', () => {
  it('has 8 levels, sequentially numbered, with unique names', () => {
    expect(JUGGLING_TOTAL).toBe(8);
    JUGGLING_LEVELS.forEach((l, i) => expect(l.level).toBe(i + 1));
    expect(new Set(JUGGLING_LEVELS.map((l) => l.name)).size).toBe(8);
  });

  it('has Level 1 fully detailed with steps + mastery', () => {
    const l1 = JUGGLING_LEVELS[0];
    expect(l1.detailed).toBe(true);
    expect(l1.how && l1.how.length).toBeGreaterThan(0);
    expect(l1.mastery).toBeTruthy();
  });

  it('leaves later levels as not-yet-detailed', () => {
    expect(JUGGLING_LEVELS[2].detailed).toBe(false); // Level 3 not captured yet
  });
});

describe('nextJugglingTarget', () => {
  it('targets level 1 before anything is cleared', () => {
    expect(nextJugglingTarget(0)).toBe(1);
  });
  it('advances with cleared level and caps at the total', () => {
    expect(nextJugglingTarget(3)).toBe(4);
    expect(nextJugglingTarget(8)).toBe(8);
  });
});

describe('canClearLevel', () => {
  it('allows clearing the current detailed target', () => {
    expect(canClearLevel(JUGGLING_LEVELS[0], 0)).toBe(true);
  });
  it('blocks a non-target level', () => {
    expect(canClearLevel(JUGGLING_LEVELS[0], 1)).toBe(false); // already cleared
  });
  it('blocks a level with no instructions yet', () => {
    // Level 3 is the target after clearing 2, but it isn't detailed yet.
    expect(canClearLevel(JUGGLING_LEVELS[2], 2)).toBe(false);
  });
});
