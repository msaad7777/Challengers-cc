"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getBattingStats, type Innings, type Match } from '../scorer/types';
import { generateCoachInsight } from '../lib/coachInsight';
import { generateNextMatchInsight } from '../lib/nextMatchInsight';
import {
  type MatchPlan,
  type PlayerAssignment,
  type LeagueKey,
  type Temperament,
  BATTING_ROLES,
  BOWLING_ROLES,
  BATTING_ROLE_BRIEF,
  BOWLING_ROLE_BRIEF,
  FIELDING_POSITIONS,
  MINDSET_WORDS,
  TEMPERAMENTS,
  TEMPERAMENT_BRIEF,
  T30_BATTING_FIRST_TEMPLATE,
  detectLeagueFromLabel,
  getPlayingXI,
  getTwelfthMan,
  validatePlan,
  buildHuddleScript,
  getLeadership,
} from '../lib/matchPlan';
import { EMAIL_TO_PLAYER } from '@/lib/c3h-roster';
import { isC3HCaptain } from '@/lib/c3h-access';

// Map scorer's wicket type to the reflection's HOW_GOT_OUT_OPTIONS
function mapScorerWicketToReflection(scorerHowOut: string): string {
  const lower = scorerHowOut.toLowerCase();
  if (lower.startsWith('bowled')) return 'Bowled';
  if (lower.startsWith('lbw')) return 'LBW';
  if (lower.startsWith('run out')) return 'Run Out';
  if (lower.startsWith('stumped')) return 'Stumped';
  if (lower.startsWith('hit wicket')) return 'Hit Wicket';
  // Caught variations — default to "Caught — Infield" (most common, player can edit)
  if (lower.startsWith('caught')) return 'Caught — Infield';
  return '';
}

interface ScorerBattingLine {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  howOut: string;
  matchLabel: string;
  scoredBy: string;
}

interface Reflection {
  id: string;
  email: string;
  date: string;
  matchIndex: number;
  match: string;
  opponent: string;
  // Optional Firestore matches/<id> link. Set when the user picks
  // a real recorded match from the dropdown rather than the generic
  // "Practice Match" / scheduled-fixture options. Lets future
  // analytics (cross-match patterns, performance overlays, replay
  // links) join reflection → match data without name-and-date
  // guessing.
  matchId?: string;
  howGotOut: string | string[];
  // ── Coach-level review (optional, deeper analysis) ──────────
  // All optional so existing quick-reflection flow still works.
  // Populated when the user expands the Coach-Level Review panel
  // and answers the questions there.
  controlPercent?: number;                          // 0-100
  pickedLengthEarly?: 'yes' | 'mostly' | 'no';
  watchedBall?: 'yes' | 'partially' | 'no';
  misjudgedPaceOrBounce?: boolean;
  headOverBall?: 'yes' | 'sometimes' | 'no';
  frontFootToPitch?: 'yes' | 'sometimes' | 'no';
  balanceAtContact?: 'stable' | 'falling' | 'reaching';
  matchPhase?: 'powerplay' | 'middle' | 'death' | 'na';
  pressureLevel?: 'low' | 'medium' | 'high';
  intentMode?: 'accelerate' | 'consolidate' | 'settle';
  firstSixBallsPlan?: string;
  stuckToPlan?: 'yes' | 'partly' | 'no';
  whyShotThatGotMeOut?: string;
  // ── Run Maker tracker fields (optional) ─────────────────────
  // Drive the Runs/10 + Dot Ball % + Strike Rate KPIs, bowler-style-
  // specific drills, and the "focus for next session" line in the
  // insight. runsScored + ballsFaced are pre-filled from the scorer
  // when a recorded match is linked but always editable by the player.
  runsScored?: number;
  ballsFaced?: number;
  dotBallsFaced?: number;
  dismissalBowlerArm?: 'right' | 'left';
  dismissalBowlerStyle?: 'fast' | 'medium' | 'off-spin' | 'leg-spin';
  stickyBowlerStyle?: 'fast' | 'medium' | 'off-spin' | 'leg-spin';
  nextFocusKpi?: 'runs-per-10' | 'intent' | 'dot-ball-pct' | 'use-tactic' | 'pre-ball-routine';
  feeling: number;
  bodyStatus: string[];
  nutrition: string[];
  whatWentRight: string[];
  whatWentWrong: string[];
  mindsetWord: string;
  nextInningsPlan: string;
  strengthToBuild: string;
  pressureResponse: string;
  intentScore: number;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  editCount?: number;
}

const BODY_STATUS_OPTIONS = [
  'Feeling fresh and strong',
  'Slight fatigue',
  'Sore muscles',
  'Minor injury — playing through it',
  'Carrying an injury — limited movement',
  'Back pain',
  'Shoulder/arm pain',
  'Knee/leg pain',
  'Dehydrated',
  'Low energy',
  'Well rested',
  'Mentally sharp',
  'Mentally tired',
  'Stressed from work/life',
];

const NUTRITION_OPTIONS = [
  'Had a proper meal before',
  'Light meal only',
  'Skipped meal',
  'Well hydrated',
  'Not enough water',
  'Had energy drink/snack',
];

const HOW_GOT_OUT_OPTIONS = [
  'Bowled', 'Caught — Slips/Gully', 'Caught — Infield', 'Caught — Boundary',
  'Caught — Keeper', 'Caught — Hit straight to fielder', 'LBW', 'Run Out',
  'Stumped', 'Hit Wicket', 'Did not bat', 'Not out',
];

const WHAT_WENT_RIGHT_OPTIONS = [
  'Good shot selection', 'Rotated strike well', 'Played to my strengths',
  'Stayed patient early', 'Good footwork', 'Read the bowler well',
  'Stayed calm under pressure', 'Used my pre-ball routine', 'Good intent throughout',
  'Converted a start into a score', 'Good running between wickets', 'Adapted to conditions',
];

const WHAT_WENT_WRONG_OPTIONS = [
  'Poor shot selection', 'Played too early', 'Played too late', 'Rushed my innings',
  'No clear plan', 'Froze under pressure', 'Chased a wide delivery', 'Forgot my routine',
  'Overthinking', 'Lost concentration', 'Poor footwork', 'Tried to hit too hard',
  'Defensive mindset', 'Did not rotate strike', 'Fatigue or distraction',
  'Bat-pad gap', 'Head fell over', 'Threw front leg to spin', 'Wrong shot to ball line',
  'Grip felt off', 'Bat felt unbalanced',
];

// Maps reflection mistakes to relevant Batting Principles for "Recommended for You"
const MISTAKE_TO_PRINCIPLE: Record<string, { principle: string; tip: string }> = {
  'Poor shot selection': {
    principle: 'Shot Selection by Line',
    tip: "Match the shot to the ball line — V for inside-stump balls, square or cover drive for outside off, leg square for outside leg. Don't play the wrong shot to the wrong delivery.",
  },
  'Wrong shot to ball line': {
    principle: 'Shot Selection by Line',
    tip: "Inside off / inside leg → V. Outside off → square / cover drive. Outside leg → leg square. If they pack the V, look for the gaps the field has left open.",
  },
  'Chased a wide delivery': {
    principle: 'Shot Selection by Line',
    tip: "Wide outside off (5th stump) — leave once in a while. Don't even move the bat. Build trust with your judgment and force the bowler to come to you.",
  },
  'Played too early': {
    principle: 'Watching the Ball',
    tip: "Focus on the bowler's left eye pre-delivery (right-arm bowlers). Switch to the release point as they enter their action. Then judge where it lands. Playing early = guessing.",
  },
  'Played too late': {
    principle: 'Watching the Ball',
    tip: "Lock onto the bowler's left eye, then the release point, then the landing zone. Playing late means the eyes haven't fully transitioned — work on the sequence in nets.",
  },
  'Poor footwork': {
    principle: 'Body Position',
    tip: "Play close to the body, in the second line. This eliminates the bat-pad gap. Decide forward or back — never half-forward.",
  },
  'Bat-pad gap': {
    principle: 'Body Position',
    tip: "Play in the second line — inside the line of the ball. Keep bat next to pad through the shot. The gap is what gets you bowled or LBW.",
  },
  'Head fell over': {
    principle: 'Above All — Head in Line',
    tip: "Head should always stay in the line of the ball. If your head moves off line, your weight follows and you can't watch the ball onto the bat. Drill: shadow batting in front of a mirror, head still through the swing.",
  },
  'Threw front leg to spin': {
    principle: 'Against Left-Arm Spinners',
    tip: "Never throw your front leg away. Always play under your head. If your front leg goes wide, your head falls and the ball turns past your bat.",
  },
  'Tried to hit too hard': {
    principle: 'Stance & Setup',
    tip: "Bat lifted away. Tap near back foot toe. Power comes from timing, not muscle. Watch the \"Smooth Bat Flow ~ Effortless Power\" video in the Power Hitting section.",
  },
  'Grip felt off': {
    principle: 'Bat Grip & Balance',
    tip: "Hold the bat with about a two-finger space between top and bottom hand grips — this keeps the bat balanced through the swing. Hands too close = lose leverage. Hands too far apart = lose control. Equal pressure in both hands; the V's formed by thumb and forefinger should align down the splice.",
  },
  'Bat felt unbalanced': {
    principle: 'Bat Grip & Balance',
    tip: "Two-finger space between top and bottom hand grips is the balance point. If the bat feels heavy in one direction, check the gap — too small and the bat wants to dive, too wide and it wobbles through the swing. Reset the grip between every ball if you have to.",
  },
};

// ── Shot Planner Data ──
interface CricketShot {
  name: string;
  category: 'front-foot' | 'back-foot' | 'unorthodox';
  region: number; // wagon wheel region 1-8
  description: string;
}

const CRICKET_SHOTS: CricketShot[] = [
  // Front foot shots
  { name: 'Straight Drive', category: 'front-foot', region: 1, description: 'Played along the ground straight past the bowler' },
  { name: 'Off Drive', category: 'front-foot', region: 2, description: 'Driven through the off side between mid-off and cover' },
  { name: 'Cover Drive', category: 'front-foot', region: 3, description: 'Classic shot through the covers, front foot forward' },
  { name: 'Square Drive', category: 'front-foot', region: 4, description: 'Driven square on the off side through point' },
  { name: 'On Drive', category: 'front-foot', region: 8, description: 'Driven through the on side between mid-on and mid-wicket' },
  { name: 'Flick', category: 'front-foot', region: 7, description: 'Wristy flick off the pads through mid-wicket' },
  { name: 'Sweep', category: 'front-foot', region: 6, description: 'Down on one knee, sweeping spin to fine leg' },
  { name: 'Forward Defence', category: 'front-foot', region: 0, description: 'Soft hands, dead bat, blocking with front foot forward' },
  { name: 'Lofted Drive', category: 'front-foot', region: 1, description: 'Driving over the top for a six — straight or over mid-on/off' },
  // Back foot shots
  { name: 'Back Foot Defence', category: 'back-foot', region: 0, description: 'Getting back and across to block on the back foot' },
  { name: 'Cut', category: 'back-foot', region: 4, description: 'Short and wide ball cut square through point' },
  { name: 'Late Cut', category: 'back-foot', region: 5, description: 'Delicate cut played late behind square on the off side' },
  { name: 'Pull', category: 'back-foot', region: 7, description: 'Short ball pulled through mid-wicket on the leg side' },
  { name: 'Hook', category: 'back-foot', region: 6, description: 'Short bouncer hooked behind square on the leg side' },
  { name: 'Back Foot Punch', category: 'back-foot', region: 3, description: 'Short ball punched through covers off the back foot' },
  { name: 'Leg Glance', category: 'back-foot', region: 6, description: 'Gentle deflection off the pads towards fine leg' },
  { name: 'Upper Cut', category: 'back-foot', region: 5, description: 'Short ball guided over the slips/third man area' },
  // Unorthodox shots
  { name: 'Reverse Sweep', category: 'unorthodox', region: 5, description: 'Switching grip to sweep spin to the off side' },
  { name: 'Switch Hit', category: 'unorthodox', region: 3, description: 'Switching stance completely to hit to the other side' },
  { name: 'Scoop / Ramp', category: 'unorthodox', region: 5, description: 'Getting under the ball and scooping it over the keeper' },
  { name: 'Paddle Sweep', category: 'unorthodox', region: 6, description: 'Fine sweep played with a paddle motion to fine leg' },
  { name: 'Slog Sweep', category: 'unorthodox', region: 7, description: 'Aggressive sweep over mid-wicket for a big hit' },
  { name: 'Dilscoop', category: 'unorthodox', region: 5, description: 'Getting under a full ball and flicking it over the keeper' },
  { name: 'Inside Out', category: 'unorthodox', region: 2, description: 'Making room and lofting over cover against spin' },
];

// Wagon wheel regions (1-8, clockwise from straight ahead)
// 0 = defensive (no region), 1 = straight, 2 = mid-off, 3 = cover, 4 = point,
// 5 = third man/behind off, 6 = fine leg/behind leg, 7 = mid-wicket, 8 = mid-on
// Angles: batter at TOP, bowler at BOTTOM.
// RHB: off side = LEFT, leg side = RIGHT
// Rotated 90° CCW from standard math angles
const WAGON_REGIONS: { id: number; label: string; angle: number }[] = [
  { id: 1, label: 'Straight', angle: 90 },
  { id: 2, label: 'Mid-off', angle: 120 },
  { id: 3, label: 'Cover', angle: 150 },
  { id: 4, label: 'Point', angle: 180 },
  { id: 5, label: 'Third Man', angle: 225 },
  { id: 6, label: 'Fine Leg', angle: 315 },
  { id: 7, label: 'Mid-wicket', angle: 30 },
  { id: 8, label: 'Mid-on', angle: 60 },
];

const BOWLER_TYPES = [
  'Fast (140+)',
  'Fast-Medium (130-140)',
  'Medium (120-130)',
  'Off Spin',
  'Leg Spin',
  'Left-arm Spin',
  'Left-arm Seam',
];

type ShotConfidence = 'strong' | 'working' | 'avoid';

interface ShotPlan {
  shotConfidence: Record<string, ShotConfidence>; // shot name → confidence
  bowlerPlans: Record<string, string[]>; // bowler type → planned shots
  notes: string;
};

// ── Training Programs Data ──
interface Drill {
  name: string;
  reps: string;
  video?: string;
}

interface TrainingSession {
  title: string;
  description: string;
  drills: Drill[];
}

interface TrainingProgram {
  id: string;
  title: string;
  icon: string;
  color: string;
  period: string;
  description: string;
  introVideos: { title: string; url: string }[];
  sessions: TrainingSession[];
  keyCue?: { headline: string; explanation: string };
}

const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'drives',
    title: 'Drive Mastery',
    icon: '🏏',
    color: 'primary',
    period: '2 weeks / 4 sessions',
    description: 'Master straight drive, cover drive, on drive, and lofted drive. Correct common mistakes and build muscle memory.',
    introVideos: [
      { title: 'Playing the Drive — Basics', url: 'https://www.youtube.com/watch?v=TSxJVw57jqs' },
      { title: 'Common Drive Mistakes', url: 'https://www.youtube.com/watch?v=xzlubATqwaU' },
      { title: 'Watch the Ball Like a Pro', url: 'https://www.youtube.com/watch?v=i-YbztHt1ZY' },
    ],
    sessions: [
      {
        title: 'Session 1 — Straight & Cover Drive',
        description: 'Focus on straight drive and cover drive as a singular shot — the technique is extremely similar.',
        drills: [
          { name: 'Swing Focus: Double ball throws', reps: '12x reps', video: 'https://youtu.be/CQeXXrZfsvE?t=20' },
          { name: 'Drill 1: Stationary position — Dropdowns', reps: '12x reps', video: 'https://youtu.be/xzlubATqwaU?t=35' },
          { name: 'Drill 2: Single handed top hand drives', reps: '12x reps', video: 'https://youtu.be/xzlubATqwaU?t=137' },
          { name: 'Drill 3: Stationary position — Over arms', reps: '36x reps', video: 'https://youtu.be/xzlubATqwaU?t=171' },
          { name: 'Movement: Weight transfer', reps: '24x reps', video: 'https://youtu.be/xzlubATqwaU?t=61' },
          { name: 'Movement: Head over Cone', reps: '12x reps', video: 'https://youtu.be/xzlubATqwaU?t=76' },
          { name: 'Hitting stationaries', reps: '4x sets of 5 balls', video: 'https://youtu.be/TSxJVw57jqs?t=96' },
          { name: 'Rapid fire stepping drives', reps: '24x reps', video: 'https://youtu.be/xzlubATqwaU?t=229' },
          { name: 'Straight & Cover Drives — increasing pace', reps: '18x each: underarms, slow, medium, high speed' },
          { name: 'Mixed set of over arms', reps: '36x balls' },
        ],
      },
      {
        title: 'Session 2 — Lofted Drive',
        description: 'Revise straight/cover drive then learn lofted drives — same technique but hit in front of eye line instead of underneath.',
        drills: [
          { name: 'Warm-up: Stationary over arms', reps: '24x reps', video: 'https://youtu.be/xzlubATqwaU?t=171' },
          { name: 'Weight transfer warm-up', reps: '12x reps', video: 'https://youtu.be/xzlubATqwaU?t=61' },
          { name: 'Lofted Drive intro video', reps: 'Watch first', video: 'https://youtu.be/KzvZnEqBU6Q' },
          { name: 'Lofted drive: Dropdowns', reps: '24x reps' },
          { name: 'Lofted drive: Underarms', reps: '36x reps' },
          { name: 'Lofted drive: Medium paced over arms', reps: '36x reps' },
          { name: 'Match intensity lofted drives', reps: '36x balls — keep score' },
          { name: 'Mixed set: drive + lofted drive', reps: '36x balls' },
        ],
      },
      {
        title: 'Session 3 — On Drive',
        description: 'The most difficult of our drives — the on drive. Focus on initial small stride movement.',
        drills: [
          { name: 'On Drive intro video', reps: 'Watch first', video: 'https://youtu.be/KLfmgX-0LtI' },
          { name: 'Swing: Stationary dropdowns', reps: '12x reps', video: 'https://youtu.be/KLfmgX-0LtI?t=94' },
          { name: 'Swing: Stationary under arms', reps: '18x reps', video: 'https://youtu.be/KLfmgX-0LtI?t=121' },
          { name: 'Movement: Hitting stationaries', reps: '6x sets of 3', video: 'https://youtu.be/KLfmgX-0LtI?t=152' },
          { name: 'Standard dropdowns', reps: '12x reps', video: 'https://youtu.be/KLfmgX-0LtI?t=197' },
          { name: 'Under arms with line', reps: '18x reps', video: 'https://youtu.be/KLfmgX-0LtI?t=222' },
          { name: 'On Drives — increasing pace', reps: '18x each: underarms, slow, medium, high speed' },
          { name: 'Challenge set: match intensity', reps: '30x balls — target 24/30 successful' },
        ],
      },
      {
        title: 'Session 4 — All Drives Combined',
        description: 'Combine all drives at match intensity. Mixed throws — play the right drive for each delivery.',
        drills: [
          { name: 'Warm-up: Weight transfer', reps: '12x reps', video: 'https://youtu.be/xzlubATqwaU?t=61' },
          { name: 'Straight drives', reps: '18x balls' },
          { name: 'Cover drives', reps: '18x balls' },
          { name: 'On drives', reps: '18x balls' },
          { name: 'Lofted drives', reps: '18x balls' },
          { name: 'Mixed drive set — match intensity', reps: '36x balls — play the right shot' },
          { name: 'Challenge: score out of 36', reps: '36x balls — record your score' },
        ],
      },
    ],
  },
  {
    id: 'legspin',
    title: 'Leg Spin Bowling',
    icon: '🎯',
    color: 'accent',
    period: '2 weeks / 4 sessions',
    description: 'Master leg spin grip, wrist action, line and length consistency. Learn variations: top spinner, slider, and googly.',
    introVideos: [
      { title: 'Introduction to Leg Spin', url: 'https://www.youtube.com/watch?v=Cn9htU88o0Q' },
    ],
    sessions: [
      {
        title: 'Session 1 — Grip & Wrist Action',
        description: 'Learn the grip and practice wrist action. Build muscle memory with repetitive basics.',
        drills: [
          { name: 'Gripping the ball', reps: 'Study & practice', video: 'https://youtu.be/Cn9htU88o0Q?t=14' },
          { name: 'Wrist action practice', reps: 'Study & practice', video: 'https://youtu.be/PFdoXREvjHE?t=7' },
          { name: 'Flicks hand to hand', reps: '20x reps', video: 'https://youtu.be/Cn9htU88o0Q?t=50' },
          { name: 'Resistance band wrist strengthening', reps: '2x 20 reps', video: 'https://youtu.be/PFdoXREvjHE?t=28' },
          { name: 'Wrist flick set', reps: '2x 20 reps', video: 'https://youtu.be/PFdoXREvjHE?t=56' },
          { name: 'Underarm throws', reps: '3x 12 reps', video: 'https://youtu.be/PFdoXREvjHE?t=72' },
          { name: 'Kneeling and throwing', reps: '3x 12 reps', video: 'https://youtu.be/PFdoXREvjHE?t=94' },
          { name: 'Stationary position delivery', reps: '2x 12 reps', video: 'https://youtu.be/aU_OF3xqPI4?t=76' },
          { name: 'Single jump delivery', reps: '2x 12 reps', video: 'https://youtu.be/aU_OF3xqPI4?t=98' },
          { name: 'Bowling 3 overs', reps: '3x 6 reps', video: 'https://youtu.be/PFdoXREvjHE?t=117' },
        ],
      },
      {
        title: 'Session 2 — Line, Length & Top Spinner',
        description: 'Improve line and length consistency. Learn the top spinner variation.',
        drills: [
          { name: 'Flicks warm-up', reps: '20x reps', video: 'https://youtu.be/Cn9htU88o0Q?t=50' },
          { name: 'Resistance band', reps: '2x 20 reps', video: 'https://youtu.be/PFdoXREvjHE?t=28' },
          { name: 'Alignment within crease', reps: '2x 20 reps', video: 'https://youtu.be/xgSLPf-1ZHQ?t=39' },
          { name: 'Through crease to target', reps: '2x 20 reps', video: 'https://youtu.be/xgSLPf-1ZHQ?t=67' },
          { name: 'Follow through — leg spin only', reps: '4x 6 reps', video: 'https://youtu.be/xgSLPf-1ZHQ?t=106' },
          { name: 'Consistency checks', reps: '4x 6 reps (4 overs)', video: 'https://youtu.be/xgSLPf-1ZHQ?t=137' },
          { name: 'Variation: Top Spinner', reps: '4x 6 reps (4 overs)', video: 'https://youtu.be/cV4CUBl3VYg?t=55' },
        ],
      },
      {
        title: 'Session 3 — Slider Variation',
        description: 'Repeat warmup drills then learn back/front foot landings and the slider variation.',
        drills: [
          { name: 'Flicks warm-up', reps: '20x reps', video: 'https://youtu.be/Cn9htU88o0Q?t=50' },
          { name: 'Resistance band', reps: '2x 20 reps', video: 'https://youtu.be/PFdoXREvjHE?t=28' },
          { name: 'Back foot landing', reps: '3x 6 reps', video: 'https://youtu.be/aU_OF3xqPI4?t=141' },
          { name: 'Front foot landing', reps: '3x 6 reps', video: 'https://youtu.be/aU_OF3xqPI4?t=191' },
          { name: 'Height in action + front leg snap', reps: '4x 6 reps', video: 'https://youtu.be/aU_OF3xqPI4?t=230' },
          { name: 'Slider: Flicks', reps: '1x 20 reps', video: 'https://youtu.be/mrq15Ofqi3o?t=38' },
          { name: 'Slider: Release', reps: '1x 20 reps', video: 'https://youtu.be/mrq15Ofqi3o?t=60' },
          { name: 'Slider: ¾ pitch length', reps: '4x 6 reps', video: 'https://youtu.be/mrq15Ofqi3o?t=87' },
          { name: 'Slider: Full pitch length', reps: '4x 6 reps', video: 'https://youtu.be/mrq15Ofqi3o?t=116' },
        ],
      },
      {
        title: 'Session 4 — Googly Variation',
        description: 'Reinforce leg spin actions and learn the googly. Plan your bowling spell.',
        drills: [
          { name: 'Flicks warm-up', reps: '20x reps', video: 'https://youtu.be/Cn9htU88o0Q?t=50' },
          { name: 'Resistance band', reps: '2x 20 reps', video: 'https://youtu.be/PFdoXREvjHE?t=28' },
          { name: 'Underarm throws', reps: '5x 6 reps', video: 'https://youtu.be/PFdoXREvjHE?t=72' },
          { name: 'Kneeling and throwing', reps: '5x 6 reps', video: 'https://youtu.be/PFdoXREvjHE?t=94' },
          { name: 'Bowling', reps: '4x 6 reps (3 overs)', video: 'https://youtu.be/PFdoXREvjHE?t=117' },
          { name: 'Googly: Flicks', reps: '1x 20 reps', video: 'https://youtu.be/C64WcUceFTo?t=40' },
          { name: 'Googly: Bowling from knee height', reps: '4x 6 reps', video: 'https://youtu.be/C64WcUceFTo?t=75' },
          { name: 'Googly: Standing into side net', reps: '4x 6 reps', video: 'https://youtu.be/C64WcUceFTo?t=110' },
          { name: 'Googly: Full action bowling', reps: '4x 6 reps', video: 'https://youtu.be/C64WcUceFTo?t=139' },
          { name: 'Planning your spell', reps: 'Watch & study', video: 'https://www.youtube.com/watch?v=6KHJourO0b4' },
        ],
      },
    ],
  },
  {
    id: 'power',
    title: 'Power Hitting',
    icon: '💥',
    color: 'red',
    period: '2 weeks / 4 sessions',
    description: 'Improve hand speed, timing, swing path, and body mechanics to hit boundaries with less risk.',
    keyCue: {
      headline: 'Front foot and shoulder AWAY from the line of the ball.',
      explanation:
        'To generate power without jamming the bat, your front foot and front shoulder must clear the line — not stay in it. This creates the swing arc, frees the arms, and lets the bat come through cleanly. Staying in line chokes the shot and gets you out.',
    },
    introVideos: [
      { title: 'Power Hitting & Swing Paths', url: 'https://www.youtube.com/watch?v=fXO6VzDlSZQ' },
      { title: 'Optimal Swing Path Drills', url: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
      { title: 'Hand Speed Drills', url: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
      { title: 'Timing & Hand-Eye', url: 'https://www.youtube.com/watch?v=QCwSaXEJI2w' },
      { title: 'Step-Out Technique', url: 'https://www.youtube.com/watch?v=_2jVVb0f7Yo' },
      { title: 'Smooth Bat Flow ~ Effortless Power', url: 'https://www.youtube.com/watch?v=K_MBc62q7gY' },
    ],
    sessions: [
      {
        title: 'Session 1 — Swing Path & Hand Speed',
        description: 'Focus on hand speed, timing, swing path, and body mechanics for power hitting.',
        drills: [
          { name: 'Fault 1 — Drill 2', reps: '1x 18 reps', video: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
          { name: 'Fault 1 — Drill 2 Progression', reps: '1x 18 reps', video: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
          { name: 'Fault 2 — The golf swing', reps: '1x 24 reps', video: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
          { name: 'Hand Speed: Drill 1 (no 10)', reps: '1x 12 reps', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Hand Speed: Drill 3 (no 8) ball drops', reps: '4x 6 balls', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Hand Speed: Drill 4 (no 7) ball drops', reps: '12x 2 balls', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Juggling for hand-eye coordination', reps: '2 minutes' },
          { name: 'Timing drill', reps: '36 balls', video: 'https://www.youtube.com/watch?v=QCwSaXEJI2w' },
          { name: 'Power hitting: 3 zones', reps: '24 balls each zone', video: 'https://www.youtube.com/watch?v=fXO6VzDlSZQ' },
          { name: 'Mixed throwdowns', reps: '36 balls' },
        ],
      },
      {
        title: 'Session 2 — Swing Faults & Timing',
        description: 'Fix swing faults and improve timing. More hand speed drills at higher intensity.',
        drills: [
          { name: 'Fault 2 — Drill no 1', reps: '1x 18 reps', video: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
          { name: 'Fault 2 — Drill no 2', reps: '1x 12 reps', video: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
          { name: 'Fault 3 — Drill no 2', reps: '1x 18 reps', video: 'https://www.youtube.com/watch?v=nE8mt-X5kxI&t' },
          { name: 'Hand Speed: Drill 6 (no 5)', reps: '6x 2 ball reps', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Hand Speed: Drill 7 (no 4)', reps: '6x 2 ball reps', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Hand Speed: Drill 8 (no 3)', reps: '4x 5 ball reps', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Hand Speed: Drill 10 (no 1)', reps: '4x 3 ball reps', video: 'https://www.youtube.com/watch?v=ZVCdJXVJLwU&t' },
          { name: 'Juggling warm-up', reps: '2 minutes' },
          { name: 'Timing drill', reps: '30 balls', video: 'https://www.youtube.com/watch?v=QCwSaXEJI2w' },
          { name: 'Mixed medium speed boundary hitting', reps: '36 balls' },
          { name: 'Mixed throwdowns', reps: '36 balls' },
        ],
      },
      {
        title: 'Session 3 — Attacking Spin',
        description: 'Build confidence playing powerful boundary shots against spin bowling.',
        drills: [
          { name: 'Step-Out Technique', reps: '12 dropdowns + 12 underarms + 24 over arms', video: 'https://www.youtube.com/watch?v=_2jVVb0f7Yo' },
          { name: 'Double step attacking spin', reps: '12 dropdowns + 12 underarms + 24 over arms', video: 'https://youtu.be/p7GzCC7V3-4' },
          { name: 'Hitting straight over the top', reps: '12 + 18 + 24 balls', video: 'https://youtu.be/QKJO2e1gHvU' },
          { name: 'Slog Sweep', reps: '12 dropdowns + 12 underarms + 24 slow + 24 match intensity', video: 'https://youtu.be/KYdy-eUZwP0' },
          { name: 'Challenge: match intensity vs off spin', reps: '36 balls — hit boundaries' },
        ],
      },
      {
        title: 'Session 4 — Match Intensity Power',
        description: 'Full match intensity power hitting. Combine all techniques at speed.',
        drills: [
          { name: 'Juggling warm-up', reps: '2 minutes' },
          { name: 'Zone hitting: all 3 zones', reps: '24 balls each', video: 'https://www.youtube.com/watch?v=fXO6VzDlSZQ' },
          { name: 'Mixed medium speed throwdowns', reps: '36 balls' },
          { name: 'Match intensity: hit boundaries', reps: '36 balls — keep score' },
          { name: 'Challenge: 36 balls — score as many as possible', reps: '36 balls' },
        ],
      },
    ],
  },
  {
    id: 'rotation',
    title: 'Strike Rotation',
    icon: '🔄',
    color: 'blue',
    period: '2 weeks / 4 sessions',
    description: 'Stop getting bogged down. Week 1: rotate vs spin bowling. Week 2: rotate vs seam bowling.',
    introVideos: [
      { title: 'Strike Rotation vs Spin', url: 'https://youtu.be/Nx7gcnTT_Nw' },
      { title: 'Sweep & Reverse Sweep', url: 'https://www.youtube.com/watch?v=2il-iAlFtKA&t' },
      { title: 'Strike Rotation vs Seam', url: 'https://www.youtube.com/watch?v=Gy_MjikAnhw&t' },
      { title: 'Third Man Gap Drills', url: 'https://youtu.be/8M5ObWLjL6c' },
    ],
    sessions: [
      {
        title: 'Session 1 — Rotating vs Spin (Basics)',
        description: 'Learn to rotate strike against spin bowling. Front foot and back foot options to all areas.',
        drills: [
          { name: 'Rotating square — leg side, front foot', reps: '18 clean reps: slow seam up', video: 'https://youtu.be/Nx7gcnTT_Nw' },
          { name: 'Rotating square — leg side, back foot', reps: '18 clean reps' },
          { name: 'Rotating square — off side, front foot', reps: '18 clean reps' },
          { name: 'Rotating square — off side, back foot', reps: '18 clean reps' },
          { name: 'Punching to long-on: front foot', reps: '18 clean reps' },
          { name: 'Punching to long-on: back foot', reps: '18 clean reps' },
          { name: 'Punching to long-off: front foot', reps: '18 clean reps' },
          { name: 'Punching to long-off: back foot', reps: '18 clean reps' },
          { name: 'Mixed off spin throws — 100% strike rate', reps: '30 balls — score every ball' },
        ],
      },
      {
        title: 'Session 2 — Rotating vs Spin (Sweep & Reverse)',
        description: 'Add sweep and reverse sweep to your rotation arsenal against spin.',
        drills: [
          { name: 'Rotating square — all 8 options', reps: '12 reps each: off spin throws' },
          { name: 'Sweep', reps: '24 clean reps', video: 'https://www.youtube.com/watch?v=2il-iAlFtKA&t' },
          { name: 'Reverse Sweep', reps: '24 clean reps', video: 'https://www.youtube.com/watch?v=2il-iAlFtKA&t' },
          { name: 'Mixed off spin — 36 ball assessment', reps: '36 balls' },
          { name: 'Challenge: 100% strike rate, 30 balls', reps: '30 balls — beat your previous score' },
        ],
      },
      {
        title: 'Session 3 — Rotating vs Seam',
        description: 'Strike rotation against seam bowling. Seven options to rotate — front foot and back foot.',
        drills: [
          { name: 'Study seam rotation options video', reps: 'Watch first', video: 'https://www.youtube.com/watch?v=Gy_MjikAnhw&t' },
          { name: 'Option 1: back foot', reps: '12 balls' },
          { name: 'Option 1: front foot', reps: '12 balls' },
          { name: 'Option 3: front foot', reps: '24 balls' },
          { name: 'Option 5: back foot + front foot', reps: '12 + 12 balls' },
          { name: 'Option 6b: Hitting third man', reps: '24 balls' },
          { name: 'Third man gap drills (if struggling)', reps: 'As needed', video: 'https://youtu.be/8M5ObWLjL6c' },
          { name: 'Mixed medium speed — rotate every ball', reps: '36 balls' },
          { name: 'Challenge: 4/6 rotations per over x 7 overs', reps: '42 deliveries' },
          { name: 'Challenge: 36 balls at match intensity', reps: '36 balls — 100% strike rate' },
        ],
      },
      {
        title: 'Session 4 — Combined Rotation',
        description: 'Mix spin and seam rotation. Match simulation — rotate under pressure.',
        drills: [
          { name: 'Warm-up: all rotation options', reps: '6 reps each' },
          { name: 'Mixed spin throws — rotate every ball', reps: '24 balls' },
          { name: 'Mixed seam throws — rotate every ball', reps: '24 balls' },
          { name: 'Match simulation: 30 runs needed, 36 balls', reps: '36 balls — keep score' },
          { name: 'Final challenge: mixed throws, match intensity', reps: '36 balls — 100% strike rate target' },
        ],
      },
    ],
  },
];

const EXTRA_VIDEOS = [
  { title: 'AB de Villiers 360 Batting Masterclass', url: 'https://www.youtube.com/watch?v=Q8WXoX2p3Ac&list=PLj52RzS-mgRDWdyleqi1rOzoqpIqUBOyW', description: '7 videos on batting technique, shot selection, and match awareness' },
  { title: 'Planning a Leg Spin Spell', url: 'https://www.youtube.com/watch?v=6KHJourO0b4', description: 'How to approach a spell of leg spin bowling in a match' },
];

const MATCHES = [
  // LCL T30
  { label: 'LCL M1 — vs London Predators (May 10)', index: 1, date: '2026-05-10' },
  { label: 'LCL M2 — vs Forest City Cricketers (May 18)', index: 2, date: '2026-05-18' },
  { label: 'LCL M3 — vs Sarnia Spartans (Jun 14)', index: 3, date: '2026-06-14' },
  { label: 'LCL M4 — vs Western Cricket Academy B (Jun 27)', index: 4, date: '2026-06-27' },
  { label: 'LCL M5 — vs London Rising Stars (Jul 1)', index: 5, date: '2026-07-01' },
  { label: 'LCL M6 — vs LCC Maple Stars (Jul 11)', index: 6, date: '2026-07-11' },
  { label: 'LCL M7 — vs LCC Mavericks (Jul 25)', index: 7, date: '2026-07-25' },
  { label: 'LCL M8 — vs London Rising Stars (Jul 26)', index: 8, date: '2026-07-26' },
  { label: 'LCL M9 — vs Western Cricket Academy B (Aug 2)', index: 9, date: '2026-08-02' },
  { label: 'LCL M10 — vs Forest City Cricketers (Aug 8)', index: 10, date: '2026-08-08' },
  { label: 'LCL M11 — vs Sarnia Spartans (Aug 23)', index: 11, date: '2026-08-23' },
  { label: 'LCL M12 — vs London Eagle Predators (Sep 5)', index: 12, date: '2026-09-05' },
  { label: 'LCL M13 — vs Inferno Spartans (Sep 12)', index: 13, date: '2026-09-12' },
  { label: 'LCL M14 — vs Tigers Cricket Club (Sep 13)', index: 14, date: '2026-09-13' },
  // LPL T30
  { label: 'LPL M1 — vs Maple Tigers (May 10)', index: 51, date: '2026-05-10' },
  { label: 'LPL M2 — vs London Rhinos (May 24)', index: 52, date: '2026-05-24' },
  { label: 'LPL M3 — vs NLCC (May 31)', index: 53, date: '2026-05-31' },
  { label: 'LPL M4 — vs Royal Tigers (Jun 7)', index: 54, date: '2026-06-07' },
  { label: 'LPL M5 — vs Maple Tigers (Jun 13)', index: 55, date: '2026-06-13' },
  { label: 'LPL M6 — vs Premier XI (Jun 27)', index: 56, date: '2026-06-27' },
  { label: 'LPL M7 — vs London Stars (Jul 4)', index: 57, date: '2026-07-04' },
  { label: 'LPL M8 — vs Premier XI (Jul 18)', index: 58, date: '2026-07-18' },
  { label: 'LPL M9 — vs London Rhinos (Jul 25)', index: 59, date: '2026-07-25' },
  { label: 'LPL M10 — vs NLCC (Aug 2)', index: 60, date: '2026-08-02' },
  { label: 'LPL M11 — vs Royal Tigers (Aug 30)', index: 61, date: '2026-08-30' },
  { label: 'LPL M12 — vs London Stars (Sep 6)', index: 62, date: '2026-09-06' },
  // Practice
  { label: 'Practice Match', index: 98, date: 'always' },
  { label: 'Practice Session', index: 99, date: 'always' },
];

function isMatchAvailable(matchDate: string): boolean {
  if (matchDate === 'always') return true;
  const today = new Date().toISOString().split('T')[0];
  return matchDate <= today;
}

export default function NetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<'list' | 'new' | 'detail' | 'patterns' | 'planner' | 'training' | 'principles' | 'shot-mechanics' | 'visual-training' | 'match-plan' | 'team-roles'>('list');
  // Selected shot inside the Shot Mechanics view. Starts on the
  // foundational "Head Over the Ball" entry since it's the base
  // layer every other shot builds on; future shots slot in below.
  const [selectedShot, setSelectedShot] = useState<string>('head-over-ball');
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [match, setMatch] = useState('');
  const [scorerStats, setScorerStats] = useState<ScorerBattingLine | null>(null);
  const [scorerLoading, setScorerLoading] = useState(false);
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchId, setMatchId] = useState<string | undefined>(undefined);
  // All completed matches from Firestore, surfaced as additional
  // dropdown options so a player reflecting on yesterday's practice
  // match picks the actual recorded match (which links the reflection
  // to the matchId) instead of generic "Practice Match".
  const [firestoreMatches, setFirestoreMatches] = useState<Match[]>([]);
  const [howGotOut, setHowGotOut] = useState<string[]>([]);
  const [feeling, setFeeling] = useState(3);
  const [bodyStatus, setBodyStatus] = useState<string[]>([]);
  const [nutrition, setNutrition] = useState<string[]>([]);
  const [whatWentRight, setWhatWentRight] = useState<string[]>([]);
  const [whatWentWrong, setWhatWentWrong] = useState<string[]>([]);
  const [mindsetWord, setMindsetWord] = useState('');
  const [nextInningsPlan, setNextInningsPlan] = useState('');
  const [strengthToBuild, setStrengthToBuild] = useState('');
  const [pressureResponse, setPressureResponse] = useState('');
  const [intentScore, setIntentScore] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Coach-Level Review (collapsible, all optional)
  const [showCoachReview, setShowCoachReview] = useState(false);
  const [controlPercent, setControlPercent] = useState<number | undefined>(undefined);
  const [pickedLengthEarly, setPickedLengthEarly] = useState<'yes' | 'mostly' | 'no' | undefined>(undefined);
  const [watchedBall, setWatchedBall] = useState<'yes' | 'partially' | 'no' | undefined>(undefined);
  const [misjudgedPaceOrBounce, setMisjudgedPaceOrBounce] = useState<boolean | undefined>(undefined);
  const [headOverBall, setHeadOverBall] = useState<'yes' | 'sometimes' | 'no' | undefined>(undefined);
  const [frontFootToPitch, setFrontFootToPitch] = useState<'yes' | 'sometimes' | 'no' | undefined>(undefined);
  const [balanceAtContact, setBalanceAtContact] = useState<'stable' | 'falling' | 'reaching' | undefined>(undefined);
  const [matchPhase, setMatchPhase] = useState<'powerplay' | 'middle' | 'death' | 'na' | undefined>(undefined);
  const [pressureLevel, setPressureLevel] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [intentMode, setIntentMode] = useState<'accelerate' | 'consolidate' | 'settle' | undefined>(undefined);
  const [firstSixBallsPlan, setFirstSixBallsPlan] = useState('');
  const [stuckToPlan, setStuckToPlan] = useState<'yes' | 'partly' | 'no' | undefined>(undefined);
  const [whyShotThatGotMeOut, setWhyShotThatGotMeOut] = useState('');
  // Run Maker tracker — drives Runs/10, Dot Ball %, Strike Rate KPIs,
  // bowler-style drills, focus line. runsScored + ballsFaced are
  // editable even when scorer auto-pull seeds them initially.
  const [runsScored, setRunsScored] = useState<number | undefined>(undefined);
  const [ballsFaced, setBallsFaced] = useState<number | undefined>(undefined);
  const [dotBallsFaced, setDotBallsFaced] = useState<number | undefined>(undefined);
  const [dismissalBowlerArm, setDismissalBowlerArm] = useState<'right' | 'left' | undefined>(undefined);
  const [dismissalBowlerStyle, setDismissalBowlerStyle] = useState<'fast' | 'medium' | 'off-spin' | 'leg-spin' | undefined>(undefined);
  const [stickyBowlerStyle, setStickyBowlerStyle] = useState<'fast' | 'medium' | 'off-spin' | 'leg-spin' | undefined>(undefined);
  const [nextFocusKpi, setNextFocusKpi] = useState<'runs-per-10' | 'intent' | 'dot-ball-pct' | 'use-tactic' | 'pre-ball-routine' | undefined>(undefined);

  // Shot planner state
  const [shotPlan, setShotPlan] = useState<ShotPlan>({ shotConfidence: {}, bowlerPlans: {}, notes: '' });
  const [plannerBowlerType, setPlannerBowlerType] = useState('');
  const [plannerSaving, setPlannerSaving] = useState(false);
  const [plannerLoaded, setPlannerLoaded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // Match Plan state — captains/VCs build per-match squad + roles + plan.
  const [mpMatchId, setMpMatchId] = useState<string>('');
  const [mpMatchLabel, setMpMatchLabel] = useState<string>('');
  const [mpLeague, setMpLeague] = useState<LeagueKey>('Other');
  const [mpOpponent, setMpOpponent] = useState<string>('');
  const [mpVenue, setMpVenue] = useState<string>('');
  const [mpCaptainName, setMpCaptainName] = useState<string>('');
  const [mpVcName, setMpVcName] = useState<string>('');
  const [mpSquad, setMpSquad] = useState<PlayerAssignment[]>([]);
  const [mpTeamTarget, setMpTeamTarget] = useState<number | undefined>(150);
  const [mpStartSmart, setMpStartSmart] = useState<string>('');
  const [mpBuildFast, setMpBuildFast] = useState<string>('');
  const [mpFinishStrong, setMpFinishStrong] = useState<string>('');
  const [mpPowerplayPlan, setMpPowerplayPlan] = useState<string>('');
  const [mpMiddleOversPlan, setMpMiddleOversPlan] = useState<string>('');
  const [mpDeathOversPlan, setMpDeathOversPlan] = useState<string>('');
  // Chase + defending plans — for batting / bowling second scenarios
  const [mpChaseStandard, setMpChaseStandard] = useState<string>('');
  const [mpChaseAggressive, setMpChaseAggressive] = useState<string>('');
  const [mpDefendBelowPar, setMpDefendBelowPar] = useState<string>('');
  const [mpDefendParOrAbove, setMpDefendParOrAbove] = useState<string>('');
  // Rajath additions — opposition intel + per-phase fielding strategy
  const [mpOppositionNotes, setMpOppositionNotes] = useState<string>('');
  const [mpFieldingPowerplay, setMpFieldingPowerplay] = useState<string>('');
  const [mpFieldingMiddleOvers, setMpFieldingMiddleOvers] = useState<string>('');
  const [mpFieldingDeathOvers, setMpFieldingDeathOvers] = useState<string>('');
  const [mpMindsetWord, setMpMindsetWord] = useState<string>('');
  const [mpProcessFocuses, setMpProcessFocuses] = useState<string[]>(['', '', '']);
  const [mpHuddleLine, setMpHuddleLine] = useState<string>('');
  const [mpStatus, setMpStatus] = useState<MatchPlan['status']>('draft');
  const [mpLoading, setMpLoading] = useState<boolean>(false);
  const [mpSaving, setMpSaving] = useState<boolean>(false);
  const [mpSaveStatus, setMpSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [wagonLHB, setWagonLHB] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/c3h/login');
  }, [status, router]);

  const loadReflections = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    const q = query(
      collection(db, 'reflections'),
      where('email', '==', session.user.email.toLowerCase()),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reflection));
    // No auto-deletion. All reflections are preserved for the player
    // to review, edit, or manually delete. Earlier versions capped this
    // at "last 3 match + last 3 practice" and silently wiped older
    // ones from Firestore on load — removed 2026-06-08 per Saad,
    // because losing match history made it impossible to spot
    // season-long patterns and removed the player's ability to revisit
    // older entries.
    setReflections(data);
    setLoading(false);
  };

  // Explicit deletion of a single reflection from Firestore.
  const deleteReflection = async (r: Reflection) => {
    if (!session?.user?.email) return;
    const confirmed = typeof window !== 'undefined'
      && window.confirm(`Delete this reflection?\n\n${r.match} · ${r.date}\n\nThis cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'reflections', r.id));
      setReflections((cur) => cur.filter((x) => x.id !== r.id));
    } catch {
      if (typeof window !== 'undefined') window.alert('Delete failed. Please try again.');
    }
  };

  const loadShotPlan = async () => {
    if (!session?.user?.email) return;
    const planDoc = await getDoc(doc(db, 'shot-plans', session.user.email.toLowerCase()));
    if (planDoc.exists()) {
      const data = planDoc.data() as ShotPlan;
      setShotPlan({ shotConfidence: data.shotConfidence || {}, bowlerPlans: data.bowlerPlans || {}, notes: data.notes || '' });
    }
    setPlannerLoaded(true);
  };

  const saveShotPlan = async (updated: ShotPlan) => {
    if (!session?.user?.email) return;
    setPlannerSaving(true);
    await setDoc(doc(db, 'shot-plans', session.user.email.toLowerCase()), {
      ...updated,
      email: session.user.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
    });
    setTimeout(() => setPlannerSaving(false), 500);
  };

  // ── Match Plan load/save ────────────────────────────────────────
  const loadMatchPlan = async (matchId: string) => {
    if (!matchId) return;
    setMpLoading(true);
    try {
      const planDoc = await getDoc(doc(db, 'match_plans', matchId));
      if (planDoc.exists()) {
        const data = planDoc.data() as MatchPlan;
        setMpMatchLabel(data.matchLabel || '');
        setMpLeague(data.league || 'Other');
        setMpOpponent(data.opponent || '');
        setMpVenue(data.venue || '');
        setMpCaptainName(data.captainName || '');
        setMpVcName(data.vcName || '');
        setMpSquad(data.squad || []);
        setMpTeamTarget(data.teamTarget ?? 150);
        setMpStartSmart(data.startSmartTactic || '');
        setMpBuildFast(data.buildFastTactic || '');
        setMpFinishStrong(data.finishStrongTactic || '');
        setMpPowerplayPlan(data.powerplayPlan || '');
        setMpMiddleOversPlan(data.middleOversPlan || '');
        setMpDeathOversPlan(data.deathOversPlan || '');
        setMpChaseStandard(data.chaseStandardTactic || '');
        setMpChaseAggressive(data.chaseAggressiveTactic || '');
        setMpDefendBelowPar(data.defendBelowParPlan || '');
        setMpDefendParOrAbove(data.defendParOrAbovePlan || '');
        setMpOppositionNotes(data.oppositionNotes || '');
        setMpFieldingPowerplay(data.fieldingPowerplay || '');
        setMpFieldingMiddleOvers(data.fieldingMiddleOvers || '');
        setMpFieldingDeathOvers(data.fieldingDeathOvers || '');
        setMpMindsetWord(data.mindsetWord || '');
        setMpProcessFocuses([
          data.processFocuses?.[0] || '',
          data.processFocuses?.[1] || '',
          data.processFocuses?.[2] || '',
        ]);
        setMpHuddleLine(data.huddleLine || '');
        setMpStatus(data.status || 'draft');
      } else {
        // Reset to fresh plan
        setMpMatchLabel('');
        setMpLeague(detectLeagueFromLabel(''));
        setMpOpponent('');
        setMpVenue('');
        setMpSquad([]);
        setMpTeamTarget(150);
        setMpStartSmart('');
        setMpBuildFast('');
        setMpFinishStrong('');
        setMpPowerplayPlan('');
        setMpMiddleOversPlan('');
        setMpDeathOversPlan('');
        setMpChaseStandard('');
        setMpChaseAggressive('');
        setMpDefendBelowPar('');
        setMpDefendParOrAbove('');
        setMpOppositionNotes('');
        setMpFieldingPowerplay('');
        setMpFieldingMiddleOvers('');
        setMpFieldingDeathOvers('');
        setMpMindsetWord('');
        setMpProcessFocuses(['', '', '']);
        setMpHuddleLine('');
        setMpStatus('draft');
      }
    } catch {
      /* swallow — keep current form state */
    } finally {
      setMpLoading(false);
    }
  };

  const saveMatchPlan = async () => {
    if (!session?.user?.email || !mpMatchId) return;
    setMpSaving(true);
    setMpSaveStatus('idle');
    const now = new Date().toISOString();
    const plan: MatchPlan = {
      matchId: mpMatchId,
      matchLabel: mpMatchLabel,
      league: mpLeague,
      opponent: mpOpponent || undefined,
      venue: mpVenue || undefined,
      captainName: mpCaptainName || undefined,
      vcName: mpVcName || undefined,
      squad: mpSquad,
      teamTarget: mpTeamTarget,
      startSmartTactic: mpStartSmart || undefined,
      buildFastTactic: mpBuildFast || undefined,
      finishStrongTactic: mpFinishStrong || undefined,
      powerplayPlan: mpPowerplayPlan || undefined,
      middleOversPlan: mpMiddleOversPlan || undefined,
      deathOversPlan: mpDeathOversPlan || undefined,
      chaseStandardTactic: mpChaseStandard || undefined,
      chaseAggressiveTactic: mpChaseAggressive || undefined,
      defendBelowParPlan: mpDefendBelowPar || undefined,
      defendParOrAbovePlan: mpDefendParOrAbove || undefined,
      oppositionNotes: mpOppositionNotes || undefined,
      fieldingPowerplay: mpFieldingPowerplay || undefined,
      fieldingMiddleOvers: mpFieldingMiddleOvers || undefined,
      fieldingDeathOvers: mpFieldingDeathOvers || undefined,
      mindsetWord: mpMindsetWord || undefined,
      processFocuses: mpProcessFocuses.filter((f) => f.trim().length > 0),
      huddleLine: mpHuddleLine || undefined,
      status: mpStatus,
      createdBy: session.user.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
      updatedBy: session.user.email.toLowerCase(),
    };
    try {
      await setDoc(doc(db, 'match_plans', mpMatchId), plan, { merge: true });
      setMpSaveStatus('saved');
      setTimeout(() => setMpSaveStatus('idle'), 2000);
    } catch {
      setMpSaveStatus('error');
    } finally {
      setMpSaving(false);
    }
  };

  // Add/remove a player from the squad. roster = EMAIL_TO_PLAYER map.
  const toggleSquadPlayer = (email: string, playerName: string) => {
    setMpSquad((cur) => {
      const exists = cur.find((p) => p.email === email);
      if (exists) {
        return cur.filter((p) => p.email !== email);
      }
      if (cur.length >= 12) return cur; // hard cap at 12
      return [...cur, { playerName, email, battingOrder: cur.length + 1 }];
    });
  };

  const updateSquadAssignment = (email: string, patch: Partial<PlayerAssignment>) => {
    setMpSquad((cur) => cur.map((p) => (p.email === email ? { ...p, ...patch } : p)));
  };

  const toggleShotConfidence = (shotName: string) => {
    const current = shotPlan.shotConfidence[shotName];
    const next: ShotConfidence = !current ? 'strong' : current === 'strong' ? 'working' : current === 'working' ? 'avoid' : 'strong';
    const updated = { ...shotPlan, shotConfidence: { ...shotPlan.shotConfidence, [shotName]: next } };
    setShotPlan(updated);
    saveShotPlan(updated);
  };

  const toggleBowlerShot = (bowlerType: string, shotName: string) => {
    const current = shotPlan.bowlerPlans[bowlerType] || [];
    const next = current.includes(shotName) ? current.filter(s => s !== shotName) : [...current, shotName];
    const updated = { ...shotPlan, bowlerPlans: { ...shotPlan.bowlerPlans, [bowlerType]: next } };
    setShotPlan(updated);
    saveShotPlan(updated);
  };

  useEffect(() => {
    if (session?.user?.email) loadReflections().catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Load every completed Firestore match so the match dropdown can
  // include them. Sorted desc by date — most recent at top.
  useEffect(() => {
    if (!session?.user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'matches'), where('status', '==', 'completed'));
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ ...(d.data() as object), id: d.id } as Match))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        if (!cancelled) setFirestoreMatches(list);
      } catch {
        /* swallow — dropdown still works with hardcoded fixtures */
      }
    })();
    return () => { cancelled = true; };
  }, [session?.user?.email]);

  // Auto-pull scorer stats when a match is selected (only on NEW reflection,
  // not edit). Looks for any completed scorer match on the same date and finds
  // the logged-in player's batting line.
  useEffect(() => {
    if (editingId) { setScorerStats(null); return; }
    if (!match || !session?.user) { setScorerStats(null); return; }
    // Two paths: a real Firestore match (matchId set) or a hardcoded
    // fixture from MATCHES. Bail only if neither.
    const hardcoded = MATCHES.find((x) => x.label === match);
    if (!matchId && !hardcoded) { setScorerStats(null); return; }

    const sessionName = session.user.name || '';
    const sessionEmail = (session.user.email || '').toLowerCase();

    let cancelled = false;
    setScorerLoading(true);
    (async () => {
      try {
        // Fetch the source match doc(s):
        // - If matchId is set (Firestore match dropdown pick), getDoc
        //   it directly. Exact-match lookup, no false positives.
        // - Otherwise fall back to the date-match heuristic against
        //   hardcoded fixtures so league fixtures still auto-fill once
        //   the scorer records the match on that date.
        let docs: { id: string; data: () => unknown }[] = [];
        if (matchId) {
          const single = await getDoc(doc(db, 'matches', matchId));
          if (single.exists()) docs = [single];
        } else if (hardcoded) {
          const q = query(
            collection(db, 'matches'),
            where('date', '==', hardcoded.date),
          );
          const snap = await getDocs(q);
          docs = snap.docs;
        }
        const snap = { docs };

        for (const matchDoc of snap.docs) {
          const data = matchDoc.data() as { innings1?: Innings; innings2?: Innings; matchLabel?: string; scorer?: string; status?: string };
          if (!data.innings1 && !data.innings2) continue;

          // Only pull from completed practice/league matches we actually played
          // (status check would be ideal — fall through if missing)
          for (const innings of [data.innings1, data.innings2]) {
            if (!innings) continue;
            const stats = getBattingStats(innings);

            // Try to find the logged-in player by name match
            // 1) exact match against full session name
            // 2) substring match (first name + last name)
            const myStat = stats.find((s) => {
              const sn = s.name.toLowerCase();
              if (sessionName && sn === sessionName.toLowerCase()) return true;
              const firstName = sessionName.split(' ')[0]?.toLowerCase() ?? '';
              const lastName = sessionName.split(' ').slice(-1)[0]?.toLowerCase() ?? '';
              if (firstName && lastName && sn.includes(firstName) && sn.includes(lastName)) return true;
              // also try email prefix match (e.g. saad@... → "saad")
              const emailPrefix = sessionEmail.split('@')[0];
              if (emailPrefix && sn.includes(emailPrefix)) return true;
              return false;
            });

            if (myStat && !cancelled) {
              setScorerStats({
                runs: myStat.runs,
                balls: myStat.balls,
                fours: myStat.fours,
                sixes: myStat.sixes,
                isOut: myStat.isOut,
                howOut: myStat.howOut,
                matchLabel: data.matchLabel || hardcoded?.label || match,
                scoredBy: data.scorer || 'unknown',
              });
              // Seed the Run Maker tracker fields from the scorecard so
              // the strike-rate / runs-per-10 KPIs work out of the box.
              // The player can override either field manually in the
              // Coach-Level Review form below.
              setRunsScored((cur) => (cur === undefined ? myStat.runs : cur));
              setBallsFaced((cur) => (cur === undefined ? myStat.balls : cur));
              setScorerLoading(false);
              return;
            }
          }
        }
        if (!cancelled) {
          setScorerStats(null);
          setScorerLoading(false);
        }
      } catch {
        if (!cancelled) {
          setScorerStats(null);
          setScorerLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, editingId, session?.user?.email]);

  // When scorerStats is loaded for the first time on this match selection,
  // auto-fill howGotOut if it's still empty
  useEffect(() => {
    if (!scorerStats) return;
    if (howGotOut.length > 0) return; // don't override player's manual selection
    if (!scorerStats.isOut) {
      setHowGotOut(['Not out']);
      return;
    }
    const mapped = mapScorerWicketToReflection(scorerStats.howOut);
    if (mapped) setHowGotOut([mapped]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scorerStats]);

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-primary-400">Loading...</div></div>;
  }

  const toggleCheckbox = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleSubmit = async () => {
    if (!match || !session.user?.email) return;
    setSaving(true);
    const opponent = match.includes('vs') ? match.split('vs ')[1]?.split(' (')[0] || '' : '';
    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
      email: session.user.email.toLowerCase(),
      matchIndex,
      match,
      opponent,
      howGotOut,
      feeling,
      bodyStatus,
      nutrition,
      whatWentRight,
      whatWentWrong,
      mindsetWord,
      nextInningsPlan,
      strengthToBuild,
      pressureResponse,
      intentScore,
      notes,
      updatedAt: now,
    };
    // Only set matchId when the user picked a real Firestore-recorded
    // match. Don't clobber an existing matchId on update if not set.
    if (matchId) payload.matchId = matchId;

    // Coach-level review fields — only persist when set so we don't
    // pollute Firestore with a forest of `undefined`s.
    if (controlPercent !== undefined) payload.controlPercent = controlPercent;
    if (pickedLengthEarly !== undefined) payload.pickedLengthEarly = pickedLengthEarly;
    if (watchedBall !== undefined) payload.watchedBall = watchedBall;
    if (misjudgedPaceOrBounce !== undefined) payload.misjudgedPaceOrBounce = misjudgedPaceOrBounce;
    if (headOverBall !== undefined) payload.headOverBall = headOverBall;
    if (frontFootToPitch !== undefined) payload.frontFootToPitch = frontFootToPitch;
    if (balanceAtContact !== undefined) payload.balanceAtContact = balanceAtContact;
    if (matchPhase !== undefined) payload.matchPhase = matchPhase;
    if (pressureLevel !== undefined) payload.pressureLevel = pressureLevel;
    if (intentMode !== undefined) payload.intentMode = intentMode;
    if (firstSixBallsPlan.trim()) payload.firstSixBallsPlan = firstSixBallsPlan.trim();
    if (stuckToPlan !== undefined) payload.stuckToPlan = stuckToPlan;
    if (whyShotThatGotMeOut.trim()) payload.whyShotThatGotMeOut = whyShotThatGotMeOut.trim();
    if (runsScored !== undefined) payload.runsScored = runsScored;
    if (ballsFaced !== undefined) payload.ballsFaced = ballsFaced;
    if (dotBallsFaced !== undefined) payload.dotBallsFaced = dotBallsFaced;
    if (dismissalBowlerArm !== undefined) payload.dismissalBowlerArm = dismissalBowlerArm;
    if (dismissalBowlerStyle !== undefined) payload.dismissalBowlerStyle = dismissalBowlerStyle;
    if (stickyBowlerStyle !== undefined) payload.stickyBowlerStyle = stickyBowlerStyle;
    if (nextFocusKpi !== undefined) payload.nextFocusKpi = nextFocusKpi;

    if (editingId) {
      // Update existing reflection — preserve original date + createdAt; bump editCount
      const existing = reflections.find((r) => r.id === editingId);
      await updateDoc(doc(db, 'reflections', editingId), {
        ...payload,
        editCount: (existing?.editCount ?? 0) + 1,
      });
    } else {
      // Create new reflection
      await addDoc(collection(db, 'reflections'), {
        ...payload,
        date: now.split('T')[0],
        createdAt: now,
        editCount: 0,
      });
    }

    try { await loadReflections(); } catch { /* index may still be building */ }
    setSaving(false);
    setEditingId(null);
    setView('list');
    setMatch(''); setMatchIndex(0); setMatchId(undefined); setHowGotOut([]); setFeeling(3); setBodyStatus([]); setNutrition([]); setWhatWentRight([]);
    setShowCoachReview(false);
    setControlPercent(undefined); setPickedLengthEarly(undefined); setWatchedBall(undefined); setMisjudgedPaceOrBounce(undefined);
    setHeadOverBall(undefined); setFrontFootToPitch(undefined); setBalanceAtContact(undefined);
    setMatchPhase(undefined); setPressureLevel(undefined); setIntentMode(undefined);
    setFirstSixBallsPlan(''); setStuckToPlan(undefined); setWhyShotThatGotMeOut('');
    setWhatWentWrong([]); setMindsetWord(''); setNextInningsPlan('');
    setStrengthToBuild(''); setPressureResponse(''); setIntentScore(3); setNotes('');
  };

  // Load a saved reflection into the form for editing
  const beginEdit = (r: Reflection) => {
    setEditingId(r.id);
    setMatch(r.match);
    setMatchIndex(r.matchIndex);
    setMatchId(r.matchId);
    setHowGotOut(Array.isArray(r.howGotOut) ? r.howGotOut : r.howGotOut ? [r.howGotOut] : []);
    setFeeling(r.feeling);
    setBodyStatus(r.bodyStatus || []);
    setNutrition(r.nutrition || []);
    setWhatWentRight(r.whatWentRight || []);
    setWhatWentWrong(r.whatWentWrong || []);
    setMindsetWord(r.mindsetWord || '');
    setNextInningsPlan(r.nextInningsPlan || '');
    setStrengthToBuild(r.strengthToBuild || '');
    setPressureResponse(r.pressureResponse || '');
    setIntentScore(r.intentScore);
    setNotes(r.notes || '');
    // Coach-level review — restore if any field was set
    setControlPercent(r.controlPercent);
    setPickedLengthEarly(r.pickedLengthEarly);
    setWatchedBall(r.watchedBall);
    setMisjudgedPaceOrBounce(r.misjudgedPaceOrBounce);
    setHeadOverBall(r.headOverBall);
    setFrontFootToPitch(r.frontFootToPitch);
    setBalanceAtContact(r.balanceAtContact);
    setMatchPhase(r.matchPhase);
    setPressureLevel(r.pressureLevel);
    setIntentMode(r.intentMode);
    setFirstSixBallsPlan(r.firstSixBallsPlan || '');
    setStuckToPlan(r.stuckToPlan);
    setWhyShotThatGotMeOut(r.whyShotThatGotMeOut || '');
    setRunsScored(r.runsScored);
    setBallsFaced(r.ballsFaced);
    setDotBallsFaced(r.dotBallsFaced);
    setDismissalBowlerArm(r.dismissalBowlerArm);
    setDismissalBowlerStyle(r.dismissalBowlerStyle);
    setStickyBowlerStyle(r.stickyBowlerStyle);
    setNextFocusKpi(r.nextFocusKpi);
    // Auto-expand the coach review if any of its fields were filled
    const hasCoachData = r.controlPercent !== undefined || r.pickedLengthEarly !== undefined ||
      r.watchedBall !== undefined || r.headOverBall !== undefined ||
      r.frontFootToPitch !== undefined || r.balanceAtContact !== undefined ||
      r.matchPhase !== undefined || r.pressureLevel !== undefined ||
      r.intentMode !== undefined || (r.firstSixBallsPlan && r.firstSixBallsPlan.length > 0) ||
      r.stuckToPlan !== undefined || (r.whyShotThatGotMeOut && r.whyShotThatGotMeOut.length > 0);
    setShowCoachReview(!!hasCoachData);
    setView('new');
  };

  // Pattern analysis
  const getPatterns = () => {
    const matchRefs = reflections.filter(r => r.matchIndex !== 99);
    if (matchRefs.length < 2) return null;

    const mistakeCounts: Record<string, number> = {};
    const strengthCounts: Record<string, number> = {};
    const dismissalCounts: Record<string, number> = {};

    matchRefs.forEach(r => {
      r.whatWentWrong.forEach(w => { mistakeCounts[w] = (mistakeCounts[w] || 0) + 1; });
      r.whatWentRight.forEach(w => { strengthCounts[w] = (strengthCounts[w] || 0) + 1; });
      const outs = Array.isArray(r.howGotOut) ? r.howGotOut : r.howGotOut ? [r.howGotOut] : [];
      outs.filter(o => o !== 'Not out' && o !== 'Did not bat').forEach(o => {
        dismissalCounts[o] = (dismissalCounts[o] || 0) + 1;
      });
    });

    const topMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topStrengths = Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDismissals = Object.entries(dismissalCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const intentTrend = matchRefs.map(r => ({ match: r.match.split(' —')[0], score: r.intentScore })).reverse();
    const feelingTrend = matchRefs.map(r => ({ match: r.match.split(' —')[0], score: r.feeling || 3 })).reverse();

    return { topMistakes, topStrengths, topDismissals, intentTrend, feelingTrend, matchRefs };
  };

  const patterns = getPatterns();

  const getCoachingTip = (r: Reflection): string => {
    const wrongs = r.whatWentWrong;
    const rights = r.whatWentRight;
    const out = Array.isArray(r.howGotOut) ? r.howGotOut : r.howGotOut ? [r.howGotOut] : [];
    const intent = r.intentScore;
    const sections: { title: string; tip: string }[] = [];

    // Check for repeated patterns across reflections
    const matchRefs = reflections.filter(ref => ref.id !== r.id && ref.matchIndex !== 99);
    const pastWrongs = matchRefs.flatMap(ref => ref.whatWentWrong);
    const pastOuts = matchRefs.flatMap(ref => Array.isArray(ref.howGotOut) ? ref.howGotOut : ref.howGotOut ? [ref.howGotOut] : []);
    const repeatedMistakes = wrongs.filter(w => pastWrongs.includes(w));
    const repeatedDismissals = out.filter(o => pastOuts.includes(o) && o !== 'Not out' && o !== 'Did not bat');

    // PATTERN ALERTS — most valuable insight
    if (repeatedDismissals.length > 0) {
      sections.push({
        title: 'Pattern Alert',
        tip: `You have been dismissed "${repeatedDismissals[0]}" in multiple matches. This is not a one-off — it is a pattern. In your next nets session, ask your coach to specifically set up drills that simulate this dismissal so you can train a different response.`
      });
    }
    if (repeatedMistakes.length > 0 && repeatedDismissals.length === 0) {
      sections.push({
        title: 'Recurring Issue',
        tip: `"${repeatedMistakes[0]}" keeps showing up in your reflections. Awareness is the first step — now you need a specific drill or trigger to break this habit. Write down one concrete action you will do differently next time this situation arises.`
      });
    }

    // COMBINED SIGNALS — dismissal + mistake together
    if (out.some(o => o.includes('Caught — Infield') || o.includes('Hit straight to fielder')) && wrongs.includes('Poor shot selection')) {
      sections.push({ title: 'Shot Discipline', tip: 'You picked the wrong shot and it went straight to a fielder. Before playing an attacking shot, scan the field first. In your next session, practice the LOOK step — identify where the gap is before the bowler delivers. If there is no gap, rotate strike instead.' });
    } else if (out.some(o => o.includes('Caught — Infield') || o.includes('Hit straight to fielder')) && wrongs.includes('Played too early')) {
      sections.push({ title: 'Timing Fix', tip: 'You committed to the shot before the ball arrived and it went to a fielder. Work on letting the ball come to you. A good drill: in nets, deliberately play every ball half a second later than you normally would. This trains patience and improves timing.' });
    } else if (out.some(o => o.includes('Caught — Infield') || o.includes('Hit straight to fielder'))) {
      sections.push({ title: 'Finding Gaps', tip: 'Getting caught infield means the ball went where a fielder was standing. Before each ball, use your LOOK routine to identify at least two gaps. Only play into those zones. If unsure, defend or work a single.' });
    }

    if (out.some(o => o.includes('Bowled')) && wrongs.includes('Lost concentration')) {
      sections.push({ title: 'Focus Through the Ball', tip: 'Getting bowled when concentration drops means your head moved or you did not watch the ball onto the bat. Try this: after every boundary or good shot, do a deliberate reset — tap bat, breathe, say your trigger word. The ball after a good shot is when most batters lose focus.' });
    } else if (out.some(o => o.includes('Bowled')) && wrongs.includes('No clear plan')) {
      sections.push({ title: 'Know Your Stump', tip: 'Getting bowled without a plan means you were reactive, not proactive. Before each ball, decide: am I looking to score or survive this delivery? Even "I will defend anything on the stumps" is a plan. No plan = no purpose = easy wicket.' });
    } else if (out.some(o => o.includes('Bowled'))) {
      sections.push({ title: 'Straight Bat', tip: 'Getting bowled usually means bat is not covering the stumps. Focus on playing straight — bat comes down in line with off stump. Practice shadow batting: stand at the crease and swing the bat straight 20 times before your next session.' });
    }

    if (out.some(o => o.includes('LBW')) && wrongs.includes('Poor footwork')) {
      sections.push({ title: 'Front Foot First', tip: 'LBW with poor footwork means your front foot is not getting to the pitch of the ball. Drill: place a coin one step ahead of your crease. Every ball in nets, your front foot must land on or past that coin. This one change will dramatically reduce LBW dismissals.' });
    } else if (out.some(o => o.includes('LBW'))) {
      sections.push({ title: 'Get Forward', tip: 'LBW happens when you are stuck on the crease. Lead with your front foot towards the ball and get your bat in line. If the ball is full, front foot forward. If short, back and across. The danger zone is being half-forward — commit to one or the other.' });
    }

    if (out.some(o => o.includes('Caught — Keeper') || o.includes('Caught — Slips')) && wrongs.includes('Chased a wide delivery')) {
      sections.push({ title: 'Leave It Alone', tip: 'Edging to the keeper while chasing width is the most fixable dismissal in cricket. Set a strict rule: anything more than one bat-width outside off stump, leave it. Do not even move your bat. Practice this in nets — let 5 balls outside off go past you without playing. It takes discipline but it works.' });
    } else if (out.some(o => o.includes('Caught — Keeper') || o.includes('Caught — Slips'))) {
      sections.push({ title: 'Soft Hands', tip: 'Edges carry to the keeper when you push hard at the ball. Practice playing with soft hands — let the ball come to the bat rather than driving at it. In nets, try playing defensive shots where the ball drops at your feet instead of racing away.' });
    }

    if (out.some(o => o.includes('Run Out'))) {
      sections.push({ title: 'Communication', tip: 'Run outs are 100% preventable. Three rules: (1) The striker calls for shots in front of the wicket, non-striker calls for shots behind. (2) Call YES, NO, or WAIT — never "maybe." (3) If in doubt, do not run. One dot ball is better than losing a wicket.' });
    }

    if (out.some(o => o.includes('Stumped')) && wrongs.includes('Rushed my innings')) {
      sections.push({ title: 'Stay Grounded', tip: 'Getting stumped while rushing means you are charging down the wicket without reading the ball. Against spin, go forward only if the ball is in your hitting zone. If you go down, make sure your back foot stays behind the crease as insurance.' });
    }

    // MENTAL STATE — intent + mistakes combined
    if (intent <= 2 && wrongs.includes('Froze under pressure')) {
      sections.push({ title: 'Break the Freeze', tip: 'Low intent plus freezing under pressure means you went into survival mode. Before your next innings, stand at the crease and say out loud: "I am here to score, not survive." Pick one scoring shot you trust and commit to playing it in the first 5 balls. Action beats anxiety.' });
    } else if (intent <= 2 && wrongs.includes('Defensive mindset')) {
      sections.push({ title: 'Flip the Script', tip: 'You batted defensively with low intent. Defence has a place, but not as your default. Challenge yourself: next innings, score at least one run every three balls in your first 10. This forces you to look for singles and stay active instead of blocking.' });
    } else if (intent <= 2) {
      sections.push({ title: 'Raise Your Intent', tip: 'Your intent score was low. Intent does not mean slogging — it means having a clear purpose for every ball. Before each delivery, decide: "I am looking to score off this ball" or "I am going to defend this one well." Both are intentional. Blocking without a plan is not.' });
    }

    if (intent >= 4 && wrongs.includes('Tried to hit too hard')) {
      sections.push({ title: 'Channel the Intent', tip: 'You had great intent but tried to muscle the ball too hard. High intent with poor execution usually means your head is falling over or your base is too wide. Next session, focus on hitting through the ball, not at it. Think "timing" not "power." The best shots in cricket look effortless.' });
    }

    if (intent >= 4 && rights.length >= 3 && wrongs.length <= 1) {
      sections.push({ title: 'Keep This Going', tip: 'Strong intent, multiple things going right, minimal mistakes — this is what a quality innings looks like. Save this reflection and read it before your next match. This is your template. Replicate the process, not the result.' });
    }

    // POSITIVE REINFORCEMENT — what went right matters
    if (rights.includes('Stayed calm under pressure') && rights.includes('Used my pre-ball routine')) {
      sections.push({ title: 'Mental Game Working', tip: 'You stayed calm AND used your routine — that is the system working exactly as designed. Your routine is now protecting your performance. Trust it even more next time.' });
    } else if (rights.includes('Stayed calm under pressure') && wrongs.length > 0) {
      sections.push({ title: 'Composure is Your Edge', tip: 'Despite some technical issues, you stayed calm. That composure is what separates players who improve from players who get stuck. Fix the technical stuff in nets, but protect this calm mindset at all costs — it is your biggest asset.' });
    }

    if (rights.includes('Adapted to conditions') && rights.includes('Read the bowler well')) {
      sections.push({ title: 'Cricket IQ', tip: 'Adapting to conditions and reading the bowler shows high cricket intelligence. This is a skill most players never develop. Keep a mental note of what you noticed — which bowler did what, how the pitch behaved — and share it with teammates. This kind of awareness wins matches.' });
    }

    if (rights.includes('Good running between wickets') && !wrongs.includes('Did not rotate strike')) {
      sections.push({ title: 'Running Pressure', tip: 'Good running between wickets is an underrated skill. It puts pressure on the fielding side, tires the bowler, and keeps the scoreboard moving. Keep pushing for those quick singles — they add up faster than boundaries.' });
    }

    // PRACTICE SESSION specific
    if (r.matchIndex === 99 || r.matchIndex === 98) {
      if (wrongs.length > 2) {
        sections.push({ title: 'Practice Focus', tip: `You identified ${wrongs.length} things that went wrong. For your next practice, pick only the top one and work exclusively on that. Trying to fix everything at once leads to fixing nothing. One focus, one session, real improvement.` });
      }
      if (out.length > 2) {
        sections.push({ title: 'Dismissal Variety', tip: `You got out ${out.length} different ways in practice. Look at which dismissal happened most — that is your priority to fix. Ask your coach to bowl specifically to that weakness in your next session.` });
      }
    }

    // NEXT INNINGS PLAN feedback
    if (r.nextInningsPlan && r.nextInningsPlan.length > 5) {
      sections.push({ title: 'Your Plan', tip: `You said: "${r.nextInningsPlan}" — good. Now make it specific. When exactly will you do this? Against what type of ball? Write it as: "When [situation], I will [action]." This turns a wish into a trigger.` });
    }

    if (sections.length === 0) {
      return 'Solid reflection. Keep this habit going — the players who grow fastest are the ones who review honestly after every game. You are building the foundation for long-term improvement.';
    }

    // Return top 2 most relevant insights
    return sections.slice(0, 2).map(s => `**${s.title}:** ${s.tip}`).join('\n\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <Navbar />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <Link href="/c3h/dashboard" className="text-gray-500 text-sm hover:text-primary-400 transition-colors mb-2 inline-block">&larr; Dashboard</Link>
              <h1 className="text-3xl font-bold text-white">The <span className="gradient-text">Nets</span></h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setView(view === 'training' ? 'list' : 'training')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'training' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Training
              </button>
              <button
                onClick={() => setView(view === 'principles' ? 'list' : 'principles')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'principles' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Batting Principles
              </button>
              <button
                onClick={() => setView(view === 'team-roles' ? 'list' : 'team-roles')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'team-roles' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Team Roles
              </button>
              <button
                onClick={() => setView(view === 'visual-training' ? 'list' : 'visual-training')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'visual-training' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Visual Training
              </button>
              <button
                onClick={() => setView(view === 'shot-mechanics' ? 'list' : 'shot-mechanics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'shot-mechanics' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Shot Mechanics
              </button>
              <button
                onClick={() => { if (view !== 'planner') { setView('planner'); if (!plannerLoaded) loadShotPlan(); } else setView('list'); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'planner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Shot Planner
              </button>
              {isC3HCaptain(session?.user?.email) && (
                <button
                  onClick={() => setView(view === 'match-plan' ? 'list' : 'match-plan')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    view === 'match-plan' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Match Plan
                </button>
              )}
              {patterns && (
                <button
                  onClick={() => setView(view === 'patterns' ? 'list' : 'patterns')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    view === 'patterns' ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  My Patterns
                </button>
              )}
              {view !== 'new' && view !== 'planner' && view !== 'principles' && (
                <button
                  onClick={() => { setEditingId(null); setView('new'); }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105"
                >
                  + Reflection
                </button>
              )}
            </div>
          </div>

          {/* PATTERNS VIEW */}
          {view === 'patterns' && patterns && (
            <div className="space-y-6">
              {/* Growth Path */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">My Growth Path</h3>
                <div className="space-y-4">
                  {patterns.matchRefs.slice().reverse().map((r, i) => {
                    const prevRef = i > 0 ? patterns.matchRefs.slice().reverse()[i - 1] : null;
                    const fixedFromLast = prevRef ? r.whatWentRight.filter(w =>
                      prevRef.whatWentWrong.some(pw => w.toLowerCase().includes(pw.split(' ')[0].toLowerCase()))
                    ) : [];
                    return (
                      <div key={r.id} className="glass rounded-xl p-4 border-l-4 border-l-primary-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold text-sm">{r.match.split(' —')[0]}</span>
                          <span className="text-xs text-gray-500">{r.date}</span>
                        </div>
                        {r.whatWentWrong.length > 0 && (
                          <p className="text-red-400 text-xs mb-1">Mistake: {r.whatWentWrong[0]}</p>
                        )}
                        {r.nextInningsPlan && (
                          <p className="text-accent-400 text-xs mb-1">Plan: {r.nextInningsPlan}</p>
                        )}
                        {fixedFromLast.length > 0 && (
                          <p className="text-primary-400 text-xs font-bold">Improved from last match!</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Intent Trend */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Intent Score Trend</h3>
                <div className="flex items-end gap-3 justify-center h-32">
                  {patterns.intentTrend.map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-primary-400 font-bold">{t.score}</span>
                      <div
                        className="w-10 rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400"
                        style={{ height: `${(t.score / 5) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{t.match}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feeling Trend */}
              <div className="glass rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-bold text-white mb-4">How I Felt — Match Day</h3>
                <div className="flex items-end gap-3 justify-center h-32">
                  {patterns.feelingTrend.map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs">{['😫','😐','🙂','💪','🔥'][(t.score - 1)]}</span>
                      <div
                        className="w-10 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400"
                        style={{ height: `${(t.score / 5) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{t.match}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Mistakes */}
              {patterns.topMistakes.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">Recurring Mistakes</h3>
                  <div className="space-y-2">
                    {patterns.topMistakes.map(([mistake, count]) => (
                      <div key={mistake} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-sm">{mistake}</span>
                            <span className="text-red-400 text-xs font-bold">{count}x</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-red-500/60 h-2 rounded-full" style={{ width: `${(count / reflections.length) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Strengths */}
              {patterns.topStrengths.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">Consistent Strengths</h3>
                  <div className="space-y-2">
                    {patterns.topStrengths.map(([strength, count]) => (
                      <div key={strength} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-sm">{strength}</span>
                            <span className="text-primary-400 text-xs font-bold">{count}x</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-primary-500/60 h-2 rounded-full" style={{ width: `${(count / reflections.length) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How I Get Out */}
              {patterns.topDismissals.length > 0 && (
                <div className="glass rounded-2xl p-6 border border-accent-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">How I Get Out</h3>
                  <div className="flex flex-wrap gap-3">
                    {patterns.topDismissals.map(([dismissal, count]) => (
                      <div key={dismissal} className="glass rounded-xl p-4 text-center border border-white/10">
                        <p className="text-white font-bold text-sm">{dismissal}</p>
                        <p className="text-accent-400 text-xs mt-1">{count} time{count > 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>
            </div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <>
              {/* ── Next Match Coach Review ────────────────────────────
                  Cross-reflection aggregation: per-competition KPIs
                  (LPL / LCL / Practice) + synthesised coach voice.
                  Rule-based, LLM-free. Lives in app/c3h/lib/nextMatchInsight.ts.
                  Renders when the player has at least one match-linked
                  reflection. */}
              {reflections.filter(r => r.matchIndex !== 99).length >= 1 && (() => {
                const nm = generateNextMatchInsight(
                  reflections.map(r => ({
                    match: r.match,
                    matchIndex: r.matchIndex,
                    howGotOut: r.howGotOut,
                    whatWentRight: r.whatWentRight,
                    whatWentWrong: r.whatWentWrong,
                    intentScore: r.intentScore,
                    feeling: r.feeling,
                    runsScored: r.runsScored,
                    ballsFaced: r.ballsFaced,
                    dotBallsFaced: r.dotBallsFaced,
                    dismissalBowlerArm: r.dismissalBowlerArm,
                    dismissalBowlerStyle: r.dismissalBowlerStyle,
                  })),
                );
                if (nm.aggregate.matches === 0) return null;
                const fmtKpi = (v: number | null, suffix = '') => v === null ? '—' : `${v}${suffix}`;
                return (
                  <div className="mb-6 glass rounded-2xl p-6 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        Next Match Coach Review
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-amber-300/80">
                        across {nm.aggregate.matches} reflection{nm.aggregate.matches === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Aggregate KPI strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <div className="glass rounded-lg p-3 border border-amber-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/70 mb-1">Strike rate</p>
                        <p className={`text-2xl font-bold ${
                          nm.aggregate.strikeRate === null ? 'text-gray-500'
                            : nm.aggregate.strikeRate >= 100 ? 'text-emerald-300'
                            : nm.aggregate.strikeRate >= 75 ? 'text-amber-200'
                            : 'text-red-300'
                        }`}>{fmtKpi(nm.aggregate.strikeRate)}</p>
                      </div>
                      <div className="glass rounded-lg p-3 border border-amber-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/70 mb-1">Runs / 10 balls</p>
                        <p className="text-2xl font-bold text-white">{fmtKpi(nm.aggregate.runsPer10Balls)}</p>
                      </div>
                      <div className="glass rounded-lg p-3 border border-amber-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/70 mb-1">Dot ball %</p>
                        <p className={`text-2xl font-bold ${
                          nm.aggregate.dotBallPercent === null ? 'text-gray-500'
                            : nm.aggregate.dotBallPercent > 40 ? 'text-red-300'
                            : 'text-emerald-300'
                        }`}>{fmtKpi(nm.aggregate.dotBallPercent, '%')}</p>
                      </div>
                      <div className="glass rounded-lg p-3 border border-amber-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/70 mb-1">Intent avg</p>
                        <p className="text-2xl font-bold text-white">{fmtKpi(nm.aggregate.intentAvg, '/5')}</p>
                      </div>
                    </div>

                    {/* Per-competition stats */}
                    {nm.competitionStats.length > 1 && (
                      <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/70 font-bold mb-2">By competition</p>
                        <div className="space-y-1.5">
                          {nm.competitionStats.map((c) => (
                            <div key={c.key} className="flex items-baseline justify-between gap-3 text-sm rounded-lg bg-white/3 border border-white/5 px-3 py-2">
                              <div className="flex-shrink-0">
                                <span className="text-white font-semibold">{c.label}</span>
                                <span className="text-gray-500 text-xs"> · {c.matches} match{c.matches === 1 ? '' : 'es'}</span>
                              </div>
                              <div className="text-xs text-gray-300 text-right flex flex-wrap gap-x-3 justify-end">
                                <span>SR <strong className={c.strikeRate === null ? 'text-gray-500' : c.strikeRate >= 100 ? 'text-emerald-300' : c.strikeRate >= 75 ? 'text-amber-200' : 'text-red-300'}>{fmtKpi(c.strikeRate)}</strong></span>
                                <span>Runs <strong className="text-white">{c.runs}</strong></span>
                                <span>Balls <strong className="text-white">{c.balls}</strong></span>
                                {c.dotBallPercent !== null && (
                                  <span>Dot% <strong className={c.dotBallPercent > 40 ? 'text-red-300' : 'text-emerald-300'}>{c.dotBallPercent}%</strong></span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coach voice — synthesised */}
                    {nm.coachReview.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] uppercase tracking-wider text-amber-300/70 font-bold mb-2">Coach voice — going into next match</p>
                        <ul className="space-y-2">
                          {nm.coachReview.map((line, i) => (
                            <li key={i} className="text-sm text-gray-200 leading-relaxed flex gap-2">
                              <span className="text-amber-400 flex-shrink-0">→</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Go into next match with — one-line rallying cue */}
                    <div className="rounded-md bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/40 px-3 py-2.5 text-sm">
                      <span className="text-amber-300 font-semibold">🎯 Go into next match with:</span>{' '}
                      <span className="text-white italic">&ldquo;{nm.goIntoNextMatchWith}&rdquo;</span>
                    </div>
                  </div>
                );
              })()}

              {/* Recommended Principles (based on past reflections) */}
              {patterns && patterns.topMistakes.length > 0 && (() => {
                const recs: { mistake: string; count: number; principle: string; tip: string }[] = [];
                const seen = new Set<string>();
                for (const [mistake, count] of patterns.topMistakes) {
                  const m = MISTAKE_TO_PRINCIPLE[mistake];
                  if (m && !seen.has(m.principle)) {
                    recs.push({ mistake, count, principle: m.principle, tip: m.tip });
                    seen.add(m.principle);
                  }
                  if (recs.length >= 3) break;
                }
                if (recs.length === 0) return null;
                return (
                  <div className="mb-6 glass rounded-2xl p-6 border-2 border-accent-500/30 bg-gradient-to-r from-accent-500/5 to-primary-500/5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Recommended for You
                      </h3>
                      <button
                        onClick={() => setView('principles')}
                        className="text-xs text-accent-400 hover:text-accent-300 underline"
                      >
                        View all principles →
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Based on your last {patterns.matchRefs.length} reflection{patterns.matchRefs.length === 1 ? '' : 's'}, focus on these principles before your next innings:
                    </p>
                    <div className="space-y-3">
                      {recs.map((rec, i) => (
                        <div key={i} className="glass rounded-xl p-4 border border-white/10">
                          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                              <span className="text-accent-400">#{i + 1}</span>
                              {rec.principle}
                            </h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {rec.mistake} ({rec.count}×)
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{rec.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ── Match Coverage Tracker ─────────────────────────────
                  Shows all 26 league matches (LCL 14 + LPL 12) with their
                  reflection status, so the player knows which matches
                  they've reflected on and can quickly add one for any
                  missing match. Practice sessions excluded — they
                  don't have a fixed schedule. */}
              {(() => {
                const leagueMatches = MATCHES.filter((m) => m.index !== 98 && m.index !== 99);
                const today = new Date().toISOString().slice(0, 10);
                const reflectionByLabel = new Map(reflections.map((r) => [r.match, r]));
                const lclMatches = leagueMatches.filter((m) => m.label.startsWith('LCL'));
                const lplMatches = leagueMatches.filter((m) => m.label.startsWith('LPL'));
                const lclReflected = lclMatches.filter((m) => reflectionByLabel.has(m.label)).length;
                const lplReflected = lplMatches.filter((m) => reflectionByLabel.has(m.label)).length;
                const totalReflected = lclReflected + lplReflected;
                const playedMatches = leagueMatches.filter((m) => m.date <= today);
                const playedReflected = playedMatches.filter((m) => reflectionByLabel.has(m.label)).length;
                const playedMissing = playedMatches.length - playedReflected;

                const prepareNewReflectionFor = (m: typeof MATCHES[number]) => {
                  setEditingId(null);
                  // Reset form before pre-filling
                  setMatch(m.label);
                  setMatchIndex(m.index);
                  setMatchId(undefined);
                  setView('new');
                };

                return (
                  <div className="mb-6 glass rounded-2xl p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        <h3 className="text-base font-bold text-white">Match Coverage</h3>
                      </div>
                      <div className="text-xs text-gray-300">
                        <span className="text-emerald-300 font-semibold">{totalReflected}</span> / {leagueMatches.length} matches reflected
                        {playedMissing > 0 && (
                          <span className="text-amber-300 ml-2">· {playedMissing} played but missing</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-center">
                        <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">LCL T30</p>
                        <p className="text-white font-bold"><span className="text-emerald-300">{lclReflected}</span> / {lclMatches.length}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-center">
                        <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">LPL T30</p>
                        <p className="text-white font-bold"><span className="text-emerald-300">{lplReflected}</span> / {lplMatches.length}</p>
                      </div>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-xs text-emerald-400 hover:text-emerald-300 list-none flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Show all 26 matches
                      </summary>
                      <div className="mt-3 space-y-3">
                        {([
                          { name: 'London Cricket League (LCL T30)', list: lclMatches },
                          { name: 'London Premier League (LPL T30)', list: lplMatches },
                        ] as const).map((group) => (
                          <div key={group.name}>
                            <p className="text-[10px] uppercase tracking-wider text-emerald-300/70 font-bold mb-1.5">{group.name}</p>
                            <div className="space-y-1.5">
                              {group.list.map((m) => {
                                const refl = reflectionByLabel.get(m.label);
                                const isPast = m.date <= today;
                                return (
                                  <div
                                    key={m.label}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
                                      refl
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : isPast
                                          ? 'bg-amber-500/10 border-amber-500/30'
                                          : 'bg-white/3 border-white/10'
                                    }`}
                                  >
                                    <span className="flex-shrink-0 text-base">
                                      {refl ? '✅' : isPast ? '⚠️' : '🗓'}
                                    </span>
                                    <span className="flex-1 min-w-0 text-gray-200 truncate">{m.label}</span>
                                    {refl ? (
                                      <button
                                        type="button"
                                        onClick={() => { setSelectedReflection(refl); setView('detail'); }}
                                        className="flex-shrink-0 text-emerald-300 hover:text-emerald-200 font-semibold"
                                      >
                                        View →
                                      </button>
                                    ) : isPast ? (
                                      <button
                                        type="button"
                                        onClick={() => prepareNewReflectionFor(m)}
                                        className="flex-shrink-0 text-amber-300 hover:text-amber-200 font-semibold"
                                      >
                                        + Add
                                      </button>
                                    ) : (
                                      <span className="flex-shrink-0 text-gray-500">Upcoming</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                );
              })()}

              {loading ? (
                <div className="text-center py-12"><span className="text-gray-500">Loading reflections...</span></div>
              ) : reflections.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/10">
                  <div className="text-5xl mb-4">🏏</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Reflections Yet</h3>
                  <p className="text-gray-400 mb-6">After each match or practice, create a reflection to track your growth.</p>
                  <button onClick={() => { setEditingId(null); setView('new'); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105">
                    Create Your First Reflection
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <p className="text-xs text-gray-500">
                      {reflections.length} reflection{reflections.length === 1 ? '' : 's'} · all your history is preserved
                    </p>
                  </div>
                  <div className="space-y-3">
                    {reflections.map((r) => (
                      <div
                        key={r.id}
                        className="glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2 gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => { setSelectedReflection(r); setView('detail'); }}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <span className="text-white font-bold text-sm">{r.match}</span>
                              <span className="text-gray-500 text-xs flex-shrink-0">{r.date}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                              <span>Out: {Array.isArray(r.howGotOut) ? r.howGotOut.join(', ') || 'N/A' : r.howGotOut || 'N/A'}</span>
                              <span>Intent: {r.intentScore}/5</span>
                              <span className="text-primary-400">{r.mindsetWord || '—'}</span>
                              {r.updatedAt && r.createdAt && r.updatedAt !== r.createdAt && (
                                <span className="text-accent-400">
                                  ✏️ edited{r.editCount && r.editCount > 1 ? ` ×${r.editCount}` : ''}
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-1">
                          <button
                            type="button"
                            onClick={() => { setSelectedReflection(r); setView('detail'); }}
                            className="text-xs px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => beginEdit(r)}
                            className="text-xs px-3 py-1.5 rounded-md bg-primary-500/15 border border-primary-500/30 text-primary-300 hover:bg-primary-500/25"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteReflection(r)}
                            className="text-xs px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 ml-auto"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* Video Review */}
              <div className="mt-6 glass rounded-xl p-5 border border-accent-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎥</span>
                  <h4 className="text-white font-bold text-sm">Need a Video Review?</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Upload your batting or bowling video to YouTube (unlisted) and share the link with your captain or team group for review and feedback.
                </p>
                <p className="text-gray-500 text-xs">Talk to your captain to arrange a review session.</p>
              </div>

              <div className="mt-4 glass rounded-xl p-4 border border-primary-500/20 text-center">
                <Link href="/mental-game" className="text-primary-400 text-sm font-medium hover:text-primary-300 underline">Open The Mental Game Guide &rarr;</Link>
              </div>
            </>
          )}

          {/* DETAIL VIEW */}
          {view === 'detail' && selectedReflection && (
            <>
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">&larr; Back</button>
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <h2 className="text-lg font-bold text-white">{selectedReflection.match}</h2>
                  <button
                    onClick={() => beginEdit(selectedReflection)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-semibold hover:bg-primary-500/30 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-6">
                  <span>📅 Created {selectedReflection.date}</span>
                  {selectedReflection.updatedAt && selectedReflection.updatedAt !== selectedReflection.createdAt && (
                    <span className="text-primary-400">
                      ✏️ Last saved{' '}
                      {new Date(selectedReflection.updatedAt).toLocaleString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                      {selectedReflection.editCount && selectedReflection.editCount > 0 && (
                        <span className="text-gray-500">
                          {' · '}
                          {selectedReflection.editCount} edit{selectedReflection.editCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Feeling</p>
                    <p className="text-white font-bold text-xs">{['😫','😐','🙂','💪','🔥'][((selectedReflection.feeling || 3) - 1)]} {selectedReflection.feeling || 3}/5</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Got Out</p>
                    <p className="text-white font-bold text-xs">{Array.isArray(selectedReflection.howGotOut) ? selectedReflection.howGotOut.join(', ') || 'N/A' : selectedReflection.howGotOut || 'N/A'}</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Intent</p>
                    <p className="text-white font-bold text-xs">{selectedReflection.intentScore}/5</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Mindset</p>
                    <p className="text-primary-400 font-bold text-xs">{selectedReflection.mindsetWord || '—'}</p>
                  </div>
                </div>

                {/* Auto Coach Insight — generated from this reflection's
                    own answers (rule-based). Sharpens substantially when
                    the Coach-Level Review section is filled in. */}
                {(() => {
                  const insight = generateCoachInsight({
                    howGotOut: Array.isArray(selectedReflection.howGotOut)
                      ? selectedReflection.howGotOut
                      : selectedReflection.howGotOut ? [selectedReflection.howGotOut] : [],
                    whatWentRight: selectedReflection.whatWentRight || [],
                    whatWentWrong: selectedReflection.whatWentWrong || [],
                    feeling: selectedReflection.feeling || 3,
                    intentScore: selectedReflection.intentScore || 3,
                    controlPercent: selectedReflection.controlPercent,
                    pickedLengthEarly: selectedReflection.pickedLengthEarly,
                    watchedBall: selectedReflection.watchedBall,
                    misjudgedPaceOrBounce: selectedReflection.misjudgedPaceOrBounce,
                    headOverBall: selectedReflection.headOverBall,
                    frontFootToPitch: selectedReflection.frontFootToPitch,
                    balanceAtContact: selectedReflection.balanceAtContact,
                    matchPhase: selectedReflection.matchPhase,
                    pressureLevel: selectedReflection.pressureLevel,
                    intentMode: selectedReflection.intentMode,
                    firstSixBallsPlan: selectedReflection.firstSixBallsPlan,
                    stuckToPlan: selectedReflection.stuckToPlan,
                    whyShotThatGotMeOut: selectedReflection.whyShotThatGotMeOut,
                    runs: selectedReflection.runsScored,
                    balls: selectedReflection.ballsFaced,
                    dotBallsFaced: selectedReflection.dotBallsFaced,
                    dismissalBowlerArm: selectedReflection.dismissalBowlerArm,
                    dismissalBowlerStyle: selectedReflection.dismissalBowlerStyle,
                    stickyBowlerStyle: selectedReflection.stickyBowlerStyle,
                    nextFocusKpi: selectedReflection.nextFocusKpi,
                  });
                  return (
                    <div className="glass rounded-2xl p-5 mb-6 border-2 border-accent-500/30 bg-gradient-to-br from-accent-500/10 to-transparent">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🧠</span>
                        <h3 className="text-base font-bold text-white">Auto Coach Insight</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-accent-400 text-[10px] uppercase tracking-wider font-bold mb-1">Diagnosis</p>
                          <p className="text-sm text-white">{insight.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-accent-400 text-[10px] uppercase tracking-wider font-bold mb-1">Coach Voice</p>
                          <p className="text-sm text-gray-200 leading-relaxed">{insight.narrative}</p>
                        </div>
                        {insight.drills.length > 0 && (
                          <div>
                            <p className="text-accent-400 text-[10px] uppercase tracking-wider font-bold mb-2">🏋️ Drills for next nets</p>
                            <ul className="space-y-1.5">
                              {insight.drills.map((d, i) => (
                                <li key={i} className="text-sm text-gray-300 flex gap-2">
                                  <span className="text-accent-400 flex-shrink-0">→</span><span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="rounded-xl p-4 border border-primary-500/30 bg-primary-500/5">
                          <p className="text-primary-400 text-[10px] uppercase tracking-wider font-bold mb-2">🎯 Next innings plan</p>
                          <ul className="space-y-2 text-sm text-gray-200">
                            <li><span className="text-gray-500">First 6 balls:</span> {insight.nextInningsPlan.firstSixBalls}</li>
                            <li><span className="text-gray-500">Scoring areas:</span> {insight.nextInningsPlan.scoringAreas}</li>
                            <li><span className="text-gray-500">Risk to avoid:</span> {insight.nextInningsPlan.riskToAvoid}</li>
                            <li><span className="text-gray-500">Strength to back:</span> {insight.nextInningsPlan.strengthToBack}</li>
                          </ul>
                        </div>

                        {/* ── Bounce Back System ────────────────────────────
                            Mental-recovery routine — Breathe → Reflect → Reset.
                            Same `insight` object; this just surfaces the
                            emotional/mindset side alongside the technical side. */}
                        <div className="rounded-xl p-4 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">💪</span>
                            <p className="text-purple-300 text-[10px] uppercase tracking-wider font-bold">Bounce Back System</p>
                          </div>

                          {/* Step 1 — Breathe */}
                          <div className="mb-4">
                            <p className="text-purple-400 text-[10px] uppercase tracking-wider font-bold mb-1">1. Breathe</p>
                            <p className="text-sm text-gray-200 leading-relaxed">{insight.bounceBack.breathe}</p>
                          </div>

                          {/* Step 2 — Reflect (3 questions, auto-answered) */}
                          <div className="mb-4">
                            <p className="text-purple-400 text-[10px] uppercase tracking-wider font-bold mb-2">2. Reflect</p>
                            <div className="space-y-2">
                              {insight.bounceBack.reflectPrompts.map((p, i) => (
                                <div key={i} className="rounded-lg bg-white/3 border border-white/5 p-2.5">
                                  <p className="text-purple-300 text-[11px] font-semibold mb-0.5">{p.question}</p>
                                  <p className="text-sm text-gray-200 leading-snug">{p.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Step 3 — Reset card */}
                          <div className="mb-3">
                            <p className="text-purple-400 text-[10px] uppercase tracking-wider font-bold mb-2">3. Reset card</p>
                            <ul className="space-y-1.5 text-sm text-gray-200">
                              <li>
                                <span className="text-gray-500">Mindset word:</span>{' '}
                                <span className="font-semibold text-purple-200">{insight.bounceBack.resetCard.mindsetWord}</span>
                              </li>
                              <li><span className="text-gray-500">Strength to back:</span> {insight.bounceBack.resetCard.strengthToBack}</li>
                              <li><span className="text-gray-500">If pressure hits:</span> {insight.bounceBack.resetCard.pressureResponse}</li>
                              <li>
                                <span className="text-gray-500">Mantra:</span>{' '}
                                <span className="italic text-gray-100">&ldquo;{insight.bounceBack.resetCard.mantra}&rdquo;</span>
                              </li>
                            </ul>
                          </div>

                          {/* Mindset switch — small reframe call-out */}
                          <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-xs leading-snug">
                            <span className="text-purple-300 font-semibold">Mindset switch:</span>{' '}
                            <span className="text-gray-400 line-through">{insight.bounceBack.mindsetSwitch.from}</span>{' '}
                            <span className="text-gray-500">→</span>{' '}
                            <span className="text-gray-100">{insight.bounceBack.mindsetSwitch.to}</span>
                          </div>
                        </div>

                        {/* ── Run Maker System ──────────────────────────────
                            Offensive counterpart to Bounce Back — scoring
                            identity, pre-ball intent trigger, 3-phase plan,
                            dot-ball tactics, and scorer-driven KPIs. */}
                        <div className="rounded-xl p-4 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🚀</span>
                            <p className="text-amber-300 text-[10px] uppercase tracking-wider font-bold">Run Maker System</p>
                          </div>

                          {/* Scoring identity — 3 traits + statement */}
                          <div className="mb-4">
                            <p className="text-amber-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">Scoring identity</p>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {insight.runMaker.scoringIdentity.traits.map((t, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 font-semibold">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-200 italic leading-snug">
                              &ldquo;{insight.runMaker.scoringIdentity.scoringStatement}&rdquo;
                            </p>
                          </div>

                          {/* Intent trigger — LOOK / BREATHE / SAY */}
                          <div className="mb-4">
                            <p className="text-amber-400 text-[10px] uppercase tracking-wider font-bold mb-2">Pre-ball intent trigger</p>
                            <div className="space-y-1.5 text-sm text-gray-200">
                              <p><span className="text-amber-300 font-semibold">Look:</span> {insight.runMaker.intentTrigger.look}</p>
                              <p><span className="text-amber-300 font-semibold">Breathe:</span> {insight.runMaker.intentTrigger.breathe}</p>
                              <p><span className="text-amber-300 font-semibold">Say:</span> &ldquo;{insight.runMaker.intentTrigger.say}&rdquo;</p>
                            </div>
                          </div>

                          {/* 3-Phase plan */}
                          <div className="mb-4">
                            <p className="text-amber-400 text-[10px] uppercase tracking-wider font-bold mb-2">3-Phase innings plan</p>
                            <div className="space-y-2">
                              {insight.runMaker.phasePlan.map((p, i) => (
                                <div key={i} className="rounded-lg bg-white/3 border border-white/5 p-2.5">
                                  <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <p className="text-amber-200 text-[11px] font-bold">{p.phase} <span className="text-gray-500 font-normal">· balls {p.balls}</span></p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-semibold">{p.reminderWord}</span>
                                  </div>
                                  <p className="text-xs text-gray-300 mb-0.5"><span className="text-gray-500">Goal:</span> {p.goal}</p>
                                  <p className="text-xs text-gray-300"><span className="text-gray-500">Key shots:</span> {p.keyShots}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dot ball tactics */}
                          {insight.runMaker.dotBallTactics.length > 0 && (
                            <div className="mb-4">
                              <p className="text-amber-400 text-[10px] uppercase tracking-wider font-bold mb-2">Dot ball destroyer tactics</p>
                              <ul className="space-y-1.5">
                                {insight.runMaker.dotBallTactics.map((t, i) => (
                                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                                    <span className="text-amber-400 flex-shrink-0">→</span><span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* KPIs */}
                          {(insight.runMaker.kpis.runsPer10Balls !== null || insight.runMaker.kpis.intentScore !== null || insight.runMaker.kpis.dotBallPercent !== null || insight.runMaker.kpis.strikeRate !== null) && (
                            <div className="rounded-md bg-amber-500/10 border-l-2 border-amber-500/60 px-3 py-2 text-xs leading-snug mb-2 space-y-1">
                              <div>
                                <span className="text-amber-300 font-semibold">KPIs:</span>{' '}
                                {insight.runMaker.kpis.strikeRate !== null && (
                                  <span className="text-gray-200">
                                    Strike rate:{' '}
                                    <strong className={insight.runMaker.kpis.strikeRate >= 100 ? 'text-emerald-300' : insight.runMaker.kpis.strikeRate >= 75 ? 'text-amber-200' : 'text-red-300'}>
                                      {insight.runMaker.kpis.strikeRate}
                                    </strong>
                                  </span>
                                )}
                                {insight.runMaker.kpis.runsPer10Balls !== null && (
                                  <>
                                    {insight.runMaker.kpis.strikeRate !== null && <span className="text-gray-500"> · </span>}
                                    <span className="text-gray-200">Runs / 10 balls: <strong>{insight.runMaker.kpis.runsPer10Balls}</strong></span>
                                  </>
                                )}
                                {insight.runMaker.kpis.intentScore !== null && (
                                  <>
                                    {(insight.runMaker.kpis.strikeRate !== null || insight.runMaker.kpis.runsPer10Balls !== null) && <span className="text-gray-500"> · </span>}
                                    <span className="text-gray-200">Intent: <strong>{insight.runMaker.kpis.intentScore} / 5</strong></span>
                                  </>
                                )}
                                {insight.runMaker.kpis.dotBallPercent !== null && (
                                  <>
                                    {(insight.runMaker.kpis.strikeRate !== null || insight.runMaker.kpis.runsPer10Balls !== null || insight.runMaker.kpis.intentScore !== null) && <span className="text-gray-500"> · </span>}
                                    <span className="text-gray-200">
                                      Dot ball %:{' '}
                                      <strong className={insight.runMaker.kpis.dotBallPercent > 40 ? 'text-red-300' : 'text-emerald-300'}>
                                        {insight.runMaker.kpis.dotBallPercent}%
                                      </strong>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Focus for next session */}
                          {insight.runMaker.focusForNextSession && (
                            <div className="rounded-md bg-amber-500/15 border border-amber-500/40 px-3 py-2 text-xs leading-snug">
                              <span className="text-amber-300 font-semibold">🎯 Focus next session:</span>{' '}
                              <span className="text-gray-100">{insight.runMaker.focusForNextSession}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-gray-600 italic">
                          Auto-generated from your answers. Fill in the &quot;Coach-Level Review&quot; section when you reflect for sharper, more specific insights.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {((selectedReflection.bodyStatus && selectedReflection.bodyStatus.length > 0) || (selectedReflection.nutrition && selectedReflection.nutrition.length > 0)) && (
                  <div className="mb-4">
                    <h4 className="text-blue-400 font-bold text-xs mb-2">Match Day Check-In</h4>
                    <div className="flex flex-wrap gap-1">
                      {(selectedReflection.bodyStatus || []).map(b => (
                        <span key={b} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">{b}</span>
                      ))}
                      {(selectedReflection.nutrition || []).map(n => (
                        <span key={n} className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedReflection.whatWentRight.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-primary-400 font-bold text-xs mb-2">What Went Right</h4>
                    <div className="flex flex-wrap gap-1">{selectedReflection.whatWentRight.map(w => (
                      <span key={w} className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">{w}</span>
                    ))}</div>
                  </div>
                )}
                {selectedReflection.whatWentWrong.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-red-400 font-bold text-xs mb-2">What Went Wrong</h4>
                    <div className="flex flex-wrap gap-1">{selectedReflection.whatWentWrong.map(w => (
                      <span key={w} className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{w}</span>
                    ))}</div>
                  </div>
                )}
                {selectedReflection.nextInningsPlan && <div className="mb-3"><h4 className="text-accent-400 font-bold text-xs mb-1">Next Innings Plan</h4><p className="text-gray-300 text-sm">{selectedReflection.nextInningsPlan}</p></div>}
                {selectedReflection.strengthToBuild && <div className="mb-3"><h4 className="text-blue-400 font-bold text-xs mb-1">Strength to Back</h4><p className="text-gray-300 text-sm">{selectedReflection.strengthToBuild}</p></div>}
                {selectedReflection.pressureResponse && <div className="mb-3"><h4 className="text-purple-400 font-bold text-xs mb-1">If I Feel Pressure</h4><p className="text-gray-300 text-sm">{selectedReflection.pressureResponse}</p></div>}
                {selectedReflection.notes && <div className="mb-3"><h4 className="text-gray-400 font-bold text-xs mb-1">Notes</h4><p className="text-gray-300 text-sm">{selectedReflection.notes}</p></div>}
              </div>

              {/* Coaching Insight */}
              <div className="mt-4 glass rounded-2xl p-6 border border-primary-500/20">
                <h4 className="text-primary-400 font-bold text-sm mb-3">Coaching Insight</h4>
                <div className="space-y-4">
                  {getCoachingTip(selectedReflection).split('\n\n').map((block, i) => {
                    const boldMatch = block.match(/^\*\*(.+?):\*\*\s*(.+)$/);
                    if (boldMatch) {
                      return (
                        <div key={i}>
                          <p className="text-white font-bold text-sm mb-1">{boldMatch[1]}</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{boldMatch[2]}</p>
                        </div>
                      );
                    }
                    return <p key={i} className="text-gray-300 text-sm leading-relaxed">{block}</p>;
                  })}
                </div>
              </div>

              {/* Delete */}
              <div className="mt-4 text-center">
                <button
                  onClick={async () => {
                    if (confirm('Delete this reflection?')) {
                      await deleteDoc(doc(db, 'reflections', selectedReflection.id));
                      try { await loadReflections(); } catch { /* index building */ }
                      setView('list');
                    }
                  }}
                  className="text-red-400 text-xs hover:text-red-300 underline"
                >
                  Delete this reflection
                </button>
              </div>
            </>
          )}

          {/* MATCH PLAN VIEW */}
          {view === 'match-plan' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Match <span className="gradient-text">Plan</span></h2>
                <p className="text-gray-500 text-sm">Captain + VC pre-match planner. Pick squad, assign roles, lock the strategy, share with the team.</p>
              </div>

              {/* Role Reference — T30-tuned definitions of every batting
                  and bowling role available in the planner. Collapsible
                  so it doesn't dominate the form; captains can open it
                  before assigning roles to refresh on what each one does. */}
              <details className="glass rounded-2xl border border-white/10 group">
                <summary className="cursor-pointer p-5 flex items-center justify-between text-left list-none">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-xl">📖</span> Role definitions (T30 — 30 overs)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">What each batting + bowling role actually does. Click to expand.</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">🏏 Batting roles</p>
                    <div className="space-y-2">
                      {(['opener', 'top-order', 'anchor', 'pinch-hitter', 'finisher', 'lower-order'] as const).map((r) => {
                        const b = BATTING_ROLE_BRIEF[r];
                        return (
                          <div key={r} className="rounded-lg bg-white/3 border border-white/5 p-3 text-xs">
                            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                              <span className="text-emerald-200 font-bold">{r}</span>
                              <span className="text-gray-500">{b.position} · {b.battingPhase} · target {b.target} · SR {b.strikeRate}</span>
                            </div>
                            <p className="text-gray-300 leading-snug">{b.responsibility}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">🎯 Bowling roles (max 6 overs per bowler in T30)</p>
                    <div className="space-y-2">
                      {(['opening', 'first-change', 'spinner-off', 'spinner-leg', 'spinner-orthodox', 'spinner-wrist', 'death', 'part-time'] as const).map((r) => {
                        const b = BOWLING_ROLE_BRIEF[r];
                        return (
                          <div key={r} className="rounded-lg bg-white/3 border border-white/5 p-3 text-xs">
                            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                              <span className="text-blue-200 font-bold">{r}</span>
                              <span className="text-gray-500">{b.whenBowling} · {b.oversInGame} overs</span>
                            </div>
                            <p className="text-gray-300 leading-snug">{b.responsibility}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">👤 Player temperament (independent of role)</p>
                    <p className="text-[11px] text-gray-500 mb-2">Two openers can have the same role tag but be very different players. Temperament distinguishes the player type — pair complementary temperaments (one aggressor + one anchor) for a strong opening combination.</p>
                    <div className="space-y-2">
                      {(['anchor', 'aggressor', 'balanced', 'specialist'] as const).map((t) => (
                        <div key={t} className="rounded-lg bg-white/3 border border-white/5 p-3 text-xs">
                          <p className="text-purple-200 font-bold mb-1">{t}</p>
                          <p className="text-gray-300 leading-snug">{TEMPERAMENT_BRIEF[t]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-100">
                    <strong className="text-amber-300">T30 phases:</strong> Phase 1 (overs 1-10, powerplay + early consolidation) · Phase 2 (overs 11-22, middle / build) · Phase 3 (overs 23-30, death / acceleration). The role assignments here should map players to the phase where they bat or bowl best.
                  </div>
                </div>
              </details>

              {/* Match selection */}
              <div className="glass rounded-2xl p-5 border border-white/10">
                <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-2">1. Select match</label>
                <select
                  value={mpMatchId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setMpMatchId(id);
                    const m = MATCHES.find((mm) => mm.label === id);
                    if (m) {
                      setMpMatchLabel(m.label);
                      const league = detectLeagueFromLabel(m.label);
                      setMpLeague(league);
                      // Extract opponent from labels of the form
                      // "LPL M3 — vs NLCC (May 31)"
                      const opp = m.label.match(/—\s*vs\s+(.+?)\s*\(/i)?.[1] ?? '';
                      setMpOpponent(opp);
                      setMpVenue(''); // Venue not in MATCHES; user can fill in
                      // Pre-fill captain + VC for the league. If the
                      // user has already typed something, don't
                      // overwrite. They can always edit either field.
                      const leadership = getLeadership(league);
                      if (leadership.captainName && !mpCaptainName) setMpCaptainName(leadership.captainName);
                      if (leadership.vcName && !mpVcName) setMpVcName(leadership.vcName);
                    }
                    loadMatchPlan(id);
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white text-sm"
                >
                  <option value="" className="bg-gray-900">— Choose a match —</option>
                  {MATCHES.map((m) => (
                    <option key={m.label} value={m.label} className="bg-gray-900">{m.label}</option>
                  ))}
                </select>
                {mpMatchId && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">League:</span> <span className="text-white">{mpLeague}</span></div>
                    {mpOpponent && <div><span className="text-gray-500">Opponent:</span> <span className="text-white">{mpOpponent}</span></div>}
                    {mpVenue && <div><span className="text-gray-500">Venue:</span> <span className="text-white">{mpVenue}</span></div>}
                  </div>
                )}
              </div>

              {mpMatchId && (
                <>
                  {/* Captain + VC */}
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-2">2. Captain &amp; Vice-Captain</label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Captain</label>
                        <input
                          type="text"
                          value={mpCaptainName}
                          onChange={(e) => setMpCaptainName(e.target.value)}
                          placeholder="e.g. Tarek Islam"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Vice-captain</label>
                        <input
                          type="text"
                          value={mpVcName}
                          onChange={(e) => setMpVcName(e.target.value)}
                          placeholder="e.g. Mohammed Saad"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Squad selection */}
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-2">3. Squad (pick up to 12 — 11 + twelfth man)</label>
                    <p className="text-xs text-gray-500 mb-3">Current selection: {mpSquad.length} / 12</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Array.from(new Set(Object.values(EMAIL_TO_PLAYER))).sort().map((name) => {
                        const email = Object.entries(EMAIL_TO_PLAYER).find(([_e, n]) => n === name)?.[0] || '';
                        const selected = mpSquad.some((p) => p.email === email);
                        return (
                          <button
                            key={email}
                            type="button"
                            onClick={() => toggleSquadPlayer(email, name)}
                            disabled={!selected && mpSquad.length >= 12}
                            className={`text-xs px-3 py-2 rounded-lg border text-left transition-all ${
                              selected
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
                            }`}
                          >
                            {selected ? '✓ ' : ''}{name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-player role assignment */}
                  {mpSquad.length > 0 && (
                    <div className="glass rounded-2xl p-5 border border-white/10">
                      <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-3">4. Player roles</label>
                      <p className="text-xs text-gray-500 mb-3">For each selected player, set batting order (1-11, or 12 for twelfth man) and role tags. Every player should know their role before the match.</p>
                      <div className="space-y-3">
                        {mpSquad.map((p) => (
                          <div key={p.email} className="rounded-lg bg-white/3 border border-white/10 p-3">
                            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                              <div className="font-semibold text-white">{p.playerName}</div>
                              <label className="text-xs text-gray-400 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={!!p.isWicketkeeper}
                                  onChange={(e) => updateSquadAssignment(p.email, { isWicketkeeper: e.target.checked })}
                                  className="accent-emerald-500"
                                />
                                Wicketkeeper
                              </label>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                              <div>
                                <label className="text-gray-500 block mb-0.5">Order</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={p.battingOrder ?? ''}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    updateSquadAssignment(p.email, { battingOrder: v === '' ? undefined : Math.max(1, Math.min(12, parseInt(v, 10) || 0)) });
                                  }}
                                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white"
                                />
                              </div>
                              <div>
                                <label className="text-gray-500 block mb-0.5">Temperament</label>
                                <select
                                  value={p.temperament || ''}
                                  onChange={(e) => updateSquadAssignment(p.email, { temperament: (e.target.value || undefined) as Temperament })}
                                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white"
                                  title={p.temperament ? TEMPERAMENT_BRIEF[p.temperament] : 'Player type — independent of position'}
                                >
                                  <option value="" className="bg-gray-900">—</option>
                                  {TEMPERAMENTS.map((t) => (
                                    <option key={t} value={t} className="bg-gray-900">{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-gray-500 block mb-0.5">Batting role</label>
                                <select
                                  value={p.battingRole || ''}
                                  onChange={(e) => updateSquadAssignment(p.email, { battingRole: (e.target.value || undefined) as PlayerAssignment['battingRole'] })}
                                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white"
                                >
                                  <option value="" className="bg-gray-900">—</option>
                                  {BATTING_ROLES.map((r) => (
                                    <option key={r} value={r} className="bg-gray-900">{r}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-gray-500 block mb-0.5">Bowling role</label>
                                <select
                                  value={p.bowlingRole || ''}
                                  onChange={(e) => updateSquadAssignment(p.email, { bowlingRole: (e.target.value || undefined) as PlayerAssignment['bowlingRole'] })}
                                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white"
                                >
                                  <option value="" className="bg-gray-900">—</option>
                                  {BOWLING_ROLES.map((r) => (
                                    <option key={r} value={r} className="bg-gray-900">{r}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-gray-500 block mb-0.5">Fielding</label>
                                <select
                                  value={p.fieldingPosition || ''}
                                  onChange={(e) => updateSquadAssignment(p.email, { fieldingPosition: e.target.value || undefined })}
                                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white"
                                >
                                  <option value="" className="bg-gray-900">—</option>
                                  {FIELDING_POSITIONS.map((f) => (
                                    <option key={f} value={f} className="bg-gray-900">{f}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {p.temperament && (
                              <p className="mt-1.5 text-[10px] text-gray-500 italic">{TEMPERAMENT_BRIEF[p.temperament]}</p>
                            )}
                            <input
                              type="text"
                              value={p.notes || ''}
                              onChange={(e) => updateSquadAssignment(p.email, { notes: e.target.value || undefined })}
                              placeholder="Specific instruction for this player (optional)"
                              className="mt-2 w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs"
                            />
                            {/* Inline role briefs — show the T30-tuned
                                responsibility for whichever batting +
                                bowling role this player is assigned, so
                                the captain and the player both see what
                                the role actually means at the crease /
                                with the ball. */}
                            {(p.battingRole || p.bowlingRole) && (
                              <div className="mt-2 space-y-1.5">
                                {p.battingRole && BATTING_ROLE_BRIEF[p.battingRole] && (
                                  <div className="rounded bg-emerald-500/10 border-l-2 border-emerald-500/60 px-2.5 py-1.5 text-[11px] text-gray-200 leading-snug">
                                    <span className="text-emerald-300 font-semibold">{p.battingRole}</span>
                                    <span className="text-gray-500"> · {BATTING_ROLE_BRIEF[p.battingRole].position} · {BATTING_ROLE_BRIEF[p.battingRole].battingPhase} · target {BATTING_ROLE_BRIEF[p.battingRole].target} · SR {BATTING_ROLE_BRIEF[p.battingRole].strikeRate}</span>
                                    <div className="mt-0.5 text-gray-300">{BATTING_ROLE_BRIEF[p.battingRole].responsibility}</div>
                                  </div>
                                )}
                                {p.bowlingRole && p.bowlingRole !== 'none' && BOWLING_ROLE_BRIEF[p.bowlingRole] && (
                                  <div className="rounded bg-blue-500/10 border-l-2 border-blue-500/60 px-2.5 py-1.5 text-[11px] text-gray-200 leading-snug">
                                    <span className="text-blue-300 font-semibold">{p.bowlingRole}</span>
                                    <span className="text-gray-500"> · {BOWLING_ROLE_BRIEF[p.bowlingRole].whenBowling} · {BOWLING_ROLE_BRIEF[p.bowlingRole].oversInGame} overs</span>
                                    <div className="mt-0.5 text-gray-300">{BOWLING_ROLE_BRIEF[p.bowlingRole].responsibility}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Batting plan — both scenarios */}
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-3">5. Batting plan — both scenarios</label>
                    <p className="text-[11px] text-gray-500 -mt-2 mb-4">Fill in both. After the toss, the captain knows which one applies.</p>

                    {/* Batting first */}
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/30 p-3 mb-3">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider">🏏 If we bat first — setting a target</p>
                        <button
                          type="button"
                          onClick={() => {
                            // Confirm before overwriting, so a captain
                            // who has already filled in their own plan
                            // doesn't lose it accidentally.
                            const hasContent =
                              (mpTeamTarget !== undefined && mpTeamTarget !== 150) ||
                              mpStartSmart.trim().length > 0 ||
                              mpBuildFast.trim().length > 0 ||
                              mpFinishStrong.trim().length > 0;
                            const confirmed = !hasContent ||
                              (typeof window !== 'undefined'
                                && window.confirm('Apply the T30 batting-first template? This will overwrite the current target and phase tactics. You can still edit any field after.'));
                            if (!confirmed) return;
                            setMpTeamTarget(T30_BATTING_FIRST_TEMPLATE.teamTarget);
                            setMpStartSmart(T30_BATTING_FIRST_TEMPLATE.startSmartTactic);
                            setMpBuildFast(T30_BATTING_FIRST_TEMPLATE.buildFastTactic);
                            setMpFinishStrong(T30_BATTING_FIRST_TEMPLATE.finishStrongTactic);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 font-semibold"
                          title="Pre-fill target + 3-phase tactics with the standard T30 batting-first playbook"
                        >
                          ⚡ Apply T30 template
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Team target (runs)</label>
                          <input
                            type="number"
                            min={0}
                            value={mpTeamTarget ?? ''}
                            onChange={(e) => setMpTeamTarget(e.target.value === '' ? undefined : Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Aim: 150+ playing all 30 overs.</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Start Smart (overs 1-10)</label>
                          <input type="text" value={mpStartSmart} onChange={(e) => setMpStartSmart(e.target.value)} placeholder="e.g. Rotate strike, leave outside off, defend straight balls, build platform" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Build Fast (overs 11-22)</label>
                          <input type="text" value={mpBuildFast} onChange={(e) => setMpBuildFast(e.target.value)} placeholder="e.g. Rotate every ball, target boundaries against spin in scoring zones" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Finish Strong (overs 23-30)</label>
                          <input type="text" value={mpFinishStrong} onChange={(e) => setMpFinishStrong(e.target.value)} placeholder="e.g. Pre-pick boundary zones; clear front leg, hit straight; minimum 8 RPO" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Chasing */}
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/30 p-3">
                      <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">🎯 If we bat second — chasing a target</p>
                      <p className="text-[11px] text-gray-500 mb-2">Required run-rate (RR) = runs needed ÷ overs remaining. Pace the chase by RR, not by emotion.</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Standard chase — required RR ≤ 5.5 / over</label>
                          <input type="text" value={mpChaseStandard} onChange={(e) => setMpChaseStandard(e.target.value)} placeholder="e.g. Run-a-ball start, build partnership to over 15, lose ≤4 wickets by halfway, accelerate from over 22" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Aggressive chase — required RR &gt; 5.5 / over</label>
                          <input type="text" value={mpChaseAggressive} onChange={(e) => setMpChaseAggressive(e.target.value)} placeholder="e.g. Pinch hit early to get ahead of RR; platform by over 12; boundary every over from 18; accept risk" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bowling plan — both scenarios */}
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-3">6. Bowling &amp; fielding plan — both scenarios</label>
                    <p className="text-[11px] text-gray-500 -mt-2 mb-4">Fill in both bowling scenarios. After we set or chase a target, the captain knows which one applies. Plus pre-match opposition intel + per-phase fielding setup.</p>

                    {/* Opposition intel */}
                    <div className="rounded-lg bg-purple-500/5 border border-purple-500/30 p-3 mb-3">
                      <label className="text-purple-300 text-xs font-bold uppercase tracking-wider block mb-2">🔍 Opposition intel — pre-match notes</label>
                      <textarea
                        value={mpOppositionNotes}
                        onChange={(e) => setMpOppositionNotes(e.target.value)}
                        rows={3}
                        placeholder="e.g. Their LH opener Mukesh: off-spin first up, leg-spin out. #4 Ravi: pace troubles, bring death pacer early. #6 their finisher prefers slog-sweep — slip + fielder at deep mid-wicket."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Specific matchup notes per opposing batter (or general lineup observations). Read this in the pre-match huddle so bowlers know what to bowl.</p>
                    </div>

                    {/* Bowling first */}
                    <div className="rounded-lg bg-blue-500/5 border border-blue-500/30 p-3 mb-3">
                      <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">🛡️ If we bowl first — restricting (no target to defend)</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Powerplay (overs 1-6)</label>
                          <input type="text" value={mpPowerplayPlan} onChange={(e) => setMpPowerplayPlan(e.target.value)} placeholder="e.g. Open with pace pair, attack stumps, keep fielders up; target wickets" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Middle overs (7-22)</label>
                          <input type="text" value={mpMiddleOversPlan} onChange={(e) => setMpMiddleOversPlan(e.target.value)} placeholder="e.g. Spinners from both ends; build dot pressure; target ≤4.5 RPO" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Death overs (23-30)</label>
                          <input type="text" value={mpDeathOversPlan} onChange={(e) => setMpDeathOversPlan(e.target.value)} placeholder="e.g. Yorkers + slower balls; protect long boundary; restrict to under 8 RPO" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Fielding strategy per phase */}
                    <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/30 p-3 mb-3">
                      <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">🥎 Fielding setup per phase</p>
                      <p className="text-[10px] text-gray-500 mb-2">Where the fielders go — separate from who&apos;s bowling. Per Rajath: middle overs need good catchers outside.</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Powerplay (overs 1-6)</label>
                          <input type="text" value={mpFieldingPowerplay} onChange={(e) => setMpFieldingPowerplay(e.target.value)} placeholder="e.g. 2 slips, point, gully, cover, mid-off / mid-on, square leg, fine leg, third man up" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Middle overs (7-22)</label>
                          <input type="text" value={mpFieldingMiddleOvers} onChange={(e) => setMpFieldingMiddleOvers(e.target.value)} placeholder="e.g. Deep mid-wicket, deep cover, long-on / long-off; best catchers in the deep; ring up to save singles" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Death overs (23-30)</label>
                          <input type="text" value={mpFieldingDeathOvers} onChange={(e) => setMpFieldingDeathOvers(e.target.value)} placeholder="e.g. 5 on the boundary; long-on / long-off / deep mid-wicket / deep cover / third man; ring of 4 to save singles" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Defending */}
                    <div className="rounded-lg bg-red-500/5 border border-red-500/30 p-3">
                      <p className="text-red-300 text-xs font-bold uppercase tracking-wider mb-2">🔒 If we bowl second — defending our total</p>
                      <p className="text-[11px] text-gray-500 mb-2">The total we set shapes the field, the line, and the risk we accept.</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Defending under par (under ~130 in T30)</label>
                          <input type="text" value={mpDefendBelowPar} onChange={(e) => setMpDefendBelowPar(e.target.value)} placeholder="e.g. Attack from ball one; open with best bowlers; attacking field every over; force errors" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Defending par or above (~130+)</label>
                          <input type="text" value={mpDefendParOrAbove} onChange={(e) => setMpDefendParOrAbove(e.target.value)} placeholder="e.g. Bowl tight lines first; restrict scoring in middle; build pressure; protect boundary in death" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mindset */}
                  <div className="rounded-2xl p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <label className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-2">7. Team mindset &amp; process</label>
                    <div className="mb-3">
                      <label className="text-gray-400 text-xs block mb-1">Team mindset word for this match</label>
                      <div className="flex flex-wrap gap-1.5">
                        {MINDSET_WORDS.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setMpMindsetWord(mpMindsetWord === w ? '' : w)}
                            className={`text-xs px-2.5 py-1 rounded-full border ${
                              mpMindsetWord === w ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500/60 font-semibold' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-gray-400 text-xs block mb-1">Three process focuses (what we do, not what we score)</label>
                      <div className="space-y-1.5">
                        {[0, 1, 2].map((i) => (
                          <input
                            key={i}
                            type="text"
                            value={mpProcessFocuses[i]}
                            onChange={(e) => {
                              const next = [...mpProcessFocuses];
                              next[i] = e.target.value;
                              setMpProcessFocuses(next);
                            }}
                            placeholder={i === 0 ? 'e.g. Watch the ball every delivery' : i === 1 ? 'e.g. Rotate strike, don\'t let dots compound' : 'e.g. Back the plan, trust the process'}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Captain&apos;s pre-match huddle line (optional)</label>
                      <input type="text" value={mpHuddleLine} onChange={(e) => setMpHuddleLine(e.target.value)} placeholder="e.g. We've prepared for this. Play with intent and trust the plan." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
                    </div>
                  </div>

                  {/* Validation + Save */}
                  {(() => {
                    const tempPlan: MatchPlan = {
                      matchId: mpMatchId,
                      matchLabel: mpMatchLabel,
                      league: mpLeague,
                      captainName: mpCaptainName,
                      vcName: mpVcName,
                      squad: mpSquad,
                      mindsetWord: mpMindsetWord,
                      status: mpStatus,
                      createdBy: session?.user?.email || '',
                      createdAt: '',
                      updatedAt: '',
                    };
                    const issues = validatePlan(tempPlan);
                    const huddle = buildHuddleScript(tempPlan);
                    return (
                      <>
                        {issues.length > 0 && (
                          <div className="rounded-2xl p-5 border-2 border-amber-500/30 bg-amber-500/5">
                            <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⚠️ Plan checklist — still missing</p>
                            <ul className="text-sm text-amber-100 space-y-0.5">
                              {issues.map((i, k) => <li key={k}>· {i}</li>)}
                            </ul>
                          </div>
                        )}
                        {issues.length === 0 && (
                          <div className="rounded-2xl p-5 border-2 border-emerald-500/40 bg-emerald-500/10">
                            <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">✓ Plan complete — pre-match huddle script</p>
                            <ul className="text-sm text-gray-200 space-y-1.5">
                              {huddle.map((line, k) => (
                                <li key={k} className="flex gap-2"><span className="text-emerald-400">→</span><span>{line}</span></li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="text-xs text-gray-500">
                      {mpLoading && 'Loading…'}
                      {!mpLoading && mpSaveStatus === 'saved' && <span className="text-emerald-400">✓ Saved</span>}
                      {!mpLoading && mpSaveStatus === 'error' && <span className="text-red-400">Save failed — try again</span>}
                      {!mpLoading && mpSaveStatus === 'idle' && mpStatus !== 'draft' && <span>Status: {mpStatus}</span>}
                    </div>
                    <button
                      onClick={saveMatchPlan}
                      disabled={mpSaving || !mpMatchId}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] disabled:opacity-40"
                    >
                      {mpSaving ? 'Saving…' : 'Save Match Plan'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TEAM ROLES VIEW — team-facing role brief.
              Captain-facing detail lives in Match Plan; this view is the
              player-facing version: short, clear, "what's expected of YOU"
              for each batting position. Visible to all signed-in players. */}
          {view === 'team-roles' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Team <span className="gradient-text">Roles</span></h2>
                <p className="text-gray-500 text-sm">What every batter is expected to do in our T30 setup. Read this before every match. If your role isn&apos;t clear, ask the captain before the toss — don&apos;t wait until you&apos;re walking out to bat.</p>
              </div>

              {/* Format overview */}
              <div className="rounded-2xl p-5 border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-transparent">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-xl">🎯</span> The match in three phases
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-rose-300 text-[10px] uppercase tracking-wider font-bold mb-1">Phase 1</p>
                    <p className="text-white font-semibold">Overs 1-10</p>
                    <p className="text-gray-400 text-xs mt-1">Powerplay + build</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-rose-300 text-[10px] uppercase tracking-wider font-bold mb-1">Phase 2</p>
                    <p className="text-white font-semibold">Overs 11-22</p>
                    <p className="text-gray-400 text-xs mt-1">Middle / acceleration</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-rose-300 text-[10px] uppercase tracking-wider font-bold mb-1">Phase 3</p>
                    <p className="text-white font-semibold">Overs 23-30</p>
                    <p className="text-gray-400 text-xs mt-1">Death / finish</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3"><strong className="text-rose-300">Aggregate team goal:</strong> 150+ batting first, defended by tight bowling and sharp fielding.</p>
              </div>

              {/* OPENERS */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏏</span> Openers <span className="text-gray-500 text-sm">— positions 1 &amp; 2</span>
                  </h3>
                  <span className="text-xs text-emerald-300/80">Overs 1-12</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You face the new ball. Your job is to survive the first 6 overs and set the platform.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
                    <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">The aggressor</p>
                    <p className="text-gray-200">Attack the powerplay. SR 110-120. Hit over the infield while the field is up. Fund the anchor with 20-30 quick runs.</p>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/10 p-3 text-sm">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">The anchor</p>
                    <p className="text-gray-200">Rotate strike, take fewer risks, SR 80-100. Bat to over 12-15. Hold one end while the other attacks.</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">At least one opener must bat to over 12-15.</strong> That&apos;s the contract.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t chase wide ones in the first 3 overs. Don&apos;t get out trying to be a hero before you&apos;re set.</span></li>
                </ul>
              </div>

              {/* TOP ORDER */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏏</span> Top Order <span className="text-gray-500 text-sm">— positions 3 &amp; 4</span>
                  </h3>
                  <span className="text-xs text-blue-300/80">Overs 5-22</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You come in either to stabilise (a wicket fell early) or to accelerate (openers gave us a strong start). <strong className="text-white">This is the most important position.</strong> If a top-order batter is set at over 20, the team usually wins.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span>Build a <strong className="text-white">big innings</strong> — 40-70 runs at SR 90-110.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span>Convert starts into substantial scores. A 25 off 20 is not enough — convert to 50+.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span>Bat deep. <strong className="text-white">Finishers walk in at over 22</strong> — you have to be there to set them up.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t throw your wicket away when you&apos;re set. Don&apos;t pre-meditate — play the ball.</span></li>
                </ul>
              </div>

              {/* MIDDLE ORDER */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏏</span> Middle Order <span className="text-gray-500 text-sm">— positions 5 &amp; 6</span>
                  </h3>
                  <span className="text-xs text-purple-300/80">Overs 15-25</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">Engine room. You navigate the middle overs and bridge to the death overs.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Rotate strike <strong className="text-white">every ball</strong> — find boundaries in YOUR scoring zones.</span></li>
                  <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Build toward the death overs. SR 110-130.</span></li>
                  <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>If you&apos;re a <strong className="text-white">pinch hitter</strong> (situational), deploy ONLY when ALL three hold: (1) wickets in hand 5+, (2) RR is below required, (3) a containing spinner is on. Then SR 140+, take them down.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t drift in &ldquo;wait and watch&rdquo; mode. Active scoring at all times.</span></li>
                </ul>
              </div>

              {/* FINISHERS / LOWER ORDER */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🏏</span> Finishers &amp; Lower Order <span className="text-gray-500 text-sm">— positions 7-11</span>
                  </h3>
                  <span className="text-xs text-amber-300/80">Overs 22-30</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">Death-overs specialists. You walk in for the last 5-8 overs.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Maximise the run rate</strong> from ball one. SR 140+.</span></li>
                  <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span>Pre-pick your boundary zone <em>before</em> the bowler runs in. Clear boundaries on demand.</span></li>
                  <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Runs over wickets</strong> — all-out in the last 8 overs is acceptable.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t waste balls. From ball one, you&apos;re attacking.</span></li>
                </ul>
              </div>

              {/* ───────── BOWLING ROLES ───────── */}

              {/* Bowling rules card */}
              <div className="rounded-2xl p-5 border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-xl">🎯</span> Bowling — the T30 rules that shape the lineup
                </h3>
                <ul className="text-sm text-gray-200 space-y-1.5">
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Minimum 5 bowlers needed.</strong> 5 bowlers × 6 overs = 30 overs. Realistically we field 6-7 bowlers so we have options if one is having a tough day.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Powerplay (overs 1-6):</strong> only 2 fielders allowed outside the 30-yard ring. Bowlers attack with the new ball; field is up.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Middle + death (overs 7-30):</strong> standard field restrictions per league rule book — typically 5 fielders outside the ring in middle, max boundary protection in death.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Pre-game know your share:</strong> the captain tells you before the match how many overs you&apos;re likely to bowl and at which phase. If unclear, ask.</span></li>
                </ul>
              </div>

              {/* OPENING BOWLERS */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Opening Bowlers
                  </h3>
                  <span className="text-xs text-blue-300/80">Powerplay (overs 1-6) · 4-6 overs total in 1-2 spells</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You bowl with the new ball when the field is up. Your job: take wickets and restrict scoring while the fielders are still in close.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Max 3 bowlers share the powerplay.</strong> Beyond that is too much experimentation — by the time the 4th bowler comes on, none of the first 3 has settled into a rhythm. Captain commits to 2 or 3 bowlers for these 6 overs.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Attack the stumps</strong> — top of off + middle. New ball + field up = best wicket conditions in the match.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Target ≤6 RPO</strong> in the powerplay. Anything under 4 RPO is great; anything over 8 means the field needs rethinking.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">If conditions help</strong> — swing, seam, bounce — use them. If conditions are flat, build pressure with line + length, not heroics.</span></li>
                  <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">→</span><span><strong className="text-white">Captain may hold back 1-2 overs</strong> for the death overs. Pace yourself across the spells.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t bowl too short in the powerplay — the field is up and short balls fly to the boundary. Don&apos;t no-ball or wide — every extra run is amplified by field restrictions.</span></li>
                </ul>
              </div>

              {/* FIRST-CHANGE / MIDDLE PACE */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> First-Change / Middle-Overs Pace
                  </h3>
                  <span className="text-xs text-cyan-300/80">Overs 7-12 · 3-5 overs</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You come on after the powerplay to maintain pressure and bridge to the spinners. Medium-pace or seam-friendly bowler.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Restrict, don&apos;t leak.</strong> Target ≤5 RPO. Build pressure that lets the spinners attack in overs 8-22.</span></li>
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Back-of-a-length on top of off.</strong> Limit width; make the batter come to you.</span></li>
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Take wickets if they offer</strong> — but containment is the primary job.</span></li>
                </ul>
              </div>

              {/* SPINNERS */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Spinners
                  </h3>
                  <span className="text-xs text-purple-300/80">Middle (overs 8-22) · 4-8 overs each</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You own the middle overs. Most opposing batters in our leagues struggle against quality spin — your job is to build dot-ball pressure, take wickets, and choke the run rate.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-purple-300 text-xs font-bold mb-1">Off-spin (right-arm finger)</p>
                    <p className="text-gray-200">Ball turns INTO a right-hander. Build dot pressure. Strongest vs left-handers when the ball turns away from them.</p>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-purple-300 text-xs font-bold mb-1">Leg-spin (right-arm wrist)</p>
                    <p className="text-gray-200">Ball turns AWAY from a right-hander. Wicket-taking option with an attacking field. Variable bounce + drift are bonuses.</p>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-purple-300 text-xs font-bold mb-1">Left-arm orthodox (SLA)</p>
                    <p className="text-gray-200">Ball turns INTO a right-hander (same direction as off-spin, opposite arm). Consistent. Restricts + takes wickets.</p>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-purple-300 text-xs font-bold mb-1">Left-arm wrist-spin (chinaman)</p>
                    <p className="text-gray-200">Ball turns AWAY from a right-hander (same direction as leg-spin, opposite arm). Specialist wicket-taker.</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Target ≤4.5 RPO</strong> in the middle overs.</span></li>
                  <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Bowl in pairs.</strong> Two spinners from both ends creates pressure that builds across overs — a wicket usually comes within 3-4 overs of the squeeze starting.</span></li>
                  <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Field your own bowling.</strong> Get deep catchers in your scoring zones; bring the ring in to save singles.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t bowl too short or too full when wickets aren&apos;t falling. Discipline beats variation.</span></li>
                </ul>
              </div>

              {/* DEATH BOWLERS */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Death Bowlers
                  </h3>
                  <span className="text-xs text-red-300/80">Overs 23-30 · 4-6 overs</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You bowl the last 8 overs. The match is often decided here — opposing finishers are trying to clear boundaries every ball, and you have to defend.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">→</span><span><strong className="text-white">Yorkers, wide yorkers, slower balls.</strong> Three weapons. Mix them. Don&apos;t become predictable.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">→</span><span><strong className="text-white">Target single-digit RPO per over.</strong> 6-7 runs is great. 8 is acceptable. 10+ means the over got away from you — reset for the next.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">→</span><span><strong className="text-white">Protect the long boundary.</strong> Bowl to the field — if long-on is set, don&apos;t bowl the ball that goes there.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">→</span><span><strong className="text-white">Stay calm after a boundary.</strong> One bad ball doesn&apos;t become two. Pre-ball routine before every delivery.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t bowl half-volleys — death-overs gold for the batter. Don&apos;t no-ball — free hits cost 6.</span></li>
                </ul>
              </div>

              {/* PART-TIME BOWLERS */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Part-Time Bowlers
                  </h3>
                  <span className="text-xs text-amber-300/80">Middle (overs 10-20) · 1-3 overs</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You bowl 1-3 overs when the captain needs to rest a main bowler or change the angle. Usually a batting all-rounder. Don&apos;t treat this as small — your one over could be the one that breaks a partnership.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Bowl your strongest delivery on repeat.</strong> Don&apos;t experiment — captain put you on for control.</span></li>
                  <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Surprise factor is your advantage.</strong> Batter doesn&apos;t have a plan for you. Use it.</span></li>
                  <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Target ≤6 RPO.</strong> Goal is containment, not heroics.</span></li>
                </ul>
              </div>

              {/* WICKETKEEPER */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🧤</span> Wicketkeeper
                  </h3>
                  <span className="text-xs text-emerald-300/80">Every ball, all 30 overs</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">You see every delivery. You&apos;re the only fielder who watches the bowler from the bowler&apos;s end of the pitch — captains lean on you for tactical reads.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Clean takes &gt; flashy takes.</strong> Stay low, watch the ball into the gloves.</span></li>
                  <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Communicate constantly.</strong> Talk to the bowler between balls: what the batter&apos;s doing, what&apos;s working, field adjustments.</span></li>
                  <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Stumping awareness</strong> against spin — if the batter overbalances even slightly, your gloves are off the bails fast.</span></li>
                  <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Energy on the field</strong> — wicketkeeper sets the team&apos;s vibe. Loud, positive, picking guys up.</span></li>
                </ul>
              </div>

              {/* FIELDING */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🥎</span> Fielders
                  </h3>
                  <span className="text-xs text-cyan-300/80">Every ball you&apos;re not bowling</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">10 of 11 fielders aren&apos;t bowling on any given ball. Fielding is what most matches are won or lost on — not bowling, not batting. Take it seriously.</p>
                <ul className="text-sm text-gray-300 space-y-1.5">
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Know your position</strong> before every ball. Captain sets the field — if you&apos;re unsure where to stand, ask.</span></li>
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Best catchers in the deep during middle overs.</strong> If you&apos;re a strong catcher, captain will put you at deep mid-wicket / deep cover / long-on.</span></li>
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Ring fielders save singles.</strong> Anticipate the shot, move on the bowler&apos;s release, take it cleanly. A single saved is a single not added to their total.</span></li>
                  <li className="flex gap-2"><span className="text-cyan-400 flex-shrink-0">→</span><span><strong className="text-white">Throw to the keeper&apos;s gloves</strong> — bounce one if you have to, never over the head. The keeper takes it; the bowler doesn&apos;t.</span></li>
                  <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span>Don&apos;t walk between balls. Don&apos;t take your eye off the batter. Don&apos;t stand up with the field set and then drift back when a fast bowler comes on.</span></li>
                </ul>
              </div>

              {/* EVERYONE */}
              <div className="rounded-2xl p-6 border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 to-transparent">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">⭐</span> Everyone — non-negotiables
                </h3>
                <ul className="text-sm text-gray-200 space-y-1.5">
                  <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">→</span><span><strong className="text-white">Watch the ball every delivery</strong> — including the ones you&apos;re not facing.</span></li>
                  <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">→</span><span><strong className="text-white">Rotate strike</strong> — singles are the cheapest runs in cricket.</span></li>
                  <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">→</span><span><strong className="text-white">Run hard between wickets</strong> — call yes / no / wait, eye contact with your partner.</span></li>
                  <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">→</span><span><strong className="text-white">Trust the plan</strong> — the captain has set roles. Play yours.</span></li>
                  <li className="flex gap-2"><span className="text-rose-400 flex-shrink-0">→</span><span><strong className="text-white">Bounce back fast</strong> — one bad delivery, one bad over, one bad innings doesn&apos;t define your day.</span></li>
                </ul>
              </div>

              {/* Footer reminder */}
              <div className="rounded-2xl p-5 border border-amber-500/40 bg-amber-500/5">
                <p className="text-sm text-amber-100">
                  <strong className="text-amber-300">Before each match:</strong> the captain + VC will share the playing XI with each player&apos;s role tag via the Match Plan in the C3H portal. If your role isn&apos;t clear when you read it, ask the captain or VC before the toss — don&apos;t wait until you&apos;re walking out to bat.
                </p>
              </div>
            </div>
          )}

          {/* VISUAL TRAINING VIEW */}
          {view === 'visual-training' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Visual <span className="gradient-text">Training</span></h2>
                <p className="text-gray-500 text-sm">Eye and tracking drills that teach you to watch the ball better. Off-field training that pays off on-field.</p>
              </div>

              {/* Why this matters */}
              <div className="rounded-2xl p-6 border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Why visual training matters
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  Cricket batting is one of the hardest visual tasks in sport: a 150 km/h delivery gives you about <strong className="text-white">400 milliseconds</strong> from release to bat. Most of that window is taken up by your brain&apos;s processing — your <em>eyes</em> only have ~150ms to lock on, track, and predict the bounce point.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  The Batting Principle &ldquo;Watching the Ball&rdquo; isn&apos;t just a cliché — it&apos;s a <strong className="text-white">trainable skill</strong>. Elite batters have measurably better convergence, focus-shift speed, and smooth pursuit than club-level players. The good news: these are all gym-able, with five-minute daily drills you can do anywhere.
                </p>
                <p className="text-sm text-cyan-300 italic">
                  Do any one of these 5 minutes a day for 4 weeks. You&apos;ll feel the difference at the crease.
                </p>
              </div>

              {/* ── 1. Brock String ─────────────────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    1. Brock String — Convergence &amp; Depth Perception
                  </h4>
                  <a
                    href="https://www.youtube.com/watch?v=4rDygaF3Dog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 underline hover:text-cyan-300"
                  >
                    Watch the drill ↗
                  </a>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  The gold-standard vision-therapy exercise. Trains your eyes to converge on a single point at different distances — exactly the skill that lets a batter pick up a ball at the bowler&apos;s hand, the release point, and the landing zone in one continuous track.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Equipment</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· ~10 feet of string</li>
                      <li>· 3 different-coloured beads (red / green / yellow)</li>
                      <li>· A fixed anchor (door handle, hook)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Setup</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Tie string to anchor at eye level</li>
                      <li>· Hold the other end against the tip of your nose</li>
                      <li>· Slide beads to 6&quot; / 24&quot; / 60&quot; from your nose</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">How to do it</p>
                  <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1 ml-2">
                    <li>Focus on the <strong className="text-red-300">near</strong> bead (6&quot;). The string should look like a clear <strong className="text-white">V</strong> converging on the bead. Hold for 3-5 seconds.</li>
                    <li>Shift focus to the <strong className="text-green-300">middle</strong> bead (24&quot;). The string forms an <strong className="text-white">X</strong> through that bead.</li>
                    <li>Shift focus to the <strong className="text-yellow-300">far</strong> bead (60&quot;). Same X pattern, further out.</li>
                    <li>Cycle back: far → middle → near → middle → far. Do this for 2-3 minutes.</li>
                  </ol>
                </div>

                <div className="rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2 text-xs text-gray-200 mb-2">
                  <strong className="text-cyan-300">Cricket benefit:</strong> trains both eyes to lock on a single point at varying distances — the exact skill behind tracking a ball from release to landing without losing depth cues. Players who can&apos;t converge well misjudge length.
                </div>
                <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2 text-xs text-red-200">
                  <strong>Watch for:</strong> if you see <em>two</em> strings instead of an X/V, your eyes aren&apos;t converging. Don&apos;t force it — bring the bead further away and work back closer over weeks.
                </div>

                <p className="text-xs text-gray-500 mt-2 italic">Frequency: 5 minutes daily, 4-6 weeks for noticeable gains.</p>
              </div>

              {/* ── 2. Near-Far Focus Shift ────────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔭</span>
                  2. Near-Far Focus Shift — Accommodation Speed
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Trains how fast your eyes can refocus between near and far targets. In cricket: bowler&apos;s grip (far) → release point (mid) → ball off the pitch (near). The faster you refocus, the more time you have to play the shot.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Equipment</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· A book or magazine with normal text</li>
                      <li>· Any clear distant target (sign, tree, clock)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">How to do it</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Hold book at reading distance (~12&quot;)</li>
                      <li>· Read one word</li>
                      <li>· Snap focus to a distant target — read its text</li>
                      <li>· Snap back to the next word</li>
                      <li>· Continue for 2-3 minutes</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2 text-xs text-gray-200">
                  <strong className="text-cyan-300">Cricket benefit:</strong> halves the time it takes your eyes to lock onto the ball as it travels from the bowler&apos;s hand to your bat. Players with sluggish refocus play late.
                </div>

                <p className="text-xs text-gray-500 mt-2 italic">Frequency: 3 minutes, 1-2× a day.</p>
              </div>

              {/* ── 3. Saccadic Eye Movement ───────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">↔️</span>
                  3. Saccades — Rapid Gaze Targets
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Saccades are the quick &ldquo;jumps&rdquo; your eyes make between targets — like looking from a bowler&apos;s left eye to his release point. Faster, more accurate saccades = earlier pickup.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Equipment</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Two sticky notes with single letters / numbers</li>
                      <li>· Stuck on a wall ~3 feet apart at eye level</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">How to do it</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Stand 6 feet back</li>
                      <li>· Snap eyes from left target to right target</li>
                      <li>· Call out each letter as you land on it</li>
                      <li>· Keep the head still — eyes only</li>
                      <li>· 20 repetitions, rest, 3 sets</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2 text-xs text-gray-200">
                  <strong className="text-cyan-300">Cricket benefit:</strong> drives the bowler&apos;s-eye → release-point transition. Slow saccades = late pickup = late shot.
                </div>

                <p className="text-xs text-gray-500 mt-2 italic">Frequency: 5 minutes, 3× a week.</p>
              </div>

              {/* ── 4. Smooth Pursuit ──────────────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">〰️</span>
                  4. Smooth Pursuit — Tracking a Moving Target
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Trains your eyes to <em>track</em> something smoothly without losing it, instead of jumping in jerky saccades. This is the skill of watching the ball from release to bat — uninterrupted.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Setup</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Hold a pen or finger at arm&apos;s length</li>
                      <li>· Or partner moves a ball slowly side-to-side</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">How to do it</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Move pen smoothly side-to-side, up-down, diagonal</li>
                      <li>· Eyes follow — head stays still</li>
                      <li>· No jumps; no losing the target</li>
                      <li>· 2 minutes each direction</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2 text-xs text-gray-200">
                  <strong className="text-cyan-300">Cricket benefit:</strong> the &ldquo;watch the ball into the bat&rdquo; instruction is impossible without smooth pursuit. Train this and the ball stops looking like it&apos;s jumping mid-flight.
                </div>

                <p className="text-xs text-gray-500 mt-2 italic">Frequency: 5 minutes, daily.</p>
              </div>

              {/* ── 5. Reaction Ball ───────────────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎾</span>
                  5. Reaction Ball — Hand-Eye Under Chaos
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  A reaction ball is a rubber ball with bumps that makes it bounce unpredictably. Catching one trains your eyes and hands to react to chaotic motion — closest analogue to a ball doing something weird off the pitch.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Equipment</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Reaction ball (~$10 on Amazon, search &ldquo;reaction ball&rdquo;)</li>
                      <li>· Hard surface — driveway, wall</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">How to do it</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Solo: bounce off a wall, catch on the rebound</li>
                      <li>· Pair: partner throws it at a wall, you catch</li>
                      <li>· 5 minutes of continuous catches</li>
                      <li>· Progress: smaller catching glove, faster throws</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2 text-xs text-gray-200">
                  <strong className="text-cyan-300">Cricket benefit:</strong> mimics pitch variation — sudden bounce, seam movement, deflection. Builds late-adjust capability when the ball does something unexpected.
                </div>

                <p className="text-xs text-gray-500 mt-2 italic">Frequency: 5-10 minutes, 3× a week. Also great for fielding.</p>
              </div>

              {/* ── 6. Bowler-Release Tracking ─────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  6. Bowler-Release Tracking — The Cricket-Specific Drill
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Combines saccades + smooth pursuit + convergence into one cricket-specific drill. Targets the exact sequence: <strong className="text-white">bowler&apos;s eye → release point → ball flight → bounce → bat</strong>.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">Setup (in nets or backyard)</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· Have a partner / coach throw underarm at moderate pace</li>
                      <li>· Stand in batting stance with a bat</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                    <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">The 4-step gaze sequence</p>
                    <ul className="text-gray-300 space-y-0.5">
                      <li>· <strong className="text-white">1.</strong> Lock onto thrower&apos;s left eye</li>
                      <li>· <strong className="text-white">2.</strong> Snap to release-hand position as arm reaches the top</li>
                      <li>· <strong className="text-white">3.</strong> Track ball flight smoothly</li>
                      <li>· <strong className="text-white">4.</strong> Lock on the bounce point, then the bat</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">
                  Call out each step <strong className="text-white">out loud</strong> as it happens (&ldquo;eye…release…flight…bounce…bat&rdquo;) for the first 10 balls. After that, do it silently. The verbalising forces the sequence into your motor memory.
                </p>

                <div className="rounded-md bg-cyan-500/10 border-l-2 border-cyan-500/60 px-3 py-2 text-xs text-gray-200">
                  <strong className="text-cyan-300">Cricket benefit:</strong> the gold-standard application drill — converts the lab-style drills above into match-grade tracking. This is the drill that makes everything else show up at the crease.
                </div>

                <p className="text-xs text-gray-500 mt-2 italic">Frequency: 30 balls before every nets session.</p>
              </div>

              {/* ── Weekly visual-training plan ──────────────── */}
              <div className="rounded-2xl p-6 border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Suggested Weekly Schedule (15 min / day)
                </h4>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Mon</span><span>Brock String (5 min) · Near-Far Focus (5 min) · Smooth Pursuit (5 min)</span></li>
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Tue</span><span>Saccades (5 min) · Reaction Ball (10 min)</span></li>
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Wed</span><span>Brock String (5 min) · Smooth Pursuit (5 min) · Near-Far Focus (5 min)</span></li>
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Thu</span><span>Bowler-Release Tracking (15 min — pair drill at nets if possible)</span></li>
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Fri</span><span>Reaction Ball (10 min) · Saccades (5 min)</span></li>
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Sat</span><span>Match day — 5-minute warm-up with Bowler-Release Tracking before walking out</span></li>
                  <li className="flex gap-3"><span className="text-cyan-300 font-bold flex-shrink-0 w-20">Sun</span><span>Off — your eyes need rest too</span></li>
                </ul>
              </div>

              {/* Key takeaway */}
              <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-cyan-500/10">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                <p className="text-sm text-gray-200 leading-relaxed">
                  The Batting Principle &ldquo;Watching the Ball&rdquo; assumes you have the visual machinery to do it. These drills <strong className="text-white">build that machinery</strong>. Five minutes a day, four weeks in, and balls that used to surprise you will arrive earlier in your visual window. Start with the Brock String — it&apos;s the foundation everything else builds on.
                </p>
              </div>

              <p className="text-[10px] text-gray-600 italic text-center">
                More drills (peripheral vision, depth-of-field, cognitive perception) coming next — each as a new card in this section.
              </p>
            </div>
          )}

          {/* SHOT MECHANICS VIEW */}
          {view === 'shot-mechanics' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Shot <span className="gradient-text">Mechanics</span></h2>
                <p className="text-gray-500 text-sm">Per-shot deep dives — the &ldquo;how&rdquo; behind each stroke. Read before working on the shot in nets.</p>
              </div>

              {/* Shot picker — extends as more shots are added */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { id: 'head-over-ball', label: 'Head Over the Ball', emoji: '👤', available: true },
                  { id: 'pull-shot', label: 'Pull Shot', emoji: '🏏', available: true },
                  { id: 'cut-shot', label: 'Cut Shot', emoji: '✂️', available: true },
                  { id: 'cover-drive', label: 'Cover Drive', emoji: '🎯', available: true },
                  { id: 'off-the-pads', label: 'Off the Pads', emoji: '🦵', available: true },
                  { id: 'playing-swing', label: 'Playing Swing', emoji: '〰️', available: true },
                  { id: 'sweep', label: 'Sweep', emoji: '🌾', available: false },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!s.available}
                    onClick={() => s.available && setSelectedShot(s.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      !s.available ? 'bg-white/3 text-gray-600 border-white/5 cursor-not-allowed' :
                      selectedShot === s.id ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' :
                      'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {s.emoji} {s.label}{!s.available && ' · coming soon'}
                  </button>
                ))}
              </div>

              {/* ── HEAD OVER THE BALL — Foundational ────────────────── */}
              {selectedShot === 'head-over-ball' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">👤</span>
                        Head Over the Ball — The Foundation
                      </h3>
                      <span className="text-xs text-purple-300/80 uppercase tracking-wider">Source: CCC coaching notes</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Why it matters:</strong> head over the ball is the single most important technical habit in batting. Get it right and the ball stays down — defensive shots find the ground, drives stay along the carpet, even mishits don&apos;t carry. Get it wrong and every shot has a chance of going in the air. Applies to <strong className="text-white">fast bowling and spin equally</strong> — same principle, same fix.
                    </p>
                  </div>

                  {/* Why it matters — the physics */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚖️</span>
                      Head Position = Ball Trajectory
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Where your head is, your weight is. Where your weight is, the bat face points. If your head leans back or to the side, your bat face opens up and the ball goes <em>up</em>. If your head sits over the ball, your bat face stays straight and the ball stays <em>down</em>.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
                        <p className="text-emerald-300 text-xs font-bold mb-1">✓ Head over the ball</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Weight forward, into the ball</li>
                          <li>· Bat face stays straight</li>
                          <li>· Ball stays on the ground</li>
                          <li>· Mishits roll, don&apos;t carry</li>
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm">
                        <p className="text-red-300 text-xs font-bold mb-1">✗ Head off the ball</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Weight back / sideways</li>
                          <li>· Bat face opens up</li>
                          <li>· Ball goes in the air</li>
                          <li>· Mishits = catches at slip / cover / mid-on</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Elbow lock */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">💪</span>
                      Lock the Elbows — Fast AND Spin
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Elbows have to stay locked through impact, against <strong className="text-white">both pace and spin</strong>. Loose elbows mean the bat face wobbles at contact; the ball loops up rather than staying flat.
                    </p>
                    <ul className="text-sm text-gray-200 space-y-2 mb-3">
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Top elbow locked high</strong> through the line of the ball.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Bottom elbow firm</strong>, not collapsed in toward the body.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Both elbows together control the bat face</strong>. If one loosens at contact, the face opens.</span></li>
                    </ul>
                    <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2 text-xs text-red-200">
                      <strong>The rule:</strong> if the ball is going in the air when it shouldn&apos;t — defensive shot looping, drive carrying to mid-on, sweep ballooning — your elbows let go at contact. Lock them and the ball stays down.
                    </div>
                  </div>

                  {/* Bat away from body */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⬆️</span>
                      Bat Away From the Body
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The <strong className="text-white">only way</strong> to get your head over the ball is to keep the bat slightly away from your body during the back-lift and through the swing. A bat pinned tight to the body forces the head sideways to make room — that&apos;s where the trouble starts.
                    </p>
                    <ul className="text-sm text-gray-300 space-y-2 mb-3">
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Small gap between bat and body during the lift — give the hands room.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Bat path comes down through the line, not across the body.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Head is free to come <em>forward and over</em>, not sideways.</span></li>
                    </ul>
                    <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-purple-300">Connection:</strong> this is the same principle behind playing swing — see <em>Playing Swing &gt; Bat Lift</em>. A small gap is the foundation of every clean shot.
                    </div>
                  </div>

                  {/* Front foot direction by line */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🦶</span>
                      Front Foot — Straight by Line of the Ball
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The front foot moves <strong className="text-white">forward to the line of the ball, not across it</strong>. For balls anywhere in the off-stump corridor — off stump, middle stump, 4th stump, even 5th stump — the front foot should go <strong className="text-white">straight forward</strong> toward the pitch of the ball, not crossing too far to the off side.
                    </p>
                    <div className="rounded-lg bg-white/3 border border-white/10 p-4 text-sm mb-3">
                      <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">The rule by line</p>
                      <ul className="text-gray-200 space-y-1.5">
                        <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Off stump line</strong> → front foot straight forward, head over the ball, play through cover or straight.</span></li>
                        <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Middle stump line</strong> → front foot straight forward, play through mid-on or down the ground.</span></li>
                        <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">4th stump line</strong> → front foot straight forward, head still gets over the ball, play through cover.</span></li>
                        <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">5th stump line</strong> → front foot straight forward (NOT chasing across); usually a leave, or a controlled steer.</span></li>
                      </ul>
                    </div>
                    <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2 text-xs text-red-200 mb-2">
                      <strong>Don&apos;t cross too far across.</strong> The front foot stays roughly in the direction you&apos;re standing — not reaching across to where the ball is. Reaching across locks the hips, pulls the head off the line, and the ball goes up. If the ball is too wide to reach with a straight stride, <strong>leave it</strong>.
                    </div>
                    <div className="rounded-md bg-emerald-500/10 border-l-2 border-emerald-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-emerald-300">Trigger thought:</strong> &ldquo;Foot goes forward, not across. Head follows the foot.&rdquo;
                    </div>
                  </div>

                  {/* Shoulder stability */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🪨</span>
                      Shoulders — Don&apos;t Move Them Early
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The shoulders should stay quiet through the setup and back-lift — <strong className="text-white">no premature rotation</strong>. Rotating the shoulders before contact opens the bat face, pulls the head off the ball, and sends the ball in the air.
                    </p>
                    <ul className="text-sm text-gray-300 space-y-2 mb-3">
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Front shoulder pointing at the bowler at setup.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Shoulders stay closed through the back-lift; hips and shoulders together.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span>Rotation comes <em>after</em> contact, not before. Same rule as the pivot on the pull shot.</span></li>
                    </ul>
                    <div className="rounded-md bg-amber-500/10 border-l-2 border-amber-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-amber-300">Cricket tell:</strong> if you keep getting bowled or LBW <em>around the legs</em>, your shoulders are opening early. Lock them shut and the bat face stays straight.
                    </div>
                  </div>

                  {/* Why this matters — ball stays down */}
                  <div className="glass rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">📉</span>
                      The Payoff — Ball Stays Down
                    </h4>
                    <p className="text-sm text-gray-200 mb-3">
                      All four habits — head over the ball, locked elbows, bat away from body, straight front foot — exist for one outcome: <strong className="text-white">the ball stays on the ground</strong>. That&apos;s how you avoid the catchers.
                    </p>
                    <p className="text-sm text-gray-300">
                      Look at any in-form Test batter under a still camera at the moment of contact: head directly over the ball, top elbow high and locked, bat face square, weight forward. That picture isn&apos;t cosmetic — it&apos;s the difference between 4 along the ground and a chip to mid-off.
                    </p>
                  </div>

                  {/* Common mistakes */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Common Mistakes (And the Symptom in the Game)
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Head leaning back</strong> → drive lobs to mid-off or cover. Get the weight forward.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Loose elbows at contact</strong> → defensive shot pops up; sweep balloons. Lock through impact.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Bat pinned to body</strong> → head goes sideways to make room, line of the ball missed.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Front foot across to off side</strong> → hips lock, ball under your eyes ends up between bat and pad.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Shoulders open early</strong> → bowled or LBW around the legs; bat face opens.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Front foot chasing 5th-stump width</strong> → over-reach, head off line, edge to slip. Leave it instead.</span></li>
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Head Over the Ball — Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Setup</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Front shoulder pointing at the bowler</li>
                          <li>☐ Bat slightly away from the body</li>
                          <li>☐ Head still, eyes level</li>
                          <li>☐ Weight balanced, ready to move forward</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At contact</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Head directly over the ball</li>
                          <li>☐ Both elbows locked</li>
                          <li>☐ Front foot pointing forward, not across</li>
                          <li>☐ Shoulders still closed (not yet rotated)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-purple-500/10">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Head over the ball is the master skill — every other shot in this section depends on it. The four habits that get you there: <strong className="text-white">bat slightly away from the body, elbows locked through contact, front foot forward (not across), shoulders still until after impact</strong>. Master these and the ball stays on the ground, mishits don&apos;t carry, and you bat for longer. Applies equally to a 140kph seamer and a flighted leg-spinner — the body shape is the same.
                    </p>
                  </div>
                </div>
              )}

              {/* ── PULL SHOT — Simon Keen ────────────────────────────── */}
              {selectedShot === 'pull-shot' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">🏏</span>
                        Pull Shot
                      </h3>
                      <span className="text-xs text-purple-300/80 uppercase tracking-wider">Source: Simon Keen</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Why it matters:</strong> the pull shot is one of the most important scoring shots in cricket. Fast bowlers frequently target a back-of-a-length area around hip height — a batter who consistently scores from these deliveries immediately puts pressure on the bowler. The best players in the world dominate short bowling because they identify length early and turn defensive deliveries into runs.
                    </p>
                  </div>

                  {/* Core Principles */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚙️</span>
                      Core Principles
                    </h4>

                    <div className="space-y-5">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">1. Read length early</p>
                        <p className="text-sm text-gray-300 mb-2">The shot starts before the ball reaches you. Identify the short length as early as possible; make your movement early; don&apos;t wait until the ball is close.</p>
                        <p className="text-sm text-amber-300/80 italic">Sequence: Read length → Forward press → Rock back → Contact → Pivot</p>
                      </div>

                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">2. Weight transfer, not big movement</p>
                        <p className="text-sm text-gray-300 mb-2">Primarily about transferring weight efficiently, not large foot movements. Press → transfer to back foot → stay balanced → strike → rotate. The movement should be <strong className="text-white">compact, controlled, and athletic</strong>.</p>
                      </div>

                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">3. Keep the back heel off the ground</p>
                        <p className="text-sm text-gray-300 mb-2">Keeps the head slightly forward, prevents falling backward, maintains balance, improves power, allows a smoother pivot.</p>
                        <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2 text-xs text-red-200">
                          <strong>Avoid:</strong> sitting back on the heel · leaning away from the ball.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Position */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🧍</span>
                      Body Position
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-4">
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At setup</p>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>· Hands high</li>
                          <li>· Front foot light, ready to move</li>
                          <li>· Eyes on the release point</li>
                          <li>· Athletic posture</li>
                        </ul>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-4">
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At contact</p>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>· Head stable</li>
                          <li>· Both feet grounded</li>
                          <li>· Arms fully extended</li>
                          <li>· Back hip rotating through</li>
                          <li>· Weight slightly forward despite rocking back</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Body height + swing plane */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">📐</span>
                      Body Height &amp; Swing Plane
                    </h4>
                    <p className="text-sm text-gray-300 mb-4">
                      Body height adjusts to the bounce of the ball. Your bat path should match the height of the ball — both feet on the ground lets you adjust quickly.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm text-gray-300">
                        <p className="text-purple-300 text-xs font-bold mb-1">Low ball</p>
                        Stay lower · bend knees more · flatter swing · pull through square or midwicket.
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-gray-200">
                        <p className="text-amber-300 text-xs font-bold mb-1">Hip-height (ideal)</p>
                        Natural swing path · maximum control and scoring potential.
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm text-gray-300">
                        <p className="text-purple-300 text-xs font-bold mb-1">Higher bounce</p>
                        More upright · swing slightly upward if required · maintain balance.
                      </div>
                    </div>
                  </div>

                  {/* Contact + wrist + pivot */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Contact, Wrists &amp; Pivot
                    </h4>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">Correct technique</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>· Extend arms fully through the ball</li>
                          <li>· Snap wrists through impact</li>
                          <li>· Strike the ball flush from the middle of the bat</li>
                        </ul>
                      </div>
                      <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2 text-xs text-red-200">
                        <strong>Avoid rolling the wrists.</strong> Rolling reduces power · slows the ball · increases top-edge risk · creates inconsistent contact. <em>Hit through the ball, not across it.</em>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">The pivot — a consequence, not a cause</p>
                        <p className="text-gray-300">The pivot happens <strong className="text-white">after</strong> contact. Strike → hips rotate → pivot naturally. <strong className="text-red-300">Do not spin early.</strong> The pivot should be a consequence of good contact, not something forced before impact.</p>
                      </div>
                    </div>
                  </div>

                  {/* Variations */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🔀</span>
                      Variations
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Full Swing Pull</p>
                        <p className="text-gray-300">Aggressive. Bat finishes over opposite shoulder. Maximum power. <strong className="text-white">Best vs medium pace, when going for boundary.</strong></p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Check Pull</p>
                        <p className="text-gray-300">Controlled. Shortened follow-through. Uses the bowler&apos;s pace. <strong className="text-white">Best vs faster bowlers; easier to keep down; great for 1s, 2s, boundaries.</strong></p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Front Foot Pull</p>
                        <p className="text-gray-300">Press forward, keep weight moving forward, pull through the line. <strong className="text-white">Best vs medium pace when you have time.</strong></p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                        <p className="text-amber-300 text-xs font-bold mb-1">Snap Pull (Warner)</p>
                        <p className="text-gray-200">Minimal foot movement · quick weight transfer · strong back-hip rotation · compact swing. <strong className="text-white">Attacks anything slightly shorter than a good length.</strong></p>
                      </div>
                    </div>
                    <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-purple-300">Why this matters:</strong> if you consistently score from back-of-a-length, bowlers can&apos;t bowl there comfortably. Shorter balls become easier to pull. Fuller balls become easier to drive. You force the bowler off their preferred length.
                    </div>
                  </div>

                  {/* Zones */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🟢</span>
                      Pull Shot Zones
                    </h4>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                        <p className="text-emerald-300 text-xs font-bold mb-1">🟢 Green Zone — Attack</p>
                        <p className="text-sm text-gray-200">Thigh height · waist · hip · lower chest. Easiest and safest balls to pull.</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">🟡 Amber Zone — Use Judgment</p>
                        <p className="text-sm text-gray-200">Upper chest · around head height. Playable but requires excellent control.</p>
                      </div>
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                        <p className="text-red-300 text-xs font-bold mb-1">🔴 Red Zone — Usually Leave</p>
                        <p className="text-sm text-gray-200">Above shoulder · very wide short balls. Options: leave · duck · sway · cut if appropriate.</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact zone preference + Simon's recommendation */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      Find Your Contact Zone &amp; Finish
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Every batter has a preferred contact area. Some play the ball close to the body (easier to guide around the corner); others prefer it slightly wider (more room to swing). Experiment in nets and find where you feel strongest.
                    </p>
                    <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-sm text-gray-200">
                      <strong className="text-purple-300">Simon&apos;s preferred finish:</strong> both feet remaining grounded · strong base · stable posture · full control of balance. Simon does <strong>not</strong> recommend excessively lifting the front leg — reduces balance, less control, more likely to fall backward. Some elite players do it, but a grounded base is more repeatable and reliable.
                    </div>
                  </div>

                  {/* Training drill */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🏋️</span>
                      Training Drill
                    </h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-300"><strong className="text-purple-300">Setup:</strong> underarm throwdowns from halfway. Replicate realistic match timing.</p>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">Correct timing</p>
                        <p className="text-gray-300 mb-1">As the feeder prepares to release, you should already be:</p>
                        <ul className="text-gray-300 space-y-0.5 ml-3">
                          <li>· pressing into the front leg</li>
                          <li>· prepared to transfer weight</li>
                          <li>· prepared to rock back</li>
                        </ul>
                        <p className="text-gray-300 mt-1">Then: ball released → rock back → extend arms → snap wrists → complete shot.</p>
                      </div>
                      <div className="rounded-md bg-red-500/10 border-l-2 border-red-500/60 px-3 py-2 text-xs text-red-200">
                        <strong>Common mistake:</strong> waiting until release before beginning movement. Creates late reactions, unrealistic timing, and poor transfer to match situations.
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">Progression</p>
                        <ol className="text-gray-300 list-decimal list-inside space-y-0.5">
                          <li>Learn correct technique slowly.</li>
                          <li>Repeat until consistent.</li>
                          <li>Increase movement speed.</li>
                          <li>Develop match-like reactions.</li>
                        </ol>
                        <p className="text-amber-300/80 text-xs italic mt-1">Speed comes only after technique is reliable.</p>
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Pull Shot Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Before release</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Hands high</li>
                          <li>☐ Athletic stance</li>
                          <li>☐ Eyes on release point</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">During movement</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Read length early</li>
                          <li>☐ Forward press</li>
                          <li>☐ Rock back</li>
                          <li>☐ Back heel off ground</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At contact</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Head stable</li>
                          <li>☐ Both feet grounded</li>
                          <li>☐ Arms fully extended</li>
                          <li>☐ Snap wrists through ball</li>
                          <li>☐ Match swing plane to bounce</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">After contact</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Rotate back hip</li>
                          <li>☐ Pivot naturally</li>
                          <li>☐ Stay balanced</li>
                          <li>☐ Finish under control</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-purple-500/10">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      The pull shot is a high-value scoring shot that lets batters dominate fast bowlers and control the game. Success comes from <strong className="text-white">early length recognition, efficient weight transfer, keeping the back heel off the ground, matching swing plane to bounce, and maintaining balance</strong>. Mastering the pull shot turns the bowler&apos;s safest delivery into a scoring opportunity and forces them to change their length.
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-600 italic text-center">
                    More shots (Cover Drive, Cut Shot, Sweep, and others) coming next — each as a separate deep dive in this section.
                  </p>
                </div>
              )}

              {/* ── CUT SHOT — Simon Keen ────────────────────────────── */}
              {selectedShot === 'cut-shot' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">✂️</span>
                        Cut Shot
                      </h3>
                      <span className="text-xs text-purple-300/80 uppercase tracking-wider">Source: Simon Keen</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Why it matters:</strong> the cut shot punishes width outside off stump — the most common ball a fast bowler leaks and the easiest free run on offer. A batter with a reliable cut forces bowlers to bowl tighter, which opens up the V for drives. No reliable cut means the off side stops scoring.
                    </p>
                  </div>

                  {/* Core Principles */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚙️</span>
                      Core Principles
                    </h4>
                    <ul className="text-sm text-gray-200 space-y-2">
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Back heel off the ground</strong> — stay athletic, on your toes. Heel down = falling back, loss of balance.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Hands stay high.</strong> Cut comes down on the ball from above, not across.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Head moves toward point.</strong> Head leads the shot in the direction of intended scoring.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Strike the ball flush</strong> — middle of the bat, not the toe or the edge.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Match swing plane to bounce.</strong> Low bounce = flatter cut. Higher bounce = steeper, more upright cut.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Don&apos;t roll the wrists.</strong> Rolling = top edge or chop on. Hit through the line.</span></li>
                    </ul>
                  </div>

                  {/* Timing controls direction */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⏱️</span>
                      Timing Controls Direction
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The cut is a timing shot, not a power shot. <strong className="text-white">When you make contact</strong> decides where the ball goes:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
                        <p className="text-emerald-300 text-xs font-bold mb-1">Earlier contact</p>
                        <p className="text-gray-200">Ball played in <strong className="text-white">front of point</strong> — through cover-point / backward point.</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                        <p className="text-amber-300 text-xs font-bold mb-1">Later contact</p>
                        <p className="text-gray-200">Ball played <strong className="text-white">behind point</strong> — late cut / steer to third man.</p>
                      </div>
                    </div>
                    <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-xs text-gray-200 mt-3">
                      <strong className="text-purple-300">Implication:</strong> the cut lets you target three different fielding gaps from the same starting position — just by adjusting how late you play it. Field-aware batters use this constantly.
                    </div>
                  </div>

                  {/* Decision making — cut vs pull */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Decision Making — Cut vs Pull
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The cut and pull share the back-foot setup but split on ball direction. Read the angle, then choose:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Ball angling across (away from you)</p>
                        <p className="text-gray-200"><strong className="text-white">→ Cut.</strong> Width outside off stump, going further away.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Ball angling in (toward body)</p>
                        <p className="text-gray-200"><strong className="text-white">→ Pull.</strong> Coming back toward middle / hip line.</p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-300/80 italic mt-2">Reading the angle in the air is the difference between four runs and a leading edge to point.</p>
                  </div>

                  {/* Variations */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🔀</span>
                      Variations
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Full Swing Cut</p>
                        <p className="text-gray-200">Aggressive, full follow-through. Maximum power. Best when the field is up and there&apos;s gap behind point.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Check Cut</p>
                        <p className="text-gray-200">Shortened follow-through. Placement over power. Lower risk; ideal in middle overs.</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                        <p className="text-amber-300 text-xs font-bold mb-1">Upper Cut</p>
                        <p className="text-gray-200">Higher bounce, ball above shoulder. Hit over the slip cordon to third man / fine third. Aerial — needs confidence in execution.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Late Cut</p>
                        <p className="text-gray-200">Play it as late as possible; angle the bat down to third man. Soft hands. The trickle-single specialist.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-purple-300 text-xs font-bold mb-1">Helicopter Cut</p>
                        <p className="text-gray-200">Rotational follow-through that lets the bat finish over the head — extra power on length deliveries that sit up.</p>
                      </div>
                    </div>
                  </div>

                  {/* Common mistakes */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Common Mistakes
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Rolling the wrists</strong> at contact → top edge to backward point or chop on to keeper.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Falling backward</strong> onto the heel → loss of balance, mistimed cut goes in the air.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Cutting balls angling into the body</strong> → use the pull. Cutting in-comers is how you get bowled or LBW.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Hands low at the start</strong> → bat comes around the line, not down on it. Toe of the bat hits the ball.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Cutting full balls</strong> → cut needs the ball to be short of length. A full ball cut is a chop-on waiting to happen.</span></li>
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Cut Shot Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Setup</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Back heel off the ground</li>
                          <li>☐ Hands high, ready to come down</li>
                          <li>☐ Athletic, on toes</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At contact</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Head moving toward point</li>
                          <li>☐ Strike flush, middle of the bat</li>
                          <li>☐ No wrist roll — hit through</li>
                          <li>☐ Swing plane matches bounce</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-purple-500/10">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      <strong className="text-white">Width equals cut.</strong> Heels up, hands high, head toward point, strike flush, no wrist roll. Time it earlier or later to pick different scoring gaps from the same setup. Cut the angling-out ball; pull the angling-in ball — confusing the two is how the cut gets you out.
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-600 italic text-center">
                    Cue: <em>&ldquo;Width equals cut. Angle across. Stay tall. Hands high. Hit through.&rdquo;</em>
                  </p>
                </div>
              )}

              {/* ── COVER DRIVE — Simon Keen (with sibling drives) ──── */}
              {selectedShot === 'cover-drive' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">🎯</span>
                        Cover Drive (and its sibling drives)
                      </h3>
                      <span className="text-xs text-purple-300/80 uppercase tracking-wider">Source: Simon Keen</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Why it matters:</strong> the cover drive is cricket&apos;s signature shot. It&apos;s the shot batters dream about and the shot that gets them out chasing the dream too early. Played right, it&apos;s a four through the most open part of the off side. Played wrong, it&apos;s an edge to the slip cordon. The technique compounds — get the cover drive right and the on drive, straight drive, and off drive follow.
                    </p>
                  </div>

                  {/* Core Principles */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚙️</span>
                      Core Principles
                    </h4>
                    <ul className="text-sm text-gray-200 space-y-2">
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Controlled stride toward mid-off</strong> — not too far across; foot points roughly at extra cover.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Head in front of front knee</strong> at contact. If the head&apos;s behind the knee, the ball goes in the air.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Stay side-on.</strong> Front shoulder pointing at the bowler at setup; chest doesn&apos;t open early.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Relax the bottom hand</strong> slightly through contact — bottom-hand-dominant drives go in the air.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Full face of the bat</strong> through the line of the ball — bat face pointing at the target, not angled.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Look through the bottom forearm</strong> at the ball — that&apos;s the gaze cue that keeps the head still.</span></li>
                      <li className="flex gap-2"><span className="text-purple-400 flex-shrink-0">→</span><span><strong className="text-white">Hands finish close to the head</strong>, elbows tucked. Balanced finish.</span></li>
                    </ul>
                  </div>

                  {/* Body position */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🧍</span>
                      Body Position at Contact
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
                        <p className="text-emerald-300 text-xs font-bold mb-1">✓ Right shape</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Head in front of front knee</li>
                          <li>· Front shoulder pointing at the ball</li>
                          <li>· Bat face square through the line</li>
                          <li>· Weight forward, into the shot</li>
                          <li>· Hands finish near the head</li>
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm">
                        <p className="text-red-300 text-xs font-bold mb-1">✗ Wrong shape</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Head behind / over the knee</li>
                          <li>· Chest opening early — falling away</li>
                          <li>· Bat angled, not square</li>
                          <li>· Weight back, reaching for the ball</li>
                          <li>· Bottom hand dominating contact</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Target areas */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🗺️</span>
                      Target Area
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Cover drive ideal target: the gap between mid-off and cover. Open the bat face very slightly for extra cover; close very slightly for straighter through mid-off. The shot itself doesn&apos;t change — the angle of the bat face at contact does.
                    </p>
                  </div>

                  {/* Drive family */}
                  <div className="glass rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">👨‍👩‍👧</span>
                      Sibling Drives — Same Family, Small Adjustments
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">Straight Drive — back past the bowler</p>
                        <p className="text-gray-200">Step <strong className="text-white">straight down the wicket</strong>. Head leads everything. Stay side-on. Weight transfers directly forward. Most disciplined of the drives — full face, pure timing.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">On Drive — through mid-on</p>
                        <p className="text-gray-200"><strong className="text-white">Smaller step.</strong> Open the front hip slightly. Head still forward. Swing through mid-on or straight midwicket. Hardest of the drives to play technically clean.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">Off Drive — through mid-off / extra cover</p>
                        <p className="text-gray-200">Controlled stride, head in front of front knee, full face, hands finish close to the head. Cover drive is the wider cousin — same shot, target slightly squarer.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">Square Drive (front-foot cut)</p>
                        <p className="text-gray-200">Don&apos;t step too far across. Stay side-on. Front shoulder leads. Match swing plane to bounce. Timing changes direction (earlier = in front of point, later = behind).</p>
                      </div>
                    </div>
                  </div>

                  {/* Variations */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🔀</span>
                      Drive Variations by Intent
                    </h4>
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                        <p className="text-purple-300 text-xs font-bold mb-1">Defensive Drive</p>
                        <p className="text-gray-200">Soft hands. ~45° bat angle. Rotation, not boundary. The under-rated single source.</p>
                      </div>
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                        <p className="text-purple-300 text-xs font-bold mb-1">Check Drive</p>
                        <p className="text-gray-200">Bat parallel to the ground at finish. Placement focused. Pick the gap, hit it firm.</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">Full Drive</p>
                        <p className="text-gray-200">Complete follow-through; bat finishes over the shoulder. Boundary option when the ball is full enough.</p>
                      </div>
                    </div>
                  </div>

                  {/* Decision making */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🌳</span>
                      When to Drive (and When Not To)
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                        <p className="text-emerald-300 text-xs font-bold mb-1">✅ Drive when</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Ball is full (half-volley or fuller)</li>
                          <li>· In line with the body or just outside off</li>
                          <li>· Bowler&apos;s rhythm is settled (you can read length)</li>
                          <li>· Field has a gap in the off side</li>
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                        <p className="text-red-300 text-xs font-bold mb-1">❌ Don&apos;t drive when</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Ball is good length or shorter — chop on / edge</li>
                          <li>· You&apos;re not yet set (first 10 balls especially)</li>
                          <li>· Ball is swinging late — reach + edge</li>
                          <li>· On a wicket where the ball isn&apos;t coming on</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Common mistakes */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Common Mistakes
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Driving good-length balls.</strong> The #1 cause of caught-behind on drives. Wait for the half-volley.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Head behind the front knee.</strong> Drive lobs to mid-off or cover.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Bottom hand dominating.</strong> Bat face closes, ball goes in the air.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Chest opening early.</strong> Loses side-on shape, bat comes across the line.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Driving before set.</strong> First 10 balls aren&apos;t for drives. Defend straight, score off width.</span></li>
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Cover Drive Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Setup</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Side-on, front shoulder at bowler</li>
                          <li>☐ Bat lifted slightly away from body</li>
                          <li>☐ Head still, eyes level</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At contact</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Head in front of front knee</li>
                          <li>☐ Full face of bat, square through the line</li>
                          <li>☐ Bottom hand relaxed</li>
                          <li>☐ Hands finish close to the head</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-purple-500/10">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Cover drive is a <strong className="text-white">discipline</strong> shot, not a power shot. Head in front of the front knee, side-on shape, full face, hands finish near the head. Drive the half-volley; defend the good length. Get this template right and the straight drive, on drive, and off drive all fall out of the same body shape.
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-600 italic text-center">
                    Cue: <em>&ldquo;Head to mid-off. Hands close to ear. Stay side-on.&rdquo;</em>
                  </p>
                </div>
              )}

              {/* ── PLAYING OFF THE PADS — Front & Back Foot Flick ──── */}
              {selectedShot === 'off-the-pads' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">🦵</span>
                        Playing Off the Pads — The Flick
                      </h3>
                      <span className="text-xs text-purple-300/80 uppercase tracking-wider">Source: Simon Keen</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Why it matters:</strong> the flick off the pads turns the bowler&apos;s safest defensive line — straight at the pads — into easy runs through the leg side. Without it, you get bogged down by anything on middle-and-leg. With it, you rotate strike at will and force bowlers to bowl wider, opening up your off-side scoring.
                    </p>
                  </div>

                  {/* Core principle — straight bat first */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🏏</span>
                      The Core Principle — Straight Bat First, Flick Second
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The flick looks like a wristy leg-side shot — but the technique that makes it safe is the opposite. <strong className="text-white">Lead with a straight bat coming down the line; let the wrists do the flick at the very last moment.</strong> Start with the flick and you swing across the line — guaranteed bowled or LBW.
                    </p>
                    <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-purple-300">Rule:</strong> bat comes down straight as if you&apos;re defending. The wrists turn only at contact. The wrist turn is the <em>finish</em>, not the start.
                    </div>
                  </div>

                  {/* Front Foot Flick */}
                  <div className="glass rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">↗️</span>
                      Front Foot Flick — Press Forward, Whip Late
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The default flick for fuller balls on middle / leg / pad line. Press forward into the ball, head well over it, let the wrists turn at the last moment.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Key technique</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Straight bat first, wrist flick second</li>
                          <li>· Head well forward, over the ball</li>
                          <li>· Small front-foot movement (don&apos;t over-stride)</li>
                          <li>· Front knee remains bent</li>
                          <li>· Weight moves toward the bowler</li>
                          <li>· Bottom hand controls the flick</li>
                          <li>· Hands finish under the chin</li>
                          <li>· Elbows tucked, not flaring out</li>
                        </ul>
                      </div>
                      <div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm mb-2">
                          <p className="text-emerald-300 text-xs font-bold mb-1">✅ When to play</p>
                          <ul className="text-gray-200 space-y-0.5">
                            <li>· Full ball on leg stump</li>
                            <li>· Full ball on middle stump</li>
                            <li>· Ball into the pads / hip</li>
                          </ul>
                        </div>
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm">
                          <p className="text-red-300 text-xs font-bold mb-1">❌ Avoid</p>
                          <ul className="text-gray-200 space-y-0.5">
                            <li>· Swinging across the line of the ball</li>
                            <li>· Lifting the body before contact</li>
                            <li>· Falling toward square leg</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md bg-emerald-500/10 border-l-2 border-emerald-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-emerald-300">Trigger thought:</strong> &ldquo;Straight bat. Head forward. Flick late. Finish under chin.&rdquo;
                    </div>
                  </div>

                  {/* Back Foot Flick */}
                  <div className="glass rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">↘️</span>
                      Back Foot Flick — Clear Space, Whip Clean
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      For shorter balls on the hips or back-of-length on the pads. The trick: clear the front leg out of the way so the bat has room to come through cleanly, but keep the shoulders closed until contact.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg bg-white/3 border border-white/5 p-3 text-sm">
                        <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">Key technique</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Move onto the back foot</li>
                          <li>· Back heel stays off the ground</li>
                          <li>· Clear the front leg (move it out of the way)</li>
                          <li>· Stay side-on through the movement</li>
                          <li>· Head over the ball, not falling away</li>
                          <li>· Wrists work through contact</li>
                          <li>· Hands finish under the chin</li>
                        </ul>
                      </div>
                      <div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm mb-2">
                          <p className="text-emerald-300 text-xs font-bold mb-1">✅ When to play</p>
                          <ul className="text-gray-200 space-y-0.5">
                            <li>· Back-of-length on the pads</li>
                            <li>· Ball arriving into the hip area</li>
                            <li>· Shorter ball that&apos;s rising into your body</li>
                          </ul>
                        </div>
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm">
                          <p className="text-red-300 text-xs font-bold mb-1">❌ Avoid</p>
                          <ul className="text-gray-200 space-y-0.5">
                            <li>· Opening the hips early</li>
                            <li>· Falling backwards onto the heel</li>
                            <li>· Front leg blocking the bat&apos;s path</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md bg-amber-500/10 border-l-2 border-amber-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-amber-300">Trigger thought:</strong> &ldquo;Clear space. Stay side-on. Flick clean.&rdquo;
                    </div>
                  </div>

                  {/* Decision making — which variant when */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🌳</span>
                      Front Foot vs Back Foot — Which Flick When?
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Length decides. Same bat path, different footwork:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                        <p className="text-emerald-300 text-xs font-bold mb-1">Full to good length on the pads</p>
                        <p className="text-gray-200"><strong className="text-white">→ Front foot flick.</strong> Press into the ball; whip late.</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                        <p className="text-amber-300 text-xs font-bold mb-1">Back of length / into the hip</p>
                        <p className="text-gray-200"><strong className="text-white">→ Back foot flick.</strong> Clear the front leg; work it through square.</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 italic mt-2">Read length first, then commit to the variant. Half-forward against either is how you get hit on the pad.</p>
                  </div>

                  {/* Common mistakes */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Common Mistakes
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Wrist flick first, bat second.</strong> Bat comes across the line; bowled / LBW around the legs.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Opening the hips early.</strong> Shoulders rotate, bat face opens, top edge to short fine leg.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Falling toward square leg.</strong> Loss of balance, ball pops up to mid-on or square leg.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Hands finishing high above the head.</strong> Means the bottom hand dominated; ball goes in the air. Hands should finish at chin level.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Front leg blocking on the back foot flick.</strong> Bat can&apos;t come through; jammed straight at the bowler.</span></li>
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Off the Pads Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Setup &amp; movement</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Read length first (front foot or back?)</li>
                          <li>☐ Head leads, eyes on the ball</li>
                          <li>☐ Stay side-on; shoulders closed</li>
                          <li>☐ For back foot: clear the front leg</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">At contact</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Straight bat down the line, not across</li>
                          <li>☐ Wrist flick happens at contact, not before</li>
                          <li>☐ Bottom hand controls the flick</li>
                          <li>☐ Hands finish under the chin</li>
                          <li>☐ Elbows tucked, balanced finish</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-purple-500/10">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      <strong className="text-white">Straight bat first. Flick second.</strong> The wrist is the finish, not the start. Press forward for fuller balls; clear the front leg and stay side-on for back-of-length balls into the hip. Hands finish under the chin every time — that&apos;s the marker that tells you bottom hand worked, ball stayed down, you can keep doing this all day.
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-600 italic text-center">
                    Cues: <em>&ldquo;Straight bat. Flick late.&rdquo;</em> · <em>&ldquo;Clear space. Flick clean.&rdquo;</em>
                  </p>
                </div>
              )}

              {/* ── PLAYING SWING — In-swing & Out-swing ─────────────── */}
              {selectedShot === 'playing-swing' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-amber-500/5 to-transparent">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">〰️</span>
                        Playing Swing — In-swing &amp; Out-swing
                      </h3>
                      <span className="text-xs text-purple-300/80 uppercase tracking-wider">Source: CCC coaching notes</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Why it matters:</strong> swing bowling dismisses in-form batters because the line and length look orthodox but the ball moves <em>after</em> you&apos;ve committed. The technique to play swing isn&apos;t about chasing every delivery — it&apos;s about an open, mobile setup where the bat, elbow, and front foot can adjust to late movement instead of being trapped by it.
                    </p>
                  </div>

                  {/* Core principle — open posture */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🧍</span>
                      The Core Principle — Open, Never Closed
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Every error against swing traces back to a <strong className="text-white">closed</strong> position somewhere — closed front foot, elbow pinned to the body, head stiff over the stumps, bat lifted tight to the back. A closed batter can&apos;t adjust to late movement; an open batter can.
                    </p>
                    <p className="text-sm text-amber-300/80 italic">Rule: little gaps everywhere — bat away from body, elbow free, head soft, foot angled forward, not across.</p>
                  </div>

                  {/* Bat lift */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⬆️</span>
                      Bat Lift — Slightly Away From the Body
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The bat lift sets up everything. Lift the bat <strong className="text-white">slightly away from the body</strong>, not tight up against your back leg. A small gap between bat and body during the back-lift gives the hands room to adjust the bat path as the ball moves.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
                        <p className="text-emerald-300 text-xs font-bold mb-1">✓ Do</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Lift slightly away from the body</li>
                          <li>· Bat coming down through second slip — gully line</li>
                          <li>· Hands free, wrists soft</li>
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm">
                        <p className="text-red-300 text-xs font-bold mb-1">✗ Avoid</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Bat pinned tight against the back leg</li>
                          <li>· Straight-up vertical lift (no room to adjust)</li>
                          <li>· Stiff wrists locked at the top</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Elbow position */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">💪</span>
                      Elbow Position — Free, Not Stuck
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      When the ball is moving away from middle stump, your top elbow has to <strong className="text-white">go with the ball</strong> — extend out toward the line. If your elbows are pinned to your body, the elbow can&apos;t lead and the bat ends up swinging across the line of the ball.
                    </p>
                    <div className="rounded-md bg-purple-500/10 border-l-2 border-purple-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-purple-300">Cue:</strong> &ldquo;Top elbow chases the ball.&rdquo; For an out-swinger going wider, the elbow extends with it. For an in-swinger ducking back in, the elbow stays soft so the hands can work the line.
                    </div>
                  </div>

                  {/* Head and balance */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">👤</span>
                      Head &amp; Balance — Soft, Not Stiff
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The head and shoulders should sit with a little gap between them and the front leg — <strong className="text-white">never stiff or locked</strong>. A stiff head means the eyes can&apos;t adjust late; a soft head with small gap means you can react to the last 0.2 seconds of swing.
                    </p>
                    <p className="text-sm text-gray-300">
                      Think of it like a boxer&apos;s guard — alert, balanced, ready to move in any direction. Never welded into one position.
                    </p>
                  </div>

                  {/* Front foot */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🦶</span>
                      Front Foot — Open, Pointing Forward
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      This is the single biggest technical key. The front foot should <strong className="text-white">not be closed</strong> — meaning it shouldn&apos;t point across the line toward fine leg. A closed front foot locks your hips, locks your shoulders, and prevents the bat from coming down on the line of the ball.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm">
                        <p className="text-emerald-300 text-xs font-bold mb-1">✓ Open / forward</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Front foot points down the wicket (toward mid-off or extra cover)</li>
                          <li>· Hips can rotate freely</li>
                          <li>· Bat has space to come straight through</li>
                          <li>· Body moves forward toward the ball</li>
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm">
                        <p className="text-red-300 text-xs font-bold mb-1">✗ Closed</p>
                        <ul className="text-gray-200 space-y-0.5">
                          <li>· Front foot points across toward fine leg</li>
                          <li>· Hips lock up, can&apos;t rotate</li>
                          <li>· Bat forced to swing across the line</li>
                          <li>· LBW + bowled risk explodes</li>
                        </ul>
                      </div>
                    </div>
                    <div className="rounded-md bg-amber-500/10 border-l-2 border-amber-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-amber-300">Why this matters most:</strong> if you only fix one thing, fix this. An open front foot lets you play out-swing AND in-swing with the same setup. A closed front foot makes both impossible.
                    </div>
                  </div>

                  {/* Out-swing specifically */}
                  <div className="glass rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">↗️</span>
                      Playing the Out-swinger
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Out-swing leaves the right-hander, going away from middle stump toward the slips. The danger shot is reaching for it and edging behind. The way to play it:
                    </p>
                    <ul className="text-sm text-gray-200 space-y-2 mb-3">
                      <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Elbow and bat go directly to the ball.</strong> Top elbow extends with the line of the ball; bat follows. Don&apos;t play around the line.</span></li>
                      <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Play late.</strong> Let the ball come right under your eyes — the later you play it, the less the swing can deceive you.</span></li>
                      <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Soft hands.</strong> If the ball moves more than expected and finds the edge, soft hands drop the ball short of the slips.</span></li>
                      <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">→</span><span><strong className="text-white">Leave the wide one.</strong> If the ball is shaping past 5th-stump line, leave it. Discipline on out-swing is half the battle.</span></li>
                    </ul>
                    <div className="rounded-md bg-emerald-500/10 border-l-2 border-emerald-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-emerald-300">Trigger thought:</strong> &ldquo;Elbow toward the ball, hands soft, play late.&rdquo;
                    </div>
                  </div>

                  {/* In-swing specifically */}
                  <div className="glass rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">↘️</span>
                      Playing the In-swinger
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      In-swing comes back into the right-hander, threatening LBW and bowled. The danger shot is jamming the bat down with closed hips and getting hit on the pad. The way to play it:
                    </p>
                    <ul className="text-sm text-gray-200 space-y-2 mb-3">
                      <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Front foot stays open.</strong> Same setup as for out-swing — front foot points forward, hips free to rotate. Closed front foot is what gets you LBW.</span></li>
                      <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Bat lifted slightly away.</strong> So the hands can bring the bat down straight, not in an arc that exposes the pad.</span></li>
                      <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Play through the line, not around it.</strong> Trust the bat down the wicket; the ball will hit the bat first if your shape is right.</span></li>
                      <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">→</span><span><strong className="text-white">Forward movement.</strong> Body weight goes into the ball, not back away from it. Pressing forward shortens the swing window before it can move.</span></li>
                    </ul>
                    <div className="rounded-md bg-amber-500/10 border-l-2 border-amber-500/60 px-3 py-2 text-xs text-gray-200">
                      <strong className="text-amber-300">Trigger thought:</strong> &ldquo;Front foot forward, bat away, play straight.&rdquo;
                    </div>
                  </div>

                  {/* Common mistakes */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Common Mistakes Against Swing
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Closed front foot.</strong> The single biggest cause of swing dismissals. Hips lock, bat goes across the line, ball wins.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Elbow pinned to the body.</strong> Bat can&apos;t track the ball, edge to slip on out-swing.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Bat lifted tight to the back leg.</strong> No room to adjust the bat path as the ball moves late.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Head stiff, leaning across.</strong> Eyes can&apos;t adjust to late movement; balance gone.</span></li>
                      <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">×</span><span><strong className="text-white">Going back when you should be coming forward.</strong> Back-foot retreat against swing gives the ball maximum window to move.</span></li>
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div className="rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Playing Swing Checklist
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Setup</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Small gap — bat slightly away from body</li>
                          <li>☐ Elbows free, not pinned</li>
                          <li>☐ Head soft, not stiff</li>
                          <li>☐ Front foot pointing forward, not across</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">Movement</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>☐ Forward weight, into the ball</li>
                          <li>☐ Top elbow tracks the ball line</li>
                          <li>☐ Bat comes down straight, not across</li>
                          <li>☐ Play late, under the eyes</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key takeaway */}
                  <div className="rounded-2xl p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-purple-500/10">
                    <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">⭐ Key takeaway</p>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Playing swing is about <strong className="text-white">openness everywhere</strong> — bat lifted away, elbow free, head soft, front foot forward. A closed position invites swing to win; an open position lets you adjust to late movement. The single fix that helps most: open the front foot. Everything else is built on top of that one habit.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRINCIPLES VIEW */}
          {view === 'principles' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Batting <span className="gradient-text">Principles</span></h2>
                <p className="text-gray-500 text-sm">Battle-ready framework. Read before every innings. Recall during reflection.</p>
              </div>

              {/* PRE-INNINGS CHECKLIST */}
              <div className="rounded-2xl p-6 border-2 border-primary-500/40 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">🪖</span>
                  Before You Bat — Pre-Innings Checklist
                </h3>
                <p className="text-sm text-gray-400 mb-4">Run through this in the dugout while padding up + walking out. Five focused minutes.</p>

                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-2">From the dugout (last 2-3 overs before you go in)</p>
                <ul className="space-y-2 text-gray-300 mb-5">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">①</span><span><strong className="text-white">Watch the bowlers.</strong> Pace, action, lengths, run-up rhythm. Are they swinging it? Where is the ball pitching most?</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">②</span><span><strong className="text-white">Read the pitch.</strong> Bouncing high or staying low? Carrying or stopping? Watch how current batters are reacting.</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">③</span><span><strong className="text-white">Map the field.</strong> Where are the gaps right now? Cover open? Square leg vacant? Long-on deep or up?</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">④</span><span><strong className="text-white">Match situation.</strong> Powerplay or middle? Wickets in hand? Required run rate? Pick a tempo.</span></li>
                </ul>

                <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-2">At the crease (before facing your first ball)</p>
                <ul className="space-y-2 text-gray-300 mb-5">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">⑤</span><span><strong className="text-white">Take guard.</strong> Confirm where your off stump is. Mark your crease.</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">⑥</span><span><strong className="text-white">Set your trigger.</strong> Small forward press or back-and-across. Balanced.</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">⑦</span><span><strong className="text-white">First-ball plan.</strong> Read, don&apos;t react. Defend or leave unless it&apos;s a clear half-volley in the V.</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">⑧</span><span><strong className="text-white">Mental cue.</strong> Say it: &ldquo;present, reactive, find the gap.&rdquo;</span></li>
                </ul>

                <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/30">
                  <p className="text-sm text-accent-300 font-bold mb-1">⭐ The 4 things you must remember</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>1. <strong className="text-white">Watch line + length first</strong> — then choose the shot</li>
                    <li>2. <strong className="text-white">Stay reactive</strong> — no pre-planned shots</li>
                    <li>3. <strong className="text-white">Find gaps, not fielders</strong> — focus = direction</li>
                    <li>4. <strong className="text-white">Count every run</strong> — keeps you in the present</li>
                  </ul>
                </div>
              </div>

              {/* 1. Shot Selection — Length First, Then Line */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Shot Selection — Length First, Then Line
                </h3>
                <p className="text-sm text-primary-400 font-semibold mb-2">Length decides first:</p>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Full</strong> → drive (straight or cover)</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Good length</strong> → defend or play late</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Short</strong> → back foot (cut, pull)</span></li>
                </ul>
                <p className="text-sm text-primary-400 font-semibold mb-2">Then line:</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Inside off / leg → play within the <strong className="text-white">V</strong> (mid-on to mid-off)</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Outside off → <strong className="text-white">square drive / cover / late cut</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Outside leg → <strong className="text-white">leg side, square</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Wide outside off (5th stump) → <strong className="text-white">don&apos;t chase</strong> — guide or leave</span></li>
                </ul>
                <div className="mt-4 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                  <p className="text-sm text-accent-300 font-semibold mb-1">⚠️ When the field is packed</p>
                  <p className="text-sm text-gray-300">Don&apos;t hit into traffic. Identify the gaps and adjust your scoring zones.</p>
                </div>

                <div className="mt-3 p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                  <p className="text-sm text-accent-300 font-bold mb-2">✅ Takeaway</p>
                  <p className="text-sm text-gray-200">Length first, then line. Full → drive · Good → defend/late · Short → cut/pull. Outside off-stump width = guide or leave, never chase.</p>
                </div>
              </div>

              {/* Stay Reactive — No Pre-Planned Shots */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧘</span>
                  Stay Reactive — No Pre-Planned Shots
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  The biggest cause of wrong shots is deciding what you&apos;d play <em>before</em> the ball arrived. Pre-planning a pull or a drive commits you to a shot for a delivery that hasn&apos;t happened yet — and when the ball doesn&apos;t match, you play the wrong shot for the wrong line.
                </p>
                <p className="text-sm text-primary-400 font-semibold mb-2">The rule:</p>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Watch line, length, pace — <strong className="text-white">then</strong> respond</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Your job at the crease is to <strong className="text-white">receive</strong>, not predict</span></li>
                </ul>

                <p className="text-sm text-primary-400 font-semibold mt-5 mb-2">Count every run — stay in the present:</p>
                <p className="text-sm text-gray-300 mb-3">
                  Don&apos;t bat by <em>calculating runs needed</em> — that&apos;s pre-planning by another name. But great batters always know their score ball-by-ball. Ask any of them after any over and they can tell you: <em>&ldquo;27 off 19&rdquo;</em>. Not because they&apos;re chasing a number, but because counting every run keeps the mind in the present.
                </p>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Counting eliminates the <strong className="text-white">drift overs</strong> — those four overs where you scored 3 and didn&apos;t notice</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>It removes panic — you <strong className="text-white">know</strong> where you stand, you don&apos;t guess</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>You can&apos;t count and pre-plan at the same time — arithmetic anchors the mind to <em>what just happened</em></span></li>
                </ul>

                <p className="text-sm text-primary-400 font-semibold mt-5 mb-2">Look for gaps, not fielders:</p>
                <p className="text-sm text-gray-300 mb-3">
                  Where you focus determines where the ball goes. <em>&ldquo;Don&apos;t play to mid-off&rdquo;</em> still aims your bat at mid-off — the brain processes the <strong className="text-white">object</strong>, not the negation.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Find the gap — <strong className="text-white">hit the gap</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Fielders are coordinates; gaps are the target</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Scan gaps in the 1-second window between deliveries — not faces of fielders</span></li>
                </ul>

                <div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                  <p className="text-sm text-primary-300 font-semibold mb-1">🧠 The unified principle</p>
                  <p className="text-sm text-gray-300">Reactive batting + present-moment counting + gap vision — all three are facets of the same skill: <strong className="text-white">stay in this ball</strong>. Every distraction is a future you haven&apos;t played yet.</p>
                </div>
              </div>

              {/* Strike Rotation — Four Habits */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏃</span>
                  Strike Rotation — Turning Ones Into Twos
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Strike rotation is the cheapest source of runs in cricket — and the place where average batters and good ones diverge most. The good ones rotate <strong className="text-white">70-80% of balls they don&apos;t boundary</strong>. Four habits get you there.
                </p>

                <div className="space-y-4">
                  {/* Habit 1 — Play on merit */}
                  <div className="rounded-lg bg-white/3 border border-white/5 p-4">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">Habit 1 — Play on merit, even on pre-meditative movement</p>
                    <p className="text-sm text-gray-300">
                      If you trigger forward or move early expecting a length, you still have to play the ball that <em>actually arrives</em> — not the one you predicted. Pre-meditation is fine; pre-commitment is not. The bat answers to the ball, not the plan.
                    </p>
                  </div>

                  {/* Habit 2 — Look for gaps */}
                  <div className="rounded-lg bg-white/3 border border-white/5 p-4">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">Habit 2 — Look for gaps, not field placement</p>
                    <p className="text-sm text-gray-300">
                      Reading the field by where the <strong className="text-white">fielders</strong> are wastes attention. Read it by where the <strong className="text-white">gaps</strong> are instead. Same field, different focus — gap vision turns dot balls into singles because your bat aims at the empty space, not at the fielder you&apos;re trying to avoid.
                    </p>
                  </div>

                  {/* Habit 3 — Watch the ball after contact */}
                  <div className="rounded-lg bg-white/3 border border-white/5 p-4">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">Habit 3 — Watch the ball immediately after you hit it</p>
                    <p className="text-sm text-gray-300 mb-2">
                      Even on a defensive shot. The moment ball meets bat, your eyes pick up the ball&apos;s direction, speed, and whose hands are coming. That&apos;s how you make a fast, accurate <em>&ldquo;yes&rdquo; / &ldquo;no&rdquo; / &ldquo;wait&rdquo;</em> call.
                    </p>
                    <p className="text-sm text-gray-400 italic">
                      Most missed singles come from batters who look at the bat or the ground after contact and have to find the ball again — by then the fielder is already on it.
                    </p>
                  </div>

                  {/* Habit 4 — Head facing the fielder while running */}
                  <div className="rounded-lg bg-white/3 border border-white/5 p-4">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">Habit 4 — Head faces the fielder catching the ball</p>
                    <p className="text-sm text-gray-300 mb-2">
                      While running between wickets, your head should be turned toward the fielder collecting the ball — never tucked down watching your feet. That lets you:
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1 ml-3">
                      <li>· See the throw early and dive / glide accordingly</li>
                      <li>· Re-call mid-run if the fielder fumbles or rifles a return</li>
                      <li>· Spot the chance for a second run while the throw is still in the air</li>
                    </ul>
                    <p className="text-sm text-amber-300/80 italic mt-2">
                      Looking forward only sees what&apos;s already decided. Looking at the fielder reads what&apos;s about to happen.
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                  <p className="text-sm text-primary-300 font-bold mb-1">✅ Takeaway</p>
                  <p className="text-sm text-gray-200">
                    Strike rotation isn&apos;t about hitting boundaries on more balls. It&apos;s four habits stacked: <strong className="text-white">play the ball that arrives, look for gaps, watch the ball after contact, run with your head on the fielder</strong>. Drill these in nets and every over you bat becomes one or two singles richer.
                  </p>
                </div>
              </div>

              {/* ── Simon Keen's 10 Golden Rules ──────────────────────── */}
              <div className="rounded-2xl p-6 border-2 border-accent-500/40 bg-gradient-to-br from-accent-500/10 via-primary-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">📜</span>
                  Simon Keen&apos;s 10 Golden Rules
                </h3>
                <p className="text-sm text-gray-400 mb-4">Universal batting principles that repeat across every shot. Memorise these — they collapse hundreds of pages of coaching into ten directives.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { n: 1, rule: 'Keep heels off the ground.' },
                    { n: 2, rule: 'Head leads movement.' },
                    { n: 3, rule: 'Stay side-on.' },
                    { n: 4, rule: 'Read length early.' },
                    { n: 5, rule: 'Match swing plane to bounce.' },
                    { n: 6, rule: 'Don\'t roll wrists.' },
                    { n: 7, rule: 'Use spin and pace — don\'t fight them.' },
                    { n: 8, rule: 'Have scoring options all around the ground.' },
                    { n: 9, rule: 'If it\'s not hitting stumps and you\'re not scoring, leave it.' },
                    { n: 10, rule: 'The best position to defend is usually the best position to attack.' },
                  ].map((r) => (
                    <div key={r.n} className="rounded-lg bg-white/3 border border-white/5 p-3 flex items-start gap-3">
                      <span className="text-accent-400 font-bold text-lg flex-shrink-0">#{r.n}</span>
                      <p className="text-sm text-gray-200 leading-snug">{r.rule}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-accent-500/15 border border-accent-500/40">
                  <p className="text-sm text-accent-300 font-bold">⭐ The Golden Cue (collapses all 10)</p>
                  <p className="text-sm text-gray-100 italic mt-1">&ldquo;Head first. Balance second. Bat third. Timing fourth. Power last.&rdquo;</p>
                </div>
              </div>

              {/* ── Decision-Making Framework ─────────────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌳</span>
                  Decision Framework — Length → Width → Bounce → Spin
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Pick the shot in this order. Length first; everything else is layered on. If you flip the order, you commit to a shot before you know what the ball is doing.
                </p>

                {/* Length */}
                <div className="mb-4">
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">1. Length</p>
                  <ul className="text-sm text-gray-200 space-y-1.5">
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Full / yorker</strong> → drive (straight / on / off)</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Good length</strong> → defend or play late; rotate strike</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Slightly short / back-of-length</strong> → back-foot drive / punch</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Short</strong> → pull / cut</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Above shoulder height</strong> → leave / duck / sway</span></li>
                  </ul>
                </div>

                {/* Width */}
                <div className="mb-4">
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">2. Width / Line</p>
                  <ul className="text-sm text-gray-200 space-y-1.5">
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Stumps line</strong> → V (mid-on to mid-off)</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Outside off, angling across</strong> → cut / square drive</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Outside off, angling in</strong> → pull / drive / leave</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">5th stump line</strong> → leave (unless full enough to drive cleanly)</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Pads / hip line</strong> → flick / clip / sweep (vs spin)</span></li>
                  </ul>
                </div>

                {/* Spin direction */}
                <div className="mb-4">
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">3. Spin Direction</p>
                  <ul className="text-sm text-gray-200 space-y-1.5">
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Ball spinning away</strong> → cut / square drive (with the spin)</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Ball spinning in</strong> → flick / sweep / on-drive (with the spin)</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Don&apos;t fight the spin</strong> — go where the ball wants to go</span></li>
                  </ul>
                </div>

                {/* Bounce */}
                <div className="mb-4">
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">4. Bounce</p>
                  <ul className="text-sm text-gray-200 space-y-1.5">
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Low bounce</strong> → stay low, flatten swing plane, hit along the ground</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Hip-height</strong> → ideal scoring zone for pull / drive</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Higher bounce</strong> → upper cut / hang back / leave</span></li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/30">
                  <p className="text-sm text-primary-300 font-bold mb-1">✅ Decision in one line</p>
                  <p className="text-sm text-gray-200">Length tells you <em>front foot or back</em>. Width tells you <em>which side of the ground</em>. Spin direction tells you <em>which way to go with it</em>. Bounce tells you <em>how high the bat finishes</em>. Layer them in that order.</p>
                </div>
              </div>

              {/* ── Playing Spin Quick Reference ──────────────────────── */}
              <div className="rounded-2xl p-6 border-2 border-primary-500/40 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">🌀</span>
                  Playing Spin — Quick Reference
                </h3>
                <p className="text-sm text-gray-400 mb-5">Six modes for facing spin. Pick one per ball based on length, turn direction, and field. Full deep-dive coming to Shot Mechanics.</p>

                {/* Grip + setup */}
                <div className="mb-4 rounded-lg bg-white/3 border border-white/5 p-4">
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">Grip &amp; Setup vs Spin</p>
                  <ul className="text-sm text-gray-200 space-y-1.5">
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Lower stance</strong> than against pace; knees flexed, athletic, balanced</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Strong front-foot press</strong> at the trigger; front shoulder dips</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">High handle = power</strong>; <strong className="text-white">low handle = control</strong> — choose by intent</span></li>
                    <li className="flex gap-2"><span className="text-primary-400 flex-shrink-0">→</span><span><strong className="text-white">Rotated wrist grip</strong> (bottom hand slightly under) opens up the flick</span></li>
                  </ul>
                  <p className="text-xs text-accent-300/80 italic mt-2">Cue: &ldquo;Low stance. Shoulder down. Press forward. Read length.&rdquo;</p>
                </div>

                {/* Front foot to spin */}
                <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4">
                  <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">↗️ Front Foot to Spin — Smother</p>
                  <p className="text-sm text-gray-200 mb-2"><strong className="text-white">Purpose:</strong> reach the pitch of the ball; smother spin before it can grip.</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>· Big positive stride to the pitch</li>
                    <li>· Head over the ball</li>
                    <li>· Front shoulder stays down</li>
                    <li>· Options: drive · lofted drive · sweep · reverse sweep</li>
                  </ul>
                  <p className="text-xs text-emerald-300/80 italic mt-2">Cue: &ldquo;Get to the pitch. Stay low. Head over ball.&rdquo;</p>
                </div>

                {/* Back foot to spin */}
                <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
                  <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">↙️ Back Foot to Spin — Create Time</p>
                  <p className="text-sm text-gray-200 mb-2"><strong className="text-white">Purpose:</strong> create extra time; turn good length into short length.</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>· Move deep into the crease</li>
                    <li>· Stay low and athletic</li>
                    <li>· Easier to cut, pull, or defend with composure</li>
                  </ul>
                  <p className="text-xs text-amber-300/80 italic mt-2">Cue: &ldquo;Deep in crease. Low body. Extra time.&rdquo;</p>
                </div>

                {/* Check swing */}
                <div className="mb-4 rounded-lg bg-white/3 border border-white/10 p-4">
                  <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">🎯 Check Swing — Placement over Power</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>· Maintain shape; compact finish</li>
                    <li>· Hit gaps, not boundaries</li>
                    <li>· Better balance · better rotation · lower risk</li>
                  </ul>
                  <p className="text-xs text-primary-300/80 italic mt-2">Cue: &ldquo;Placement beats power.&rdquo;</p>
                </div>

                {/* Using the pace */}
                <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">⚡ Using the Pace — Guide, Don&apos;t Hit</p>
                  <p className="text-sm text-gray-200 mb-2"><strong className="text-white">For quicker spin (off-spin / arm ball / quick leggie):</strong></p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>· <strong className="text-white">Lap sweep</strong> — minimal swing, use pace</li>
                    <li>· <strong className="text-white">Glide</strong> to third man</li>
                    <li>· <strong className="text-white">Ramp</strong> — redirect pace over keeper</li>
                    <li>· <strong className="text-white">Check first:</strong> 45° (short fine leg) · slip · fine leg</li>
                  </ul>
                  <p className="text-xs text-blue-300/80 italic mt-2">Cue: &ldquo;Guide it. Don&apos;t hit it.&rdquo;</p>
                </div>

                {/* Defending */}
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                  <p className="text-red-300 text-xs font-bold uppercase tracking-wider mb-2">🛡️ Defending Spin — Simon&apos;s Strategy</p>
                  <p className="text-sm text-gray-200 mb-2"><strong className="text-white">Move back to force fuller length, then attack the overpitched ball.</strong></p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-red-300/80 text-xs font-bold mb-1">Back-foot defence</p>
                      <ul className="text-xs text-gray-200 space-y-0.5">
                        <li>· Deep in crease</li>
                        <li>· Stay low</li>
                        <li>· Soft hands</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-300/80 text-xs font-bold mb-1">Front-foot defence</p>
                      <ul className="text-xs text-gray-200 space-y-0.5">
                        <li>· Bat slightly in front of pad</li>
                        <li>· Head over ball</li>
                        <li>· Weight forward</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-red-300/80 italic mt-2">Cue: &ldquo;Can I score? If not, defend. If not hitting stumps, leave.&rdquo;</p>
                </div>

                {/* Picking spin */}
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-4">
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">👁️ Picking Spin — Three Phases</p>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-purple-300 font-bold mb-1">Pre-release</p>
                      <p className="text-gray-200">Fingers · wrist · seam · release point</p>
                    </div>
                    <div>
                      <p className="text-purple-300 font-bold mb-1">In flight</p>
                      <p className="text-gray-200">Drift · shape · trajectory</p>
                    </div>
                    <div>
                      <p className="text-purple-300 font-bold mb-1">Off the pitch</p>
                      <p className="text-gray-200">Bounce · turn · pace</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 mt-3"><strong className="text-white">Decision order:</strong> Length → line → spin → commit.</p>
                  <p className="text-xs text-purple-300/80 italic mt-1">Cue: &ldquo;Length first. Spin second.&rdquo;</p>
                </div>
              </div>

              {/* ── Universal Principles Summary ──────────────────────── */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧱</span>
                  Universal Principles — Across Every Shot
                </h3>
                <p className="text-sm text-gray-400 mb-4">If you only remember six things, remember these. They&apos;re the load-bearing walls of every shot in cricket.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">👤 Head Position</p>
                    <ul className="text-sm text-gray-200 space-y-0.5">
                      <li>· Head leads movement</li>
                      <li>· Head toward target</li>
                      <li>· Eyes level</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">⚖️ Balance</p>
                    <ul className="text-sm text-gray-200 space-y-0.5">
                      <li>· Athletic posture</li>
                      <li>· Strong legs</li>
                      <li>· Stable base</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">🦶 Heel Position</p>
                    <ul className="text-sm text-gray-200 space-y-0.5">
                      <li>· Back heel off the ground</li>
                      <li>· Stay on toes</li>
                      <li>· Don&apos;t fall back</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">🏏 Bat Path</p>
                    <ul className="text-sm text-gray-200 space-y-0.5">
                      <li>· Straight bat whenever possible</li>
                      <li>· Match swing plane to bounce</li>
                      <li>· Hit ball flush</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">🎯 Shot Selection</p>
                    <ul className="text-sm text-gray-200 space-y-0.5">
                      <li>· Pull if too high</li>
                      <li>· Cut if wide</li>
                      <li>· Drive if full</li>
                      <li>· Flick if on pads</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-white/3 border border-white/5 p-3">
                    <p className="text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">✨ Finish Position</p>
                    <ul className="text-sm text-gray-200 space-y-0.5">
                      <li>· Hands close to head</li>
                      <li>· Elbows tucked</li>
                      <li>· Balanced finish</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-accent-500/15 border border-accent-500/40">
                  <p className="text-sm text-accent-300 font-bold mb-1">⭐ The Golden Cue</p>
                  <p className="text-sm text-gray-100 italic">&ldquo;Head first. Balance second. Bat third. Timing fourth. Power last.&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-1">Master the 20% of concepts that produce 80% of Simon Keen&apos;s technical model.</p>
                </div>
              </div>

              {/* 2. Stance & Setup */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏏</span>
                  Stance &amp; Setup
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Bat <strong className="text-white">lifted and ready</strong> (not stuck behind)</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Bat tap near your <strong className="text-white">back foot toe</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Stay <strong className="text-white">relaxed and balanced</strong></span></li>
                </ul>
              </div>

              {/* 3. Trigger Movement */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  Trigger Movement
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Small movement as bowler releases — <strong className="text-white">forward press</strong> or <strong className="text-white">back-and-across</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Stay balanced — <strong className="text-white">no falling over</strong></span></li>
                </ul>
              </div>

              {/* 4. Watching the Ball — Soft → Hard → Release */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">👁️</span>
                  Watching the Ball — Three-Phase Focus
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Don&apos;t hard-stare at the bowler from the moment they walk back to their mark — your eyes will be tired by release. Use a <strong className="text-white">graduated focus</strong>: wide → narrow → lock.
                </p>

                <div className="space-y-3">
                  <div className="rounded-xl p-4 bg-blue-500/5 border border-blue-500/20">
                    <p className="text-sm text-blue-300 font-bold mb-1">Phase 1 — SOFT FOCUS <span className="text-gray-500 font-normal">(during run-up)</span></p>
                    <p className="text-sm text-gray-300 mb-2">Wide gaze. Take in the whole bowler — body, arms, run-up, breathing.</p>
                    <ul className="space-y-1.5 text-sm text-gray-300">
                      <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">→</span><span>Read his <strong className="text-white">rhythm</strong> — is it the same as the last delivery, or has something shifted?</span></li>
                      <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">→</span><span>Spot pace changes early — slower-ball telegraph, length-hidden grip change</span></li>
                      <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">→</span><span>Stay <strong className="text-white">relaxed</strong> — no eye fatigue, no pre-tension</span></li>
                    </ul>
                  </div>

                  <div className="rounded-xl p-4 bg-accent-500/5 border border-accent-500/20">
                    <p className="text-sm text-accent-300 font-bold mb-1">Phase 2 — HARD FOCUS <span className="text-gray-500 font-normal">(approaching crease)</span></p>
                    <p className="text-sm text-gray-300 mb-2">Narrow your gaze to the <strong className="text-white">bowling arm and hand</strong>. Right or left arm? Over or round the wicket? High arm or slingy?</p>
                    <ul className="space-y-1.5 text-sm text-gray-300">
                      <li className="flex gap-3"><span className="text-accent-400 font-bold flex-shrink-0">→</span><span>Lock onto the bowler&apos;s <strong className="text-white">arm path</strong></span></li>
                      <li className="flex gap-3"><span className="text-accent-400 font-bold flex-shrink-0">→</span><span>Confirm angle — <strong className="text-white">left of stumps or right</strong>?</span></li>
                      <li className="flex gap-3"><span className="text-accent-400 font-bold flex-shrink-0">→</span><span>Stay <strong className="text-white">still</strong> at the trigger point</span></li>
                    </ul>
                  </div>

                  <div className="rounded-xl p-4 bg-primary-500/5 border border-primary-500/20">
                    <p className="text-sm text-primary-300 font-bold mb-1">Phase 3 — RELEASE POINT <span className="text-gray-500 font-normal">(moment of release)</span></p>
                    <p className="text-sm text-gray-300 mb-2">Eyes <strong className="text-white">lock</strong> onto the ball at the release point. Track from there — not from where it pitches.</p>
                    <ul className="space-y-1.5 text-sm text-gray-300">
                      <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Pick up the ball <strong className="text-white">at release</strong> — gives you 0.4 seconds to read line + length</span></li>
                      <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Track all the way <strong className="text-white">onto the bat</strong> — don&apos;t lift your head before contact</span></li>
                      <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>If you watch the ball onto the bat, you don&apos;t miss-time</span></li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">Why graduated focus works</p>
                  <p className="text-sm text-gray-300">Hard focus the whole time = eye fatigue, mental tightness, slow reactions. Soft → hard → lock keeps the mind <strong className="text-white">fresh and rhythm-aware</strong>. Most batters who get late on the ball have been hard-staring for 30+ seconds.</p>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                  <p className="text-sm text-accent-300 font-bold mb-2">✅ Takeaway</p>
                  <p className="text-sm text-gray-200">Soft focus on bowler&apos;s rhythm → hard focus on bowling hand → lock onto ball at release. Watch onto the bat.</p>
                </div>
              </div>

              {/* 5. Body Position & Contact */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  Body Position &amp; Contact
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Play <strong className="text-white">close to the body</strong> when possible</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Reduce the <strong className="text-white">bat-pad gap</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Play <strong className="text-white">under your head</strong> for control</span></li>
                </ul>
              </div>

              {/* 6. Defense & Soft Hands */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧱</span>
                  Defense &amp; Soft Hands
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Use <strong className="text-white">soft hands</strong> outside off</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Drop the ball into gaps</strong> for singles</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Front foot: <strong className="text-white">head over ball</strong>, full face</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Back foot: <strong className="text-white">stay tall</strong>, play late</span></li>
                </ul>
              </div>

              {/* 7. Strike Rotation */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  Strike Rotation
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Look for <strong className="text-white">singles every over</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Use soft hands to <strong className="text-white">drop and run</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Don&apos;t get stuck</strong></span></li>
                </ul>
                <div className="mt-4 p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                  <p className="text-sm text-accent-300 font-bold mb-2">✅ Takeaway</p>
                  <p className="text-sm text-gray-200">A single off the third ball every over keeps the scoreboard moving and the bowler off-rhythm. Dot balls compound — break the cycle.</p>
                </div>
              </div>

              {/* 8. Decision-Making — Every Ball */}
              <div className="glass rounded-2xl p-6 border-2 border-accent-500/30 bg-gradient-to-r from-accent-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  Decision-Making (Every Ball)
                </h3>
                <ol className="space-y-3 text-gray-300 list-decimal list-inside">
                  <li><strong className="text-white">Can I attack cleanly?</strong> → Yes → Attack</li>
                  <li>No → <strong className="text-white">Can I rotate strike?</strong> → Yes → Single</li>
                  <li>No → <strong className="text-white">Defend safely</strong></li>
                  <li>Only avoid / leave if <strong className="text-white">no safe option</strong> exists</li>
                </ol>
                <div className="mt-4 p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                  <p className="text-sm text-accent-300 font-bold mb-2">✅ Takeaway</p>
                  <p className="text-sm text-gray-200">Attack → Rotate → Defend → Leave. In that order, every ball. The mistake is jumping to attack when rotation was on, or defending when a single was free.</p>
                </div>
              </div>

              {/* 9. Powerplay Approach */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Powerplay Approach
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>First <strong className="text-white">6–10 balls</strong>: assess + low-risk scoring</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Don&apos;t rush</strong> — read the pitch and the bowler</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>After settling: <strong className="text-white">expand scoring</strong>, use the gaps, punish the bad balls</span></li>
                </ul>
              </div>

              {/* 10. Off-Stump Awareness */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧭</span>
                  Off-Stump Awareness
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Always know <strong className="text-white">where your off stump is</strong></span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Helps with judging line and shot selection</span></li>
                </ul>
              </div>

              {/* 11. Back Foot Play */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Back Foot Play
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span>Go <strong className="text-white">back quickly</strong> for short balls</span></li>
                  <li className="flex gap-3"><span className="text-primary-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Cut for width</strong>, pull only when in control</span></li>
                </ul>
              </div>

              {/* 12. Against Left-Arm Spin */}
              <div className="glass rounded-2xl p-6 border-2 border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌀</span>
                  Against Left-Arm Spin
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-red-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Don&apos;t throw your front leg away</strong></span></li>
                  <li className="flex gap-3"><span className="text-red-400 font-bold flex-shrink-0">→</span><span>Play <strong className="text-white">under your head</strong></span></li>
                  <li className="flex gap-3"><span className="text-red-400 font-bold flex-shrink-0">→</span><span>Stay <strong className="text-white">balanced and patient</strong></span></li>
                </ul>
              </div>

              {/* 13. Mental Routine */}
              <div className="glass rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧘</span>
                  Mental Routine
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Reset after every ball</strong> — look away, refocus</span></li>
                  <li className="flex gap-3"><span className="text-blue-400 font-bold flex-shrink-0">→</span><span>Stay present — <strong className="text-white">one ball at a time</strong></span></li>
                </ul>
              </div>

              {/* 14. Innings Stability Rules — Do Not Break */}
              <div className="glass rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-r from-purple-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  Innings Stability Rules — Do Not Break
                </h3>
                <p className="text-xs uppercase tracking-wider text-purple-300 font-semibold mb-4">Mid-innings protection — your system is your anchor</p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-purple-300 font-bold flex-shrink-0">→</span><span>If something is working (timing, trigger, balance) — <strong className="text-white">DO NOT change it</strong> mid-innings</span></li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span>Always keep a <strong className="text-white">trigger movement</strong></span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Can adjust size (smaller / larger)</li>
                        <li>• Never go completely static</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span>Don&apos;t suddenly switch intent (defensive ↔ aggressive)</span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Build gradually, not abruptly</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span><strong className="text-white">Trust your initial read</strong> of the pitch and conditions</span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Don&apos;t second-guess after a few balls</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span>If you misjudge length once — <strong className="text-white">reset, don&apos;t overcorrect</strong></span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Next ball: watch harder, move earlier</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span>Stay in <strong className="text-white">rhythm</strong></span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Movement → decision → shot</li>
                        <li>• Don&apos;t freeze at the crease</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span>If confused, <strong className="text-white">default to</strong>:</span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Balanced trigger</li>
                        <li>• Play late</li>
                        <li>• Straight bat</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-300 font-bold flex-shrink-0">→</span>
                    <div>
                      <span>Between balls:</span>
                      <ul className="mt-1 ml-4 text-sm space-y-1">
                        <li>• Reset mentally (look away, refocus)</li>
                        <li>• Recommit to your basics</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3"><span className="text-purple-300 font-bold flex-shrink-0">→</span><span>Your <strong className="text-white">system is your anchor</strong> under pressure — stick to it unless there&apos;s a clear reason to adjust</span></li>
                </ul>
                <div className="mt-5 p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                  <p className="text-sm font-bold text-accent-300 mb-1">⭐ Golden Rule</p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>→ <strong className="text-white">Small adjustments</strong> are allowed</li>
                    <li>→ <strong className="text-white">Big changes mid-innings</strong> = high risk of dismissal</li>
                  </ul>
                </div>
              </div>

              {/* 15. Head Still, Hip Open — Don't Chase */}
              <div className="glass rounded-2xl p-6 border-2 border-red-500/40 bg-gradient-to-r from-red-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">🦵</span>
                  Head Still, Hip Open — Don&apos;t Chase
                </h3>
                <p className="text-xs uppercase tracking-wider text-red-300 font-semibold mb-4">Footwork + head alignment — the trigger that tells you what to leave</p>

                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">The setup</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-3"><span className="text-red-300 font-bold flex-shrink-0">→</span><span><strong className="text-white">Front foot toe</strong> — slightly open (not pointed straight down the pitch, not collapsed across)</span></li>
                    <li className="flex gap-3"><span className="text-red-300 font-bold flex-shrink-0">→</span><span><strong className="text-white">Back foot</strong> — parallel to the crease</span></li>
                    <li className="flex gap-3"><span className="text-red-300 font-bold flex-shrink-0">→</span><span><strong className="text-white">Front hip</strong> — locked open, pointing slightly outside</span></li>
                    <li className="flex gap-3"><span className="text-red-300 font-bold flex-shrink-0">→</span><span><strong className="text-white">Head</strong> — in line with the bowler, eyes level, completely still</span></li>
                  </ul>
                </div>

                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Why this matters</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-3"><span className="text-red-300 font-bold flex-shrink-0">→</span><span>Open hip + straight front foot = your body stays <strong className="text-white">side-on and balanced</strong>. From here you can play, defend, or leave with the same setup.</span></li>
                    <li className="flex gap-3"><span className="text-red-300 font-bold flex-shrink-0">→</span><span>A still head is a <strong className="text-white">measuring stick</strong> — it lets you judge line. Anything outside your eye-line is a leave; anything inside is a play.</span></li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-bold text-red-300 mb-2">⚠️ The fatal mistake</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white">If your head falls, you will chase.</strong> Head dropping toward the off side pulls your eyes off the line, opens the bat face, and commits you to a delivery you should have left. Every nick to the keeper starts with a head that fell.
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed mt-2">
                    Keep the head up. Keep the hip open. Keep the front foot straight. Let the ball come — then decide.
                  </p>
                </div>
              </div>

              {/* 16. Above All */}
              <div className="glass rounded-2xl p-6 border-2 border-primary-500/30 bg-gradient-to-r from-primary-500/5 to-transparent">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  Above All
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex gap-3"><span className="text-accent-400 font-bold flex-shrink-0">→</span><span>Head moves <strong className="text-white">towards the line of the ball</strong> and stays balanced</span></li>
                  <li className="flex gap-3"><span className="text-accent-400 font-bold flex-shrink-0">→</span><span>If you can&apos;t score big, <strong className="text-white">score safely or rotate strike</strong></span></li>
                  <li className="flex gap-3"><span className="text-accent-400 font-bold flex-shrink-0">→</span><span><strong className="text-white">Selective aggression wins T20</strong> — not reckless hitting</span></li>
                </ul>
              </div>

              {/* THE FINAL 4 — closing summary, what to recall when the bowler runs in */}
              <div className="rounded-2xl p-6 border-2 border-accent-500/50 bg-gradient-to-br from-accent-500/15 via-primary-500/10 to-transparent shadow-xl shadow-accent-500/10">
                <div className="text-center mb-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-accent-300 font-bold mb-1">When the bowler runs in</p>
                  <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <span>💎</span> The Final 4 <span>💎</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">If you remember nothing else — remember these.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-accent-500/20">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-500/30 text-accent-300 font-bold flex items-center justify-center text-sm">1</span>
                    <div>
                      <p className="text-white font-bold text-sm">Eyes wide. Don&apos;t blink.</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="text-blue-300 font-semibold">Soft focus</span> on the bowler&apos;s run-up &amp; rhythm
                        <span className="text-gray-600"> → </span>
                        <span className="text-accent-300 font-semibold">hard focus</span> on the bowling hand
                        <span className="text-gray-600"> → </span>
                        <span className="text-primary-300 font-semibold">lock</span> at the release point.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-accent-500/20">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-500/30 text-accent-300 font-bold flex items-center justify-center text-sm">2</span>
                    <div>
                      <p className="text-white font-bold text-sm">Bat still.</p>
                      <p className="text-xs text-gray-400">No early backswing. Stillness lets you react late.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-accent-500/20">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-500/30 text-accent-300 font-bold flex items-center justify-center text-sm">3</span>
                    <div>
                      <p className="text-white font-bold text-sm">Adjust head to the bowler&apos;s release height — and keep it still.</p>
                      <p className="text-xs text-gray-400">Tall bowler = head higher. Slingy / low arm = head lower. Lock it once set.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-accent-500/20">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-500/30 text-accent-300 font-bold flex items-center justify-center text-sm">4</span>
                    <div>
                      <p className="text-white font-bold text-sm">The release point is the main event.</p>
                      <p className="text-xs text-gray-400">Everything else (run-up, rhythm, action) is build-up. Lock onto the release point — that&apos;s where the ball becomes real.</p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-5">
                  read this last · before you walk to the crease
                </p>
              </div>

              {/* CTA back to reflection */}
              <div className="text-center pt-4">
                <button
                  onClick={() => { setEditingId(null); setView('new'); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Reflect on Today&apos;s Innings
                </button>
              </div>
            </div>
          )}

          {/* TRAINING VIEW */}
          {view === 'training' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Training <span className="gradient-text">Programs</span></h2>
                <p className="text-gray-500 text-sm">Structured drills with free YouTube coaching videos</p>
              </div>

              {/* Program Cards */}
              {TRAINING_PROGRAMS.map(prog => {
                const isExpanded = expandedProgram === prog.id;
                const colorMap: Record<string, string> = { primary: 'primary', accent: 'accent', red: 'red', blue: 'blue' };
                const c = colorMap[prog.color] || 'primary';
                return (
                  <div key={prog.id} className={`glass rounded-2xl border transition-all ${isExpanded ? `border-${c}-500/50` : 'border-white/10'}`}>
                    <button onClick={() => { setExpandedProgram(isExpanded ? null : prog.id); setExpandedSession(null); }} className="w-full text-left p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{prog.icon}</span>
                          <div>
                            <h3 className="text-lg font-bold text-white">{prog.title}</h3>
                            <p className="text-gray-500 text-xs">{prog.period}</p>
                          </div>
                        </div>
                        <span className="text-gray-500 text-lg">{isExpanded ? '−' : '+'}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{prog.description}</p>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-4">
                        {/* Key Cue */}
                        {prog.keyCue && (
                          <div className="glass rounded-xl p-4 border-2 border-red-500/30 bg-gradient-to-r from-red-500/5 to-accent-500/5">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Key Execution Cue</p>
                            <p className="text-base md:text-lg font-bold text-white mb-2">{prog.keyCue.headline}</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{prog.keyCue.explanation}</p>
                          </div>
                        )}

                        {/* Intro Videos */}
                        {prog.introVideos.length > 0 && (
                          <div>
                            <p className="text-white text-sm font-bold mb-2">Watch Before Starting:</p>
                            <div className="space-y-2">
                              {prog.introVideos.map((v, vi) => (
                                <a key={vi} href={v.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 glass rounded-xl p-3 border border-white/10 hover:border-primary-500/30 transition-all">
                                  <span className="text-xl">▶️</span>
                                  <span className="text-white text-sm">{v.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sessions */}
                        <div className="space-y-2">
                          {prog.sessions.map((sess, si) => {
                            const sessKey = `${prog.id}-${si}`;
                            const sessExpanded = expandedSession === sessKey;
                            return (
                              <div key={si} className="glass rounded-xl border border-white/10">
                                <button onClick={() => setExpandedSession(sessExpanded ? null : sessKey)} className="w-full text-left px-4 py-3 flex items-center justify-between">
                                  <div>
                                    <span className={`text-${c}-400 font-bold text-sm`}>{sess.title}</span>
                                    <p className="text-gray-500 text-xs mt-0.5">{sess.description}</p>
                                  </div>
                                  <span className="text-gray-500 text-sm">{sessExpanded ? '−' : '+'}</span>
                                </button>

                                {sessExpanded && (
                                  <div className="px-4 pb-4 space-y-1.5">
                                    {sess.drills.map((drill, di) => (
                                      <div key={di} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 text-sm">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          {drill.video ? (
                                            <a href={drill.video} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 shrink-0">▶</a>
                                          ) : (
                                            <span className="text-gray-600 shrink-0">•</span>
                                          )}
                                          <span className="text-white text-xs truncate">{drill.name}</span>
                                        </div>
                                        <span className="text-gray-500 text-xs shrink-0 ml-2">{drill.reps}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Extra Videos */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Additional Training Videos</h3>
                <div className="space-y-3">
                  {EXTRA_VIDEOS.map((v, i) => (
                    <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 glass rounded-xl p-4 border border-white/10 hover:border-primary-500/30 transition-all">
                      <span className="text-2xl shrink-0">▶️</span>
                      <div>
                        <span className="text-white font-bold text-sm">{v.title}</span>
                        <p className="text-gray-500 text-xs mt-1">{v.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Mental Game PDF Reference */}
              <div className="glass rounded-2xl p-6 border border-accent-500/20">
                <h3 className="text-lg font-bold text-white mb-2">Mental Preparation Guide</h3>
                <p className="text-gray-400 text-sm mb-3">Mastering the Mind — visualization, goal setting, breathing techniques, resilience, and managing fear of failure.</p>
                <a href="/mental-game" className="inline-block px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 text-sm font-medium hover:bg-accent-500/30 transition-all">
                  Read Mental Game Guide
                </a>
              </div>

              {/* Credits */}
              <p className="text-center text-gray-600 text-xs">Curated training drills with free YouTube coaching videos</p>
            </div>
          )}

          {/* SHOT PLANNER VIEW */}
          {view === 'planner' && (
            <div className="space-y-6">
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400">&larr; Back to reflections</button>

              {/* Wagon Wheel */}
              <div className="glass rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">My Wagon Wheel</h3>
                    <p className="text-gray-500 text-xs">Tap a zone to see shots that go there</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {plannerSaving && <span className="text-accent-400 text-xs">Saving...</span>}
                    <button onClick={() => setWagonLHB(!wagonLHB)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${wagonLHB ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                      {wagonLHB ? 'LHB' : 'RHB'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <svg viewBox="0 0 200 200" className="w-64 h-64 sm:w-72 sm:h-72">
                    {/* Field circle */}
                    <circle cx="100" cy="100" r="95" fill="#0d3318" stroke="#3d8b4f" strokeWidth="1" />
                    <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.2" />
                    {/* Pitch */}
                    <rect x="96" y="60" width="8" height="60" rx="1" fill="#c4a265" opacity="0.4" />
                    {/* Stumps — batting end (top) */}
                    <rect x="97.5" y="68" width="5" height="3" rx="0.5" fill="white" opacity="0.5" />
                    {/* Stumps — bowling end (bottom) */}
                    <rect x="97.5" y="110" width="5" height="3" rx="0.5" fill="white" opacity="0.5" />
                    {/* Batter marker (top — batting end) */}
                    <circle cx="100" cy="75" r="3" fill="#3b82f6" stroke="#93c5fd" strokeWidth="0.5" />
                    <text x="100" y="65" textAnchor="middle" fill="#93c5fd" fontSize="5" opacity="0.6">Batter</text>
                    {/* Bowler marker (bottom — bowling end) */}
                    <circle cx="100" cy="118" r="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.5" opacity="0.5" />
                    <text x="100" y="128" textAnchor="middle" fill="#fca5a5" fontSize="5" opacity="0.4">Bowler</text>
                    {/* Region segments */}
                    {WAGON_REGIONS.map(r => {
                      // LHB mirrors horizontally: reflect angle across vertical axis
                      const rawAngle = wagonLHB ? (180 - r.angle) : r.angle;
                      const angleRad = rawAngle * Math.PI / 180;
                      const halfSector = (360 / 8 / 2) * Math.PI / 180;
                      const innerR = 20;
                      const outerR = 90;
                      const x1 = 100 + Math.cos(angleRad - halfSector) * outerR;
                      const y1 = 100 + Math.sin(angleRad - halfSector) * outerR;
                      const x2 = 100 + Math.cos(angleRad + halfSector) * outerR;
                      const y2 = 100 + Math.sin(angleRad + halfSector) * outerR;
                      const x3 = 100 + Math.cos(angleRad + halfSector) * innerR;
                      const y3 = 100 + Math.sin(angleRad + halfSector) * innerR;
                      const x4 = 100 + Math.cos(angleRad - halfSector) * innerR;
                      const y4 = 100 + Math.sin(angleRad - halfSector) * innerR;

                      const shotsInRegion = CRICKET_SHOTS.filter(s => s.region === r.id);
                      const strongCount = shotsInRegion.filter(s => shotPlan.shotConfidence[s.name] === 'strong').length;
                      const avoidCount = shotsInRegion.filter(s => shotPlan.shotConfidence[s.name] === 'avoid').length;
                      const fillColor = selectedRegion === r.id ? 'rgba(59,130,246,0.4)' : strongCount > 0 ? `rgba(16,185,129,${0.15 + strongCount * 0.1})` : avoidCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)';

                      const labelR = 65;
                      const lx = 100 + Math.cos(angleRad) * labelR;
                      const ly = 100 + Math.sin(angleRad) * labelR;

                      return (
                        <g key={r.id} onClick={() => setSelectedRegion(selectedRegion === r.id ? null : r.id)} className="cursor-pointer">
                          <path
                            d={`M${x4},${y4} L${x1},${y1} A${outerR},${outerR} 0 0,1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 0,0 ${x4},${y4}`}
                            fill={fillColor}
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="0.5"
                          />
                          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill={selectedRegion === r.id ? '#93c5fd' : '#9ca3af'} fontSize="7" fontWeight="bold">
                            {r.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                {/* Side labels */}
                <div className="flex justify-between px-8 mt-1 text-[9px] text-gray-600">
                  <span>{wagonLHB ? 'Leg Side' : 'Off Side'}</span>
                  <span>{wagonLHB ? 'Off Side' : 'Leg Side'}</span>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-2 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-500/40"></span> Strong</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-500/40"></span> Working on</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40"></span> Avoid</span>
                </div>
              </div>

              {/* Shots in selected region */}
              {selectedRegion && (
                <div className="glass rounded-2xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {WAGON_REGIONS.find(r => r.id === selectedRegion)?.label} Shots
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">Tap to rate: Strong → Working on → Avoid</p>
                  <div className="space-y-2">
                    {CRICKET_SHOTS.filter(s => s.region === selectedRegion).map(shot => {
                      const conf = shotPlan.shotConfidence[shot.name];
                      const bg = conf === 'strong' ? 'bg-primary-500/20 border-primary-500/50' : conf === 'working' ? 'bg-accent-500/20 border-accent-500/50' : conf === 'avoid' ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/10';
                      const badge = conf === 'strong' ? 'text-primary-400' : conf === 'working' ? 'text-accent-400' : conf === 'avoid' ? 'text-red-400' : 'text-gray-600';
                      return (
                        <button key={shot.name} onClick={() => toggleShotConfidence(shot.name)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${bg} hover:scale-[1.01]`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-white font-medium text-sm">{shot.name}</span>
                              <span className="text-gray-500 text-xs ml-2">({shot.category.replace('-', ' ')})</span>
                            </div>
                            <span className={`text-xs font-bold uppercase ${badge}`}>{conf || 'Not rated'}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{shot.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All shots by category */}
              {!selectedRegion && (
                <div className="space-y-4">
                  {(['front-foot', 'back-foot', 'unorthodox'] as const).map(cat => (
                    <div key={cat} className="glass rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-1 capitalize">{cat.replace('-', ' ')} Shots</h3>
                      <p className="text-gray-500 text-xs mb-4">Tap to rate: Strong → Working on → Avoid</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CRICKET_SHOTS.filter(s => s.category === cat).map(shot => {
                          const conf = shotPlan.shotConfidence[shot.name];
                          const bg = conf === 'strong' ? 'bg-primary-500/20 border-primary-500/50' : conf === 'working' ? 'bg-accent-500/20 border-accent-500/50' : conf === 'avoid' ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/10';
                          const badge = conf === 'strong' ? 'text-primary-400' : conf === 'working' ? 'text-accent-400' : conf === 'avoid' ? 'text-red-400' : 'text-gray-600';
                          const region = WAGON_REGIONS.find(r => r.id === shot.region);
                          return (
                            <button key={shot.name} onClick={() => toggleShotConfidence(shot.name)}
                              className={`text-left px-4 py-3 rounded-xl border transition-all ${bg} hover:scale-[1.01]`}>
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium text-sm">{shot.name}</span>
                                <span className={`text-[10px] font-bold uppercase ${badge}`}>{conf || '—'}</span>
                              </div>
                              <p className="text-gray-500 text-xs mt-1">{shot.description}</p>
                              {region && shot.region > 0 && <p className="text-gray-600 text-[10px] mt-0.5">→ {region.label}</p>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bowler Game Plan */}
              <div className="glass rounded-2xl p-6 border border-accent-500/20">
                <h3 className="text-lg font-bold text-white mb-1">Game Plan vs Bowler</h3>
                <p className="text-gray-500 text-xs mb-4">Select a bowler type and pick your planned shots</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {BOWLER_TYPES.map(bt => (
                    <button key={bt} onClick={() => setPlannerBowlerType(plannerBowlerType === bt ? '' : bt)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${plannerBowlerType === bt ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                      {bt}
                    </button>
                  ))}
                </div>
                {plannerBowlerType && (
                  <div className="space-y-2">
                    <p className="text-white text-sm font-medium mb-2">My shots vs {plannerBowlerType}:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CRICKET_SHOTS.filter(s => s.region > 0).map(shot => {
                        const isSelected = (shotPlan.bowlerPlans[plannerBowlerType] || []).includes(shot.name);
                        const conf = shotPlan.shotConfidence[shot.name];
                        const confDot = conf === 'strong' ? 'bg-primary-500' : conf === 'working' ? 'bg-accent-500' : conf === 'avoid' ? 'bg-red-500' : 'bg-gray-700';
                        return (
                          <button key={shot.name} onClick={() => toggleBowlerShot(plannerBowlerType, shot.name)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${isSelected ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                            <span className={`w-2 h-2 rounded-full ${confDot}`}></span>
                            {isSelected ? '✓ ' : ''}{shot.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Notes */}
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">Batting Journal</h3>
                <p className="text-gray-500 text-xs mb-2">Your personal notes — straight bat reminders, things to work on</p>
                <textarea
                  value={shotPlan.notes}
                  onChange={e => {
                    const updated = { ...shotPlan, notes: e.target.value };
                    setShotPlan(updated);
                  }}
                  onBlur={() => saveShotPlan(shotPlan)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600 resize-none"
                  placeholder="e.g. Work on playing spin with soft hands. Keep my head still on the pull shot. Against fast bowling, get back and across early..."
                />
              </div>

              {/* Shot Summary */}
              {Object.keys(shotPlan.shotConfidence).length > 0 && (
                <div className="glass rounded-2xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-bold text-white mb-4">My Shot Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary-400">{Object.values(shotPlan.shotConfidence).filter(v => v === 'strong').length}</p>
                      <p className="text-gray-500 text-xs">Strong</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent-400">{Object.values(shotPlan.shotConfidence).filter(v => v === 'working').length}</p>
                      <p className="text-gray-500 text-xs">Working on</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-400">{Object.values(shotPlan.shotConfidence).filter(v => v === 'avoid').length}</p>
                      <p className="text-gray-500 text-xs">Avoid</p>
                    </div>
                  </div>
                  {Object.entries(shotPlan.bowlerPlans).filter(([, shots]) => shots.length > 0).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-bold text-white mb-2">Game Plans Set</h4>
                      {Object.entries(shotPlan.bowlerPlans).filter(([, shots]) => shots.length > 0).map(([bt, shots]) => (
                        <div key={bt} className="mb-2">
                          <span className="text-accent-400 text-xs font-bold">{bt}:</span>
                          <span className="text-gray-400 text-xs ml-2">{shots.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NEW REFLECTION FORM */}
          {view === 'new' && (
            <>
              <button onClick={() => { setEditingId(null); setView('list'); }} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">
                &larr; {editingId ? 'Cancel Edit' : 'Cancel'}
              </button>
              {editingId ? (
                <div className="mb-5 glass rounded-xl p-4 border border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-transparent">
                  <p className="text-xs uppercase tracking-wider text-primary-400 font-bold mb-1">✏️ Editing existing reflection</p>
                  <p className="text-sm text-gray-300">
                    You&apos;re updating a reflection you saved earlier. Original date is preserved
                    — only the &quot;Last saved&quot; timestamp will change.
                  </p>
                </div>
              ) : (
                <div className="mb-5 glass rounded-xl p-4 border border-accent-500/20 bg-gradient-to-r from-accent-500/5 to-transparent">
                  <p className="text-xs uppercase tracking-wider text-accent-400 font-bold mb-1">Before you reflect</p>
                  <p className="text-sm text-gray-300">
                    Review your{' '}
                    <button
                      onClick={() => setView('principles')}
                      className="text-accent-300 hover:text-accent-200 underline font-semibold"
                    >
                      Batting Principles
                    </button>
                    {' '}— shot selection, stance, watching the ball, body position. Self-evaluate against them as you fill out today&apos;s reflection.
                  </p>
                </div>
              )}
              <div className="space-y-5">
                {(() => {
                  // Build the combined option list. Firestore matches
                  // (real recorded matches) sit at the top under their
                  // own group so they're the obvious choice when a
                  // user reflects on a match they just played.
                  // Hardcoded fixtures still listed so users can
                  // pre-write reflections for upcoming/historical
                  // games not yet in Firestore.
                  type Opt = { label: string; index: number; date: string; matchId?: string };
                  const firestoreOpts: Opt[] = firestoreMatches.map((m) => {
                    const opponent = m.team1 === 'Challengers Cricket Club' ? m.team2 :
                                     m.team2 === 'Challengers Cricket Club' ? m.team1 :
                                     m.team2; // fallback
                    const niceDate = m.date
                      ? new Date(m.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
                      : 'unknown date';
                    return {
                      label: `📋 vs ${opponent} (${niceDate})`,
                      index: 98, // counts as practice for filtering
                      date: m.date || '',
                      matchId: m.id,
                    };
                  });
                  const setMatchSelection = (label: string) => {
                    setMatch(label);
                    const fs = firestoreOpts.find((x) => x.label === label);
                    if (fs) {
                      setMatchIndex(fs.index);
                      setMatchId(fs.matchId);
                    } else {
                      const m = MATCHES.find((x) => x.label === label);
                      setMatchIndex(m?.index || 0);
                      setMatchId(undefined);
                    }
                  };
                  return (
                    <div className="glass rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-3">Match</h3>
                      <select
                        value={match}
                        onChange={(e) => setMatchSelection(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm"
                      >
                        <option value="" className="bg-gray-900">Select match...</option>
                        {firestoreOpts.length > 0 && (
                          <option disabled className="bg-gray-900 text-accent-400">── Recently played (recorded) ──</option>
                        )}
                        {firestoreOpts.map((o) => (
                          <option key={o.matchId || o.label} value={o.label} className="bg-gray-900">{o.label}</option>
                        ))}
                        {firestoreOpts.length > 0 && (
                          <option disabled className="bg-gray-900 text-gray-500">── Scheduled fixtures ──</option>
                        )}
                        {MATCHES.filter((m) => isMatchAvailable(m.date)).map((m) => (
                          <option key={m.label} value={m.label} className="bg-gray-900">{m.label}</option>
                        ))}
                        {MATCHES.filter((m) => !isMatchAvailable(m.date)).length > 0 && (
                          <option disabled className="bg-gray-900 text-gray-600">── Upcoming (locked) ──</option>
                        )}
                        {MATCHES.filter((m) => !isMatchAvailable(m.date)).map((m) => (
                          <option key={m.label} disabled className="bg-gray-900 text-gray-600">{m.label}</option>
                        ))}
                      </select>
                      {matchId && (
                        <p className="text-xs text-accent-400 mt-2">
                          ✓ Linked to match scorecard — your stats and dismissal will auto-fill below.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* From the scorecard — auto-pulled from /c3h/scorer when available */}
                {scorerLoading && match && !editingId && (
                  <div className="glass rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-gray-500">Checking scorecard for this match…</p>
                  </div>
                )}
                {scorerStats && !editingId && (
                  <div className="glass rounded-xl p-4 border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-1">📋 From the Scorecard</p>
                        <p className="text-xs text-gray-500">Auto-pulled from C3H Scorer · scored by {scorerStats.scoredBy.split('@')[0]}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="glass rounded-lg p-2.5 text-center border border-white/5">
                        <p className="text-2xl font-bold text-white">{scorerStats.runs}</p>
                        <p className="text-xs text-gray-500">Runs</p>
                      </div>
                      <div className="glass rounded-lg p-2.5 text-center border border-white/5">
                        <p className="text-2xl font-bold text-white">{scorerStats.balls}</p>
                        <p className="text-xs text-gray-500">Balls</p>
                      </div>
                      <div className="glass rounded-lg p-2.5 text-center border border-white/5">
                        <p className="text-2xl font-bold text-accent-400">{scorerStats.fours}</p>
                        <p className="text-xs text-gray-500">Fours</p>
                      </div>
                      <div className="glass rounded-lg p-2.5 text-center border border-white/5">
                        <p className="text-2xl font-bold text-red-400">{scorerStats.sixes}</p>
                        <p className="text-xs text-gray-500">Sixes</p>
                      </div>
                    </div>
                    {scorerStats.isOut ? (
                      <p className="text-xs text-gray-300">
                        <span className="text-gray-500">Dismissal: </span>
                        {scorerStats.howOut}
                        <span className="text-gray-500"> · pre-filled below</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300">
                        <span className="text-gray-500">Status: </span>
                        Not out
                      </p>
                    )}
                  </div>
                )}

                {/* Match Day Check-In */}
                <div className="glass rounded-2xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-bold text-white mb-1">How Were You Feeling?</h3>
                  <p className="text-gray-500 text-xs mb-4">Match day body and mind check</p>
                  <div className="flex gap-3 justify-center mb-4">
                    {[
                      { score: 1, emoji: '😫', label: 'Rough' },
                      { score: 2, emoji: '😐', label: 'Low' },
                      { score: 3, emoji: '🙂', label: 'Okay' },
                      { score: 4, emoji: '💪', label: 'Good' },
                      { score: 5, emoji: '🔥', label: 'Great' },
                    ].map(f => (
                      <button key={f.score} onClick={() => setFeeling(f.score)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${feeling === f.score ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 scale-110' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                        <span className="text-xl">{f.emoji}</span>
                        <span className="text-xs">{f.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mb-2">Body status (select all that apply)</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {BODY_STATUS_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => toggleCheckbox(opt, bodyStatus, setBodyStatus)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${bodyStatus.includes(opt) ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{bodyStatus.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mb-2">Nutrition & hydration</p>
                  <div className="flex flex-wrap gap-2">
                    {NUTRITION_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => toggleCheckbox(opt, nutrition, setNutrition)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${nutrition.includes(opt) ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{nutrition.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">How Did You Get Out?</h3>
                  {matchIndex === 99 && <p className="text-gray-500 text-xs mb-3">Practice session — select all that apply</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {HOW_GOT_OUT_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => {
                        if (matchIndex === 99) {
                          toggleCheckbox(opt, howGotOut, setHowGotOut);
                        } else {
                          setHowGotOut(howGotOut.includes(opt) && howGotOut.length === 1 ? [] : [opt]);
                        }
                      }} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${howGotOut.includes(opt) ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{howGotOut.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-primary-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">What Went Right?</h3>
                  <div className="flex flex-wrap gap-2">
                    {WHAT_WENT_RIGHT_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => toggleCheckbox(opt, whatWentRight, setWhatWentRight)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${whatWentRight.includes(opt) ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{whatWentRight.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">What Went Wrong?</h3>
                  <div className="flex flex-wrap gap-2">
                    {WHAT_WENT_WRONG_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => toggleCheckbox(opt, whatWentWrong, setWhatWentWrong)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${whatWentWrong.includes(opt) ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{whatWentWrong.includes(opt) ? '✓ ' : ''}{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Intent Score</h3>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setIntentScore(n)} className={`w-12 h-12 rounded-xl text-lg font-bold border transition-all ${intentScore === n ? 'bg-accent-500/20 text-accent-400 border-accent-500/50 scale-110' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Froze</span><span>Total clarity</span></div>
                </div>

                <div className="glass rounded-2xl p-6 border border-accent-500/20">
                  <h3 className="text-lg font-bold text-white mb-3">Next Innings Reset Card</h3>
                  <div className="space-y-3">
                    <div><label className="text-gray-400 text-xs block mb-1">Next time I bat, I want to...</label><input type="text" value={nextInningsPlan} onChange={e => setNextInningsPlan(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. Attack spin early" /></div>
                    <div><label className="text-gray-400 text-xs block mb-1">Strength I want to back...</label><input type="text" value={strengthToBuild} onChange={e => setStrengthToBuild(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. My pull shot" /></div>
                    <div><label className="text-gray-400 text-xs block mb-1">If I feel pressure, I will...</label><input type="text" value={pressureResponse} onChange={e => setPressureResponse(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. Breathe, tap bat" /></div>
                    <div><label className="text-gray-400 text-xs block mb-1">My mindset word...</label><input type="text" value={mindsetWord} onChange={e => setMindsetWord(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600" placeholder="e.g. Brave, Calm" /></div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Notes</h3>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm placeholder-gray-600 resize-none" placeholder="Anything else..." />
                </div>

                {/* Coach-Level Review — collapsible. Optional deeper
                    questions (decision-making, ball tracking, body
                    mechanics, game context). When filled, the Auto
                    Coach Insight on the reflection detail page gets
                    much sharper. */}
                <div className="glass rounded-2xl border border-accent-500/20 bg-accent-500/5">
                  <button
                    type="button"
                    onClick={() => setShowCoachReview(!showCoachReview)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white">🧠 Coach-Level Review</h3>
                      <p className="text-xs text-gray-400 mt-1">Optional. Sharpens the Auto Coach Insight after you save.</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${showCoachReview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCoachReview && (
                    <div className="px-6 pb-6 space-y-5 border-t border-accent-500/20 pt-5">
                      {/* Decision making */}
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Plan for first 6 balls (what was your intent?)</label>
                        <input type="text" value={firstSixBallsPlan} onChange={e => setFirstSixBallsPlan(e.target.value)} placeholder="e.g. Watch ball, leave outside off, defend straight" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 text-white text-sm placeholder-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Did you stick to the plan?</p>
                        <div className="flex gap-2">
                          {(['yes', 'partly', 'no'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setStuckToPlan(stuckToPlan === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${stuckToPlan === v ? 'bg-accent-500/20 text-accent-400 border-accent-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Why did you play the shot that got you out?</label>
                        <input type="text" value={whyShotThatGotMeOut} onChange={e => setWhyShotThatGotMeOut(e.target.value)} placeholder="e.g. Misjudged length, expected a fuller ball" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-accent-500 text-white text-sm placeholder-gray-600" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">% of balls you felt in control: {controlPercent ?? '—'}%</label>
                        <input type="range" min={0} max={100} step={5} value={controlPercent ?? 50} onChange={e => setControlPercent(parseInt(e.target.value, 10))} className="w-full accent-accent-500" />
                      </div>

                      {/* Ball tracking */}
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Picked the length early?</p>
                        <div className="flex gap-2">
                          {(['yes', 'mostly', 'no'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setPickedLengthEarly(pickedLengthEarly === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${pickedLengthEarly === v ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Watched the ball till contact?</p>
                        <div className="flex gap-2">
                          {(['yes', 'partially', 'no'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setWatchedBall(watchedBall === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${watchedBall === v ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>

                      {/* Body mechanics */}
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Head over the ball?</p>
                        <div className="flex gap-2">
                          {(['yes', 'sometimes', 'no'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setHeadOverBall(headOverBall === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${headOverBall === v ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Front foot reached the pitch?</p>
                        <div className="flex gap-2">
                          {(['yes', 'sometimes', 'no'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setFrontFootToPitch(frontFootToPitch === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${frontFootToPitch === v ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Balance at contact?</p>
                        <div className="flex gap-2">
                          {(['stable', 'falling', 'reaching'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setBalanceAtContact(balanceAtContact === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${balanceAtContact === v ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>

                      {/* Game context */}
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Match phase when you batted</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['powerplay', 'middle', 'death', 'na'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setMatchPhase(matchPhase === v ? undefined : v)} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${matchPhase === v ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v === 'na' ? 'N/A' : v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Pressure level</p>
                        <div className="flex gap-2">
                          {(['low', 'medium', 'high'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setPressureLevel(pressureLevel === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${pressureLevel === v ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Intent mode (what were you trying to do?)</p>
                        <div className="flex gap-2 flex-wrap">
                          {(['accelerate', 'consolidate', 'settle'] as const).map(v => (
                            <button key={v} type="button" onClick={() => setIntentMode(intentMode === v ? undefined : v)} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${intentMode === v ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                          ))}
                        </div>
                      </div>

                      {/* ── Run Maker tracker ────────────────────────────
                          Drives the Dot Ball % KPI, bowler-style-specific
                          drills, and the "focus for next session" line in
                          the Run Maker block. All optional. */}
                      <div className="pt-4 border-t border-accent-500/20">
                        <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">🚀 Run Maker tracker</p>

                        <div className="space-y-4">
                          {/* Runs scored + balls faced — auto-seeded from
                              the scorer when a recorded match is linked;
                              editable for practice / informal sessions or
                              when the scorer wasn't running. */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-gray-400 text-xs block mb-1">Runs scored</label>
                              <input
                                type="number"
                                min={0}
                                value={runsScored ?? ''}
                                onChange={e => {
                                  const v = e.target.value;
                                  setRunsScored(v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0));
                                }}
                                placeholder="e.g. 24"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500 text-white text-sm placeholder-gray-600"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs block mb-1">Total balls faced</label>
                              <input
                                type="number"
                                min={0}
                                value={ballsFaced ?? ''}
                                onChange={e => {
                                  const v = e.target.value;
                                  setBallsFaced(v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0));
                                }}
                                placeholder="e.g. 20"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500 text-white text-sm placeholder-gray-600"
                              />
                            </div>
                          </div>
                          {runsScored !== undefined && ballsFaced !== undefined && ballsFaced > 0 && (
                            <p className="text-[10px] text-amber-300/80 -mt-2">
                              Strike rate: <strong>{Math.round((runsScored / ballsFaced) * 100 * 10) / 10}</strong> · Runs / 10 balls: <strong>{Math.round((runsScored / ballsFaced) * 10 * 10) / 10}</strong>
                            </p>
                          )}

                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Dot balls faced (approx)</label>
                            <input
                              type="number"
                              min={0}
                              value={dotBallsFaced ?? ''}
                              onChange={e => {
                                const v = e.target.value;
                                setDotBallsFaced(v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0));
                              }}
                              placeholder="e.g. 8"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-500 text-white text-sm placeholder-gray-600"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Used with your balls-faced count to compute your Dot Ball % KPI.</p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-2">Bowler who dismissed you — arm</p>
                            <div className="flex gap-2">
                              {(['right', 'left'] as const).map(v => (
                                <button key={v} type="button" onClick={() => setDismissalBowlerArm(dismissalBowlerArm === v ? undefined : v)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${dismissalBowlerArm === v ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v.charAt(0).toUpperCase() + v.slice(1)}-arm</button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-2">Bowler who dismissed you — style</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(['fast', 'medium', 'off-spin', 'leg-spin'] as const).map(v => (
                                <button key={v} type="button" onClick={() => setDismissalBowlerStyle(dismissalBowlerStyle === v ? undefined : v)} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${dismissalBowlerStyle === v ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v === 'off-spin' ? 'Off-spin' : v === 'leg-spin' ? 'Leg-spin' : v.charAt(0).toUpperCase() + v.slice(1)}</button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-2">Sticky bowler type — caused most dot balls (optional)</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(['fast', 'medium', 'off-spin', 'leg-spin'] as const).map(v => (
                                <button key={v} type="button" onClick={() => setStickyBowlerStyle(stickyBowlerStyle === v ? undefined : v)} className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${stickyBowlerStyle === v ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{v === 'off-spin' ? 'Off-spin' : v === 'leg-spin' ? 'Leg-spin' : v.charAt(0).toUpperCase() + v.slice(1)}</button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-2">Focus for next session — one micro-goal</p>
                            <div className="flex flex-col gap-2">
                              {([
                                ['runs-per-10', 'Runs per 10 balls (target 6+)'],
                                ['intent', 'Intent score (target 5/5)'],
                                ['dot-ball-pct', 'Dot ball % (keep under 40%)'],
                                ['use-tactic', 'Use a Dot Ball Destroyer tactic each over'],
                                ['pre-ball-routine', 'Pre-ball routine: Look · Breathe · Say'],
                              ] as const).map(([v, label]) => (
                                <button key={v} type="button" onClick={() => setNextFocusKpi(nextFocusKpi === v ? undefined : v)} className={`py-2 px-3 rounded-lg text-left text-xs font-medium border transition-all ${nextFocusKpi === v ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}>{label}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-amber-500/5 p-4 text-xs text-gray-300 leading-snug">
                  <p>
                    <span className="text-purple-300 font-semibold">💡 After you save:</span> open this reflection from the list to see your{' '}
                    <span className="text-purple-300 font-semibold">Bounce Back System</span> (mental recovery) and{' '}
                    <span className="text-amber-300 font-semibold">Run Maker System</span> (scoring identity, intent trigger, 3-phase plan, dot-ball tactics, KPIs) — auto-generated from the fields you filled in here. You can come back later and edit any field; the insights update.
                  </p>
                </div>

                <button onClick={handleSubmit} disabled={!match || saving} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-[1.02] disabled:opacity-40">
                  {saving ? 'Saving...' : editingId ? 'Update Reflection' : 'Save Reflection'}
                </button>
              </div>
            </>
          )}

        </div>
      </section>
    </div>
  );
}
