// registrationAdvice.ts — rule-based guidance for the public 2027 registration
// form. Deterministic and LLM-free, same contract as the coaching modules in
// app/c3h/lib: pure functions, no I/O, unit-tested in tests/registrationAdvice.test.ts.
//
// The point of this module is to say out loud, before someone pays, the thing
// that a season of running the club taught us: people commit in the winter to a
// number of matches their actual life will not allow in July. Almost every
// drop-out traces back to a weekend commitment nobody checked at sign-up.

import { requiredForLeague } from '@/app/c3h/lib/playerTracker';

/** T30 fixtures across both leagues in 2026 — the working basis until the
 *  2027 schedules are published. Matches T30_FIXTURES in join/TierCalculator. */
export const T30_FIXTURES = 26;

/** At or above this share of T30 fixtures, a member is full season. */
export const FULL_SEASON_THRESHOLD = 0.5;

export const PART_SEASON_FEE = 150;
export const FULL_SEASON_TOPUP = 150;

/** 2026 fixtures that fell on a Saturday or Sunday, out of 33 played across all
 *  three competitions. The three weekday fixtures were all public holidays
 *  (Victoria Day, Canada Day, Labour Day). Counted from app/schedule/page.tsx. */
export const WEEKEND_FIXTURES_2026 = 30;
export const TOTAL_FIXTURES_2026 = 33;

/** How much of the player's weekend a 2027 commitment has to survive. */
export type WeekendAvailability = 'free' | 'some' | 'most' | '';

/** What they will be doing in 2027 — context for us, not a filter. */
export type WorkPattern = 'full-time' | 'part-time' | 'shift' | 'student' | 'other' | '';

/**
 * The answer strings submitted to Google Forms, and the code each maps to.
 *
 * These labels are the single source of truth for BOTH sides of the wire: the
 * <option> values on the form and the choices in the Google Form question must
 * be character-for-character identical, or Google rejects the response — and a
 * hidden-iframe POST gives no error when it does. scripts/setup-registration-form.gs
 * builds the Google Form questions from these same strings.
 *
 * Deliberately plain ASCII: an em dash or a curly quote that survives one copy
 * and not the other is an outage you cannot see.
 */
export const WEEKEND_OPTIONS: ReadonlyArray<{
  label: string;
  code: Exclude<WeekendAvailability, ''>;
}> = [
  { label: 'No, my weekends are generally free', code: 'free' },
  { label: 'Some weekends, one or two a month', code: 'some' },
  { label: 'Yes, I work most weekends', code: 'most' },
];

export const WORK_PATTERN_OPTIONS: ReadonlyArray<{
  label: string;
  code: Exclude<WorkPattern, ''>;
}> = [
  { label: 'Working full time', code: 'full-time' },
  { label: 'Working part time', code: 'part-time' },
  { label: 'Shift work or a rotating roster', code: 'shift' },
  { label: 'Studying', code: 'student' },
  { label: 'Something else', code: 'other' },
];

/** Map a submitted label back to its code. Unknown input is treated as unset. */
export function weekendCodeFor(label: string): WeekendAvailability {
  return WEEKEND_OPTIONS.find((o) => o.label === label)?.code ?? '';
}

export function workPatternCodeFor(label: string): WorkPattern {
  return WORK_PATTERN_OPTIONS.find((o) => o.label === label)?.code ?? '';
}

export interface AdviceInput {
  /** Matches out of T30_FIXTURES they say they can commit to. */
  gamesCommitted: number;
  /** How many weekends their work takes away. */
  weekendAvailability: WeekendAvailability;
  workPattern: WorkPattern;
}

export interface Advice {
  tier: 'part' | 'full';
  tierLabel: string;
  /** Paid at registration, always. */
  feeNow: number;
  /** Paid in March 2027 if they go full season; 0 otherwise. */
  feeLater: number;
  feeTotal: number;
  headline: string;
  body: string;
  /** Playoff eligibility, in the league's own thresholds. */
  playoff: string;
  /** Raised when the stated availability and the stated commitment disagree.
   *  This is the one that actually saves a season. */
  caution?: string;
}

const pct = (games: number): number => Math.round((games / T30_FIXTURES) * 100);

/** Weekend share as a percentage, e.g. 91. */
export const weekendSharePct = (): number =>
  Math.round((WEEKEND_FIXTURES_2026 / TOTAL_FIXTURES_2026) * 100);

/**
 * The realistic ceiling on matches for someone whose work takes weekends.
 * Deliberately blunt: if you lose most weekends, you are a part-season player,
 * and there is nothing wrong with that — it is what the $150 tier is for.
 */
function ceilingFor(availability: WeekendAvailability): number | null {
  if (availability === 'most') return 6;
  if (availability === 'some') return 16;
  return null;
}

/** LCL T30 played 14 fixtures in 2026; LPL T30 played 12. */
const LCL_T30_2026 = 14;

export function buildAdvice(input: AdviceInput): Advice {
  const games = Math.max(0, Math.min(T30_FIXTURES, Math.round(input.gamesCommitted)));
  const isFull = games / T30_FIXTURES >= FULL_SEASON_THRESHOLD;

  const lclNeeded = requiredForLeague('LCL T30', LCL_T30_2026);
  const lplNeeded = requiredForLeague('LPL T30', 12);

  const advice: Advice = {
    tier: isFull ? 'full' : 'part',
    tierLabel: isFull ? 'Full Season' : 'Part Season',
    feeNow: PART_SEASON_FEE,
    feeLater: isFull ? FULL_SEASON_TOPUP : 0,
    feeTotal: isFull ? PART_SEASON_FEE + FULL_SEASON_TOPUP : PART_SEASON_FEE,
    headline: isFull
      ? `${games} of ${T30_FIXTURES} matches — you are a Full Season player`
      : `${games} of ${T30_FIXTURES} matches — Part Season suits you`,
    body: isFull
      ? `That is ${pct(games)}% of the T30 season. You pay $${PART_SEASON_FEE} now to register, and we will come back to you in March 2027 for the remaining $${FULL_SEASON_TOPUP} once the fixture lists are out.`
      : `That is ${pct(games)}% of the T30 season. You pay $${PART_SEASON_FEE} now and nothing further — you still get indoor winter nets, the jersey queue and full access to the members portal.`,
    playoff: isFull
      ? `At this level of availability you should clear both leagues' playoff thresholds — ${lclNeeded} of ${LCL_T30_2026} in the LCL and ${lplNeeded} of 12 in the LPL, on 2026 numbers.`
      : `Heads up: league playoff eligibility needs ${lclNeeded} of ${LCL_T30_2026} matches in the LCL or ${lplNeeded} of 12 in the LPL, so at this level you may not be available for knockout matches.`,
  };

  // ── the cross-check ───────────────────────────────────────────────────
  const ceiling = ceilingFor(input.weekendAvailability);

  if (games === 0) {
    advice.caution =
      'You have set this to zero. Talk to us before you pay anything — we would rather find an arrangement that works than take a fee you get nothing back from.';
  } else if (ceiling !== null && games > ceiling) {
    const lost =
      input.weekendAvailability === 'most'
        ? 'you work most weekends'
        : 'you work some weekends';
    advice.caution =
      `You have committed to ${games} matches but told us ${lost}. ${weekendSharePct()}% of our 2026 fixtures were on a Saturday or Sunday, so those two answers are hard to reconcile. ` +
      `In our experience this is the single most common reason a season goes wrong — not injury, not form, but a weekend commitment nobody checked in January. ` +
      `Please put the number you can genuinely make, even if it is low. A reliable ${Math.min(ceiling, games)} is worth far more to the side than an optimistic ${games}.`;
  } else if (games >= T30_FIXTURES - 2) {
    advice.caution =
      `Almost every match is a big commitment — nobody in our 2026 squad played all ${T30_FIXTURES}. Weather, work and travel take a few out of everyone's season, so it is worth leaving yourself some room.`;
  }

  return advice;
}
