// Player-aware match analysis + rule-based coach feedback.
//
// Pure functions. Operates on a Match document and a player name.
// Rule-based feedback (no LLM call) so it works offline, has zero
// per-request cost, and is deterministic / auditable. The coaching
// rules below codify the kind of thing a captain or coach would
// actually say after a match — keyed off dismissal type, strike
// rate vs team SR, economy vs team econ, dot-ball pressure, and
// position-relative par-score expectations.

import type { Match, Innings, BallEvent } from '../scorer/types';

// ── Player identity resolution ──────────────────────────────────

// Find the player name as it appears in match rosters from the
// session user. Tries exact match, case-insensitive match, and
// substring matches against both the user's display name and the
// local-part of their email. Returns null if no unique match.
export function findPlayerName(
  sessionName: string | null | undefined,
  sessionEmail: string | null | undefined,
  rosters: { name: string }[],
): string | null {
  if (rosters.length === 0) return null;
  const candidates = rosters.map(p => p.name);

  const tryStrings: string[] = [];
  if (sessionName) tryStrings.push(sessionName);
  if (sessionEmail) {
    const local = sessionEmail.split('@')[0];
    tryStrings.push(local);
    // 'mohammed.saad' → 'Mohammed Saad', 'mbadru3434' → no useful split
    if (local.includes('.')) tryStrings.push(local.replace(/\./g, ' '));
  }

  // 1. exact case-sensitive
  for (const s of tryStrings) {
    const exact = candidates.find(c => c === s);
    if (exact) return exact;
  }
  // 2. exact case-insensitive
  for (const s of tryStrings) {
    const ci = candidates.find(c => c.toLowerCase() === s.toLowerCase());
    if (ci) return ci;
  }
  // 3. substring (one direction or the other) — only if a unique candidate matches
  for (const s of tryStrings) {
    const s_lc = s.toLowerCase();
    const matches = candidates.filter(
      c => c.toLowerCase().includes(s_lc) || s_lc.includes(c.toLowerCase()),
    );
    if (matches.length === 1) return matches[0];
  }
  return null;
}

// Get the union of all C3H roster names across a list of matches —
// used as the candidate set for player-identity resolution.
export function rostersFromMatches(matches: Match[], clubName: string): { name: string }[] {
  const seen = new Set<string>();
  const out: { name: string }[] = [];
  for (const m of matches) {
    const ours = m.team1 === clubName ? m.team1Players :
                 m.team2 === clubName ? m.team2Players :
                 [];
    for (const p of ours) {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        out.push({ name: p.name });
      }
    }
  }
  return out;
}

// ── Per-match performance extraction ────────────────────────────

export interface PlayerBattingLine {
  played: boolean;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
  isOut: boolean;
  howOut: string;
  wicketType: string;
  position: number;            // 1-indexed batting order
  bowlerWhoDismissed: string;  // empty if not out / not credited
}

export interface PlayerBowlingLine {
  bowled: boolean;
  balls: number;
  oversDisplay: string;
  runs: number;
  wickets: number;
  maidens: number;
  dots: number;
  economy: number;
  wides: number;
  noballs: number;
}

export interface PlayerFieldingLine {
  catches: number;
  stumpings: number;
  runOuts: number;
}

export interface PlayerInMatch {
  match: Match;
  battingTeam: string;
  bowlingTeam: string;
  // Combined across both innings (e.g., a player who batted in one
  // and bowled in the other has both lines populated). For practice
  // matches where players rotate teams, the combined view is what
  // they care about.
  batting: PlayerBattingLine;
  bowling: PlayerBowlingLine;
  fielding: PlayerFieldingLine;
}

function extractBatting(playerName: string, innings: Innings): PlayerBattingLine {
  const empty: PlayerBattingLine = {
    played: false, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0,
    isOut: false, howOut: '', wicketType: '', position: 0, bowlerWhoDismissed: '',
  };
  if (!innings || innings.balls.length === 0) return empty;

  // Batting position: order they came to the crease (first ball faced)
  const seen: string[] = [];
  for (const b of innings.balls) {
    if (b.batter && !seen.includes(b.batter)) seen.push(b.batter);
    if (b.isWicket && b.dismissedPlayer && !seen.includes(b.dismissedPlayer)) seen.push(b.dismissedPlayer);
  }
  const position = seen.indexOf(playerName) + 1;
  if (position === 0) return empty;

  let runs = 0, balls = 0, fours = 0, sixes = 0;
  let isOut = false, howOut = '', wicketType = '', bowlerWhoDismissed = '';
  for (const b of innings.balls) {
    if (b.batter === playerName) {
      if (b.extraType !== 'wide') balls++;
      if (!b.extraType || b.extraType === 'noball') {
        runs += b.runs;
        if (b.isBoundary) fours++;
        if (b.isSix) sixes++;
      }
    }
    if (b.isWicket && b.dismissedPlayer === playerName) {
      isOut = true;
      wicketType = b.wicketType;
      // Match dismissal-text convention from matchStats
      howOut = wicketType === 'Retired Out' || wicketType === 'Retired Hurt'
        ? wicketType
        : wicketType === 'Run Out'
          ? wicketType + (b.fielder ? ` (${b.fielder})` : '')
          : wicketType + (b.fielder ? ` (${b.fielder})` : '') + (b.bowler ? ` b ${b.bowler}` : '');
      // Bowler credit only for non-Run-Out / non-Retired wickets
      if (!['Run Out', 'Retired Out', 'Retired Hurt'].includes(wicketType)) {
        bowlerWhoDismissed = b.bowler || '';
      }
    }
  }

  return {
    played: balls > 0 || isOut,
    runs, balls, fours, sixes,
    sr: balls > 0 ? Math.round((runs / balls) * 1000) / 10 : 0,
    isOut, howOut, wicketType, position, bowlerWhoDismissed,
  };
}

function extractBowling(playerName: string, innings: Innings): PlayerBowlingLine {
  const empty: PlayerBowlingLine = {
    bowled: false, balls: 0, oversDisplay: '0.0', runs: 0, wickets: 0,
    maidens: 0, dots: 0, economy: 0, wides: 0, noballs: 0,
  };
  if (!innings || innings.balls.length === 0) return empty;

  let balls = 0, runs = 0, wickets = 0, dots = 0, wides = 0, noballs = 0;
  const byOver: Record<number, BallEvent[]> = {};

  for (const b of innings.balls) {
    if (b.bowler !== playerName) continue;
    runs += b.runs + b.extras;
    if (b.extraType !== 'wide' && b.extraType !== 'noball') balls++;
    if (b.isWicket && !['Run Out', 'Retired Out', 'Retired Hurt'].includes(b.wicketType)) wickets++;
    if (b.isDotBall && !b.extraType) dots++;
    if (b.extraType === 'wide') wides++;
    if (b.extraType === 'noball') noballs++;
    if (!byOver[b.over]) byOver[b.over] = [];
    byOver[b.over].push(b);
  }
  if (balls === 0) return empty;

  // Maidens: any over where this bowler bowled all 6 legal balls and
  // conceded 0 total (incl. extras).
  let maidens = 0;
  for (const overBalls of Object.values(byOver)) {
    const legal = overBalls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball');
    if (legal.length !== 6) continue;
    const overRuns = overBalls.reduce((s, b) => s + b.runs + b.extras, 0);
    if (overRuns === 0) maidens++;
  }

  return {
    bowled: true, balls, runs, wickets, maidens, dots, wides, noballs,
    oversDisplay: `${Math.floor(balls / 6)}.${balls % 6}`,
    economy: Math.round((runs / (balls / 6)) * 100) / 100,
  };
}

function extractFielding(playerName: string, innings: Innings): PlayerFieldingLine {
  const empty: PlayerFieldingLine = { catches: 0, stumpings: 0, runOuts: 0 };
  if (!innings || innings.balls.length === 0) return empty;
  let catches = 0, stumpings = 0, runOuts = 0;
  for (const b of innings.balls) {
    if (!b.isWicket || b.fielder !== playerName) continue;
    if (b.wicketType === 'Caught' || b.wicketType === 'Caught & Bowled') catches++;
    else if (b.wicketType === 'Stumped') stumpings++;
    else if (b.wicketType === 'Run Out') runOuts++;
  }
  return { catches, stumpings, runOuts };
}

export function extractPlayerInMatch(playerName: string, match: Match): PlayerInMatch | null {
  // The player might have batted in either innings (practice rotation),
  // bowled in either, fielded in either. Combine across both.
  const innings = [match.innings1, match.innings2];
  let battingLine: PlayerBattingLine = {
    played: false, runs: 0, balls: 0, fours: 0, sixes: 0, sr: 0,
    isOut: false, howOut: '', wicketType: '', position: 0, bowlerWhoDismissed: '',
  };
  let bowlingLine: PlayerBowlingLine = {
    bowled: false, balls: 0, oversDisplay: '0.0', runs: 0, wickets: 0,
    maidens: 0, dots: 0, economy: 0, wides: 0, noballs: 0,
  };
  let fieldingLine: PlayerFieldingLine = { catches: 0, stumpings: 0, runOuts: 0 };

  // Take the first innings where they batted (most players bat once)
  for (const inn of innings) {
    const bat = extractBatting(playerName, inn);
    if (bat.played) { battingLine = bat; break; }
  }
  // Combine bowling across both innings (same player can bowl in either)
  for (const inn of innings) {
    const bowl = extractBowling(playerName, inn);
    if (bowl.bowled) {
      bowlingLine.bowled = true;
      bowlingLine.balls += bowl.balls;
      bowlingLine.runs += bowl.runs;
      bowlingLine.wickets += bowl.wickets;
      bowlingLine.maidens += bowl.maidens;
      bowlingLine.dots += bowl.dots;
      bowlingLine.wides += bowl.wides;
      bowlingLine.noballs += bowl.noballs;
    }
  }
  if (bowlingLine.bowled) {
    bowlingLine.oversDisplay = `${Math.floor(bowlingLine.balls / 6)}.${bowlingLine.balls % 6}`;
    bowlingLine.economy = bowlingLine.balls > 0
      ? Math.round((bowlingLine.runs / (bowlingLine.balls / 6)) * 100) / 100
      : 0;
  }
  // Combine fielding across both innings
  for (const inn of innings) {
    const f = extractFielding(playerName, inn);
    fieldingLine.catches += f.catches;
    fieldingLine.stumpings += f.stumpings;
    fieldingLine.runOuts += f.runOuts;
  }

  if (!battingLine.played && !bowlingLine.bowled && fieldingLine.catches + fieldingLine.stumpings + fieldingLine.runOuts === 0) {
    return null; // didn't actually participate
  }

  // battingTeam = team the player batted with
  let battingTeam = '';
  let bowlingTeam = '';
  for (const inn of innings) {
    if (inn.balls.some(b => b.batter === playerName)) {
      battingTeam = inn.battingTeam;
      bowlingTeam = inn.bowlingTeam;
      break;
    }
  }
  // Fallback for bowlers who didn't bat
  if (!battingTeam) {
    for (const inn of innings) {
      if (inn.balls.some(b => b.bowler === playerName)) {
        battingTeam = inn.bowlingTeam;
        bowlingTeam = inn.battingTeam;
        break;
      }
    }
  }

  return {
    match, battingTeam, bowlingTeam,
    batting: battingLine, bowling: bowlingLine, fielding: fieldingLine,
  };
}

// ── Coach feedback (rule-based) ─────────────────────────────────

export interface CoachFeedback {
  summary: string;          // one-line takeaway
  strengths: string[];      // 0-3 bullets
  improvements: string[];   // 0-4 bullets — what to work on
  howShouldHavePlayed: string; // narrative paragraph
  drills: string[];         // 0-3 specific drills/principles
}

// Coaching tip per dismissal type — what the coach would say if you
// got out this way. Generic enough that it applies regardless of
// match context but specific enough to be actionable next session.
const DISMISSAL_COACHING: Record<string, { mistake: string; fix: string; drill: string }> = {
  'Bowled': {
    mistake: 'Bat-pad gap or you played around the line. Most likely the ball came through the gate between bat and pad.',
    fix: 'Keep your head over the ball and bring the bat down straight. If the ball is in line with the stumps, defence first; never play across the line to a straight ball.',
    drill: 'Front-foot defence drill — 30 balls on a length, bat-and-pad close together, head over the ball. Then do 30 with a ball-tracker (phone or coach call).',
  },
  'Caught — Slips/Gully': {
    mistake: 'Edged outside off — you reached for a ball you should have left alone, or pushed at it instead of leaving with soft hands.',
    fix: 'Build a leave shot. If the ball is wide of off stump and you don\'t need to score from it, leave it. Nothing kills a slip catch like a confident leave.',
    drill: 'Leave drill — ask the bowler to bowl 6 outside off; leave each one. Repeat 4 sets. Train the head to NOT play.',
  },
  'Caught — Boundary': {
    mistake: 'Big shot at the wrong moment, or against a ball that wasn\'t there for the shot. You went for the boundary too early or off a good ball.',
    fix: 'Earn your boundary. Wait for the bad ball — short, full half-volley, wide. Don\'t manufacture the big shot from a length delivery.',
    drill: 'Shot-selection drill — coach calls "leave / defend / push / drive / loft" before each ball. Match call to length. 30 balls.',
  },
  'Caught — Keeper': {
    mistake: 'Edge or thin nick. You pushed at the ball rather than letting it come.',
    fix: 'Soft hands. Let the ball come to you. If the line is outside off, you can leave it.',
    drill: 'Soft-hands drill — defend with the bat handle held loose, not gripped. Watch the ball into the bat.',
  },
  'Caught — Infield': {
    mistake: 'Mistimed lofted shot. You hit it in the air to a fielder in the ring.',
    fix: 'If a fielder is up in the ring, don\'t loft over them. Pick a different gap or stay along the ground.',
    drill: 'Hitting along the ground — 30 balls, every shot must stay below knee height. Forces you to keep elbow up and head down.',
  },
  'Caught — Hit straight to fielder': {
    mistake: 'Top edge or poor placement — you hit it straight to a fielder who was right there.',
    fix: 'Watch the field before each ball. Know where the gaps are. Don\'t hit aerial unless the field is back.',
    drill: 'Field-reading drill — name three gaps after looking at the field for 5 seconds. Then play accordingly.',
  },
  'LBW': {
    mistake: 'Played around the front pad or got hit on the pad in line with the stumps. Bat wasn\'t in line with pad.',
    fix: 'Bat next to pad, not behind. If the ball is straight, get bat in line. If you\'re unsure, leave on length.',
    drill: 'Pad-bat alignment — defend with feet planted, bat coming down NEXT to the pad not behind it. 30 balls.',
  },
  'Run Out': {
    mistake: 'Communication / calling broke down. You and your partner were on different pages.',
    fix: 'Loud, clear, decisive calls — YES / NO / WAIT. Never half-walk; commit or hold. Look at the fielder before calling.',
    drill: 'Running between wickets drill — pairs running 1s and 2s, must call every run loudly. 5 minutes.',
  },
  'Stumped': {
    mistake: 'Footwork came too far forward against spin and the keeper had time to take and stump. You were beaten in the air or off the pitch.',
    fix: 'If you\'re going forward to spin, get to the pitch of the ball. If you can\'t, stay back. Half-forward is the worst place.',
    drill: 'Footwork drill against spin — coach throws short or full; you must commit fully forward or fully back, never in between.',
  },
  'Hit Wicket': {
    mistake: 'Lost balance and clipped the stumps with your bat or foot. Set-up too close to the stumps or weight transfer broke down.',
    fix: 'Set up with a stable base. Keep your back leg outside leg stump. Watch where your bat goes on the follow-through.',
    drill: 'Stance drill — practise your stance with your back leg deliberately just outside leg stump. Get the muscle memory.',
  },
  'Retired Out': {
    mistake: 'You retired voluntarily, which counts as a wicket against the team.',
    fix: 'Only retire if there\'s a tactical reason (rotating practice, injury, time-up). Don\'t retire just because you got out in your head.',
    drill: 'No drill — this is a captaincy / tactical choice, not a technique fix.',
  },
  'Retired Hurt': {
    mistake: 'You came off injured. Not a technique issue — get treated.',
    fix: 'See a physio. Don\'t play through an injury that compromises your technique — that\'s when bigger injuries happen.',
    drill: 'Recovery and conditioning. Strength work for the affected area before returning to full training.',
  },
};

export function generateCoachFeedback(
  perf: PlayerInMatch,
  teamSrInBattingInnings: number,
  teamEconInBowlingInnings: number,
): CoachFeedback {
  const { batting: bat, bowling: bowl, fielding: field, match } = perf;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const drills: string[] = [];
  const summaryParts: string[] = [];
  let howShouldHavePlayed = '';

  // ── Batting analysis ──
  if (bat.played) {
    const balls = bat.balls;
    const runs = bat.runs;
    const sr = bat.sr;

    // Strengths
    if (sr >= 150 && balls >= 8) strengths.push(`Strike rate of ${sr.toFixed(1)} — that aggression set the tempo for the team.`);
    if (bat.fours + bat.sixes >= 4) strengths.push(`${bat.fours} fours and ${bat.sixes} sixes — boundary hitting was on point.`);
    if (!bat.isOut && balls >= 10) strengths.push('Stayed not out and held one end — exactly what the team needed.');
    if (runs >= 30) strengths.push(`A 30+ score — converted your start, didn't throw it away.`);

    // Improvements based on dismissal
    if (bat.isOut && bat.wicketType) {
      const coaching = DISMISSAL_COACHING[bat.wicketType];
      if (coaching) {
        improvements.push(coaching.mistake);
        drills.push(coaching.drill);
        howShouldHavePlayed = coaching.fix;
      }
    }
    if (bat.isOut && balls < 5 && runs < 5) {
      improvements.push(`Out cheaply (${runs} off ${balls}) — early innings, you needed to play yourself in before going for shots.`);
    }
    if (bat.isOut && balls >= 15 && runs < balls * 0.8 && sr < 80) {
      improvements.push(`Slow start: ${runs}(${balls}) at SR ${sr.toFixed(1)} — too many dot balls. Look for singles to rotate strike.`);
    }
    if (teamSrInBattingInnings > 0 && balls >= 8 && sr < teamSrInBattingInnings * 0.7) {
      improvements.push(`Your SR ${sr.toFixed(1)} was well below team SR ${teamSrInBattingInnings.toFixed(1)} — find the gaps for singles.`);
    }

    // Summary
    summaryParts.push(`Batted ${runs}(${balls}) at SR ${sr.toFixed(1)}${bat.isOut ? `, out ${bat.howOut}` : ', not out'}.`);
  } else {
    summaryParts.push('Did not bat in this match.');
  }

  // ── Bowling analysis ──
  if (bowl.bowled) {
    const econ = bowl.economy;
    const dotsPerOver = bowl.balls > 0 ? (bowl.dots / (bowl.balls / 6)) : 0;

    if (bowl.wickets >= 2) strengths.push(`${bowl.wickets} wickets — strike-bowler performance.`);
    if (bowl.maidens >= 1) strengths.push(`${bowl.maidens} maiden${bowl.maidens > 1 ? 's' : ''} — pure pressure.`);
    if (econ <= 5 && bowl.balls >= 12) strengths.push(`Economy ${econ.toFixed(2)} — strangled the run rate.`);
    if (dotsPerOver >= 4 && bowl.balls >= 12) strengths.push(`${bowl.dots} dot balls — relentless pressure.`);

    if (econ > 9 && bowl.balls >= 12) {
      improvements.push(`Economy ${econ.toFixed(2)} — too expensive. Mix lengths and make the batter play to the field.`);
      drills.push('Length drill — six balls, alternating yorker / good-length / back-of-length. Hit the same spot.');
    }
    if (bowl.wides >= 4 || bowl.noballs >= 2) {
      improvements.push(`${bowl.wides} wides${bowl.noballs ? ` and ${bowl.noballs} no-balls` : ''} — extras gift the batter free runs and waste deliveries.`);
      drills.push('Run-up + landing drill — 12 deliveries, focus only on legal landing and line. No movement, just legality.');
    }
    if (teamEconInBowlingInnings > 0 && bowl.balls >= 12 && econ > teamEconInBowlingInnings * 1.3) {
      improvements.push(`Your economy ${econ.toFixed(2)} was above team average ${teamEconInBowlingInnings.toFixed(2)} — slot in earlier with tighter lengths.`);
    }
    if (bowl.wickets === 0 && bowl.balls >= 18) {
      improvements.push(`Three full overs without a wicket — try changing pace or going wider/straighter to set up the next dismissal.`);
    }

    summaryParts.push(`Bowled ${bowl.oversDisplay}-${bowl.maidens}-${bowl.runs}-${bowl.wickets} (econ ${econ.toFixed(2)}).`);
  }

  // ── Fielding analysis ──
  const totalFielding = field.catches + field.stumpings + field.runOuts;
  if (totalFielding >= 2) strengths.push(`${totalFielding} dismissals in the field — sharp hands, sharper eyes.`);
  else if (field.catches >= 1) strengths.push(`Took a catch — hands were ready.`);
  else if (field.runOuts >= 1) strengths.push(`Run-out — that's awareness winning a wicket without a ball bowled at the stumps.`);

  if (totalFielding > 0) summaryParts.push(`Fielding: ${field.catches}c${field.stumpings ? ` ${field.stumpings}st` : ''}${field.runOuts ? ` ${field.runOuts}ro` : ''}.`);

  // ── Match-context summary ──
  const ourTeam = perf.battingTeam;
  const result = match.result || '';
  const wonResult = result.toLowerCase().startsWith(ourTeam.toLowerCase());
  if (wonResult && (bat.runs >= 20 || bowl.wickets >= 2 || totalFielding >= 1)) {
    strengths.push('Played a real role in the win — keep that contribution coming.');
  }
  if (!wonResult && bat.played && bat.runs >= 30) {
    strengths.push('Top contribution despite the result. Individual performance matters even in a loss.');
  }

  // Default fallback for "how should have played" if no specific dismissal advice
  if (!howShouldHavePlayed) {
    if (bat.played && bat.isOut && bat.wicketType === 'Run Out') {
      howShouldHavePlayed = 'Communication is the easy fix — call earlier, call louder, and never run unless you and your partner have eye contact and a clear "yes".';
    } else if (bat.played && !bat.isOut && bat.runs >= 25) {
      howShouldHavePlayed = 'You held an end and stayed in. The next step is converting these stays into bigger scores — match the team SR while you anchor.';
    } else if (bowl.bowled && bowl.wickets === 0) {
      howShouldHavePlayed = 'Wickets come from pressure, and pressure comes from dot balls. Focus on tight lengths first; the wickets follow.';
    } else if (bowl.bowled && bowl.economy > 8) {
      howShouldHavePlayed = 'Tight lengths squeeze the batter into mistakes. Pick one length and one line, repeat for an over, then change.';
    } else {
      howShouldHavePlayed = 'Solid contribution. Keep stacking the small things — leave the bad balls, hit the gaps, watch the ball into your hands.';
    }
  }

  return {
    summary: summaryParts.join(' '),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 4),
    howShouldHavePlayed,
    drills: Array.from(new Set(drills)).slice(0, 3),
  };
}

// Helper to compute team SR/econ for the relevant innings, fed
// into generateCoachFeedback for context.
export function teamRatesForPlayer(playerName: string, match: Match): {
  battingTeamSr: number;
  bowlingTeamEcon: number;
} {
  const innings = [match.innings1, match.innings2];
  let battingTeamSr = 0;
  let bowlingTeamEcon = 0;
  for (const inn of innings) {
    if (inn.balls.some(b => b.batter === playerName)) {
      const totalLegal = inn.balls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;
      battingTeamSr = totalLegal > 0 ? Math.round((inn.totalRuns / totalLegal) * 1000) / 10 : 0;
    }
    if (inn.balls.some(b => b.bowler === playerName)) {
      const totalLegal = inn.balls.filter(b => b.extraType !== 'wide' && b.extraType !== 'noball').length;
      bowlingTeamEcon = totalLegal > 0 ? Math.round((inn.totalRuns / (totalLegal / 6)) * 100) / 100 : 0;
    }
  }
  return { battingTeamSr, bowlingTeamEcon };
}
