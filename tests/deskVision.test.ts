import { describe, it, expect } from 'vitest';
import {
  VISION_SOURCES,
  DESK_DRILLS,
  DESK_WEEK,
  INDOOR_CUES,
  MATCH_DAY_CUES,
  COMBINED_VERSIONS,
  JULIAN_WOOD_LESSONS,
  EVIDENCE_LIMITS,
  DESK_SAFETY,
  dayMinutes,
  combinedMinutes,
  deskDrillById,
  sourceById,
  sourceUrl,
  weekdayFromIndex,
} from '@/app/c3h/lib/deskVision';
import { drillById } from '@/app/c3h/lib/strikingDrills';

describe('VISION_SOURCES', () => {
  it('lists all nine videos and the newsletter', () => {
    expect(VISION_SOURCES.filter((s) => s.videoId).length).toBe(9);
    expect(VISION_SOURCES.filter((s) => !s.videoId).map((s) => s.id)).toEqual(['newsletter']);
  });

  it('says what was taken from every source', () => {
    expect(VISION_SOURCES.every((s) => s.used.length > 0)).toBe(true);
  });

  it('builds timestamped links, and none for the newsletter', () => {
    expect(sourceUrl(sourceById('hit-harder'), 133)).toBe('https://www.youtube.com/watch?v=zpJHQ_NifLA&t=133s');
    expect(sourceUrl(sourceById('hit-harder'))).toBe('https://www.youtube.com/watch?v=zpJHQ_NifLA');
    expect(sourceUrl(sourceById('newsletter'))).toBeNull();
  });

  it('throws on an unknown source', () => {
    // @ts-expect-error deliberately not a SourceId
    expect(() => sourceById('nope')).toThrow();
  });
});

describe('DESK_DRILLS', () => {
  it('credits a source on every drill', () => {
    expect(DESK_DRILLS.every((d) => d.sources.length > 0)).toBe(true);
  });

  it('marks anything from another sport as adapted', () => {
    for (const d of DESK_DRILLS) {
      const onlyCricket = d.sources.every((s) => sourceById(s.id).sport === 'Cricket');
      if (!onlyCricket && d.id !== 'far-near') expect(d.adaptation, d.id).not.toBeNull();
    }
  });

  it('never requires the paid glasses', () => {
    for (const d of DESK_DRILLS) {
      expect(d.equipment.toLowerCase()).not.toContain('glasses');
      expect(d.steps.join(' ').toLowerCase()).not.toContain('glasses');
    }
  });

  it('keeps the bottle cap hold at 5 seconds, as the source teaches it', () => {
    expect(deskDrillById('bottle-cap').steps.join(' ')).toContain('5 seconds');
  });

  it('throws on an unknown drill', () => {
    expect(() => deskDrillById('nope')).toThrow();
  });
});

describe('DESK_WEEK', () => {
  it('runs Monday to Friday', () => {
    expect(DESK_WEEK.map((d) => d.day)).toEqual(['mon', 'tue', 'wed', 'thu', 'fri']);
  });

  it('points only at real drills', () => {
    for (const d of DESK_WEEK) {
      for (const id of [...d.morning, ...d.breakTime]) expect(() => deskDrillById(id), id).not.toThrow();
    }
  });

  it('stays short enough for a work day', () => {
    for (const d of DESK_WEEK) {
      const total = dayMinutes(d) + (d.combined ? combinedMinutes(COMBINED_VERSIONS[0]) : 0);
      expect(total, d.day).toBeLessThanOrEqual(15);
    }
  });

  it('keeps full-intent swings out of Friday', () => {
    expect(DESK_WEEK.find((d) => d.day === 'fri')?.combined).toBe(false);
  });

  it('maps weekdays and returns null on weekends', () => {
    expect(weekdayFromIndex(1)).toBe('mon');
    expect(weekdayFromIndex(5)).toBe('fri');
    expect(weekdayFromIndex(0)).toBeNull();
    expect(weekdayFromIndex(6)).toBeNull();
  });
});

describe('warm-up cues', () => {
  it('has indoor and match-day cues pointing at real drills', () => {
    for (const c of [...INDOOR_CUES, ...MATCH_DAY_CUES]) {
      if (c.drillId) expect(() => deskDrillById(c.drillId as string)).not.toThrow();
    }
    expect(INDOOR_CUES.length).toBeGreaterThan(0);
    expect(MATCH_DAY_CUES.length).toBeGreaterThan(0);
  });
});

describe('combined drill', () => {
  it('has a home and an indoor version', () => {
    expect(COMBINED_VERSIONS.map((v) => v.id)).toEqual(['home', 'indoor']);
  });

  it('says where every step came from', () => {
    for (const v of COMBINED_VERSIONS) expect(v.steps.every((s) => s.origin.length > 0)).toBe(true);
  });

  it('credits Julian Wood for a colour ball drill that really exists', () => {
    expect(() => drillById('colour-ball-leave-or-hit')).not.toThrow();
    const origins = COMBINED_VERSIONS.flatMap((v) => v.steps.map((s) => s.origin)).join(' ');
    expect(origins).toContain('Julian Wood');
  });
});

describe('Julian Wood lessons slot', () => {
  it('stays empty until the lessons are shared', () => {
    expect(JULIAN_WOOD_LESSONS).toEqual([]);
  });
});

describe('evidence and safety', () => {
  it('keeps the limits that stop this overclaiming', () => {
    const joined = EVIDENCE_LIMITS.join(' ');
    expect(joined).toContain('.251');
    expect(joined).toContain('cannot show');
    expect(joined).toContain('Nobody can promise');
  });

  it('tells players to stop and see an eye professional', () => {
    expect(DESK_SAFETY).toMatch(/not medical advice/);
    expect(DESK_SAFETY).toMatch(/eye strain/);
    expect(DESK_SAFETY).toMatch(/headache/);
    expect(DESK_SAFETY).toMatch(/known eye condition/);
    expect(DESK_SAFETY).toMatch(/eye professional/);
  });
});
