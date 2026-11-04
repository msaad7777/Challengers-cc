// deskVision.ts — a Monday-to-Friday vision plan for players with desk jobs,
// plus one combined batting and power-hitting drill. Backs the Desk Plan tab in
// the NeuroVision Lab, which is directors-only until it opens to players in 2027.
//
// ── Attribution ──────────────────────────────────────────────────────────
// Drills are summarized in our own words from free videos on the Shah
// Neurovision YouTube channel and Dr. Aakash Shah's newsletter "Cross Your Eyes
// Before You Hit". Every drill names its source and links to it, and go to those
// for the coaching itself. Do NOT expand these into a reproduction of the paid
// programme, and keep this comment intact. Same rule as powerHitting.ts.
//
// ── Honesty rules for this file ──────────────────────────────────────────
// - `adaptation` must say what the club changed. Null means it is as taught.
// - A drill with `sources: []` is club-added and must be labelled that way.
// - Nothing here may promise a result. The video claims are client stories and
//   small studies told by a seller; EVIDENCE_LIMITS says so and must stay visible.
//
// Pure/data-only, no React. Date logic takes the weekday as an argument, per the
// convention for this directory.

export type SourceId =
  | 'cricket-trick' | 'fastest-way' | 'solving-cricket' | 'sports-skills' | 'neuroscience'
  | 'hit-harder' | 'soccer-podcast' | 'badminton' | 'eyes-not-genetics' | 'newsletter';

export interface VisionSource {
  id: SourceId;
  title: string;
  /** Null for the newsletter, which we only have as pasted text. */
  videoId: string | null;
  sport: string;
  /** What we took from it. Says so plainly when that is no drill at all. */
  used: string;
}

export const VISION_SOURCES: VisionSource[] = [
  { id: 'cricket-trick', title: 'This TOP SECRET Cricket Trick Will Improve Your Strike Rate By 176%', videoId: 'qKhQkd80Deg', sport: 'Cricket', used: 'Thumb box and five-spot eye jumps. The middle of that routine is behind a link and is not included here.' },
  { id: 'fastest-way', title: 'The Fastest Way To Achieve Sports Greatness and Never Feel Behind Again', videoId: 'QFe2w0a1pvI', sport: 'Multi-sport', used: 'Far-near switching, and the soft-focus idea.' },
  { id: 'solving-cricket', title: 'Solving Cricket - Exposing the IPL’s Biggest Inefficiency', videoId: 'wnqWuK9eBZE', sport: 'Cricket', used: 'No drills taught. Background on eyes jumping ahead to the bounce.' },
  { id: 'sports-skills', title: 'How To Unlock Insane Sports Skills On Command', videoId: '6O8RFH6CQV0', sport: 'Multi-sport', used: 'No eye drills taught. Five-minute visualization, and the order of adding speed then pressure.' },
  { id: 'neuroscience', title: 'The Fascinating Neuroscience of Hitting a Ball', videoId: 'XOK2Cbo5LB0', sport: 'Baseball, with cricket sections', used: 'No drills taught. Background on reading the body before release.' },
  { id: 'hit-harder', title: 'Give me 7 mins, and I’ll show you how to hit 88% harder', videoId: 'zpJHQ_NifLA', sport: 'Baseball', used: 'Bottle cap test, finger-to-nose, one-thought routine, and the review questions.' },
  { id: 'soccer-podcast', title: 'Why Young Soccer Players Only See the Ball (And How to Fix It) | Irena Castle', videoId: 'bzt2KhWlwTU', sport: 'Soccer-led, multi-sport', used: 'One-eye targets, grid jumps and ball tracking, all changed to work without the guest’s paid glasses.' },
  { id: 'badminton', title: '7 Habits That Make You Dangerously Good at Badminton', videoId: '0iPxsorV6Rg', sport: 'Badminton', used: 'Pause-and-predict, call the landing, and the wide view between shots.' },
  { id: 'eyes-not-genetics', title: 'Your Eyes (Not Genetics) Are Killing Your Game… I’ll Prove It!', videoId: 'rP2FkKUaFHs', sport: 'Multi-sport, with a cricket section', used: 'No drills you can follow from the video. Not used in the plan.' },
  { id: 'newsletter', title: 'Cross Your Eyes Before You Hit (newsletter, Dr. Aakash Shah)', videoId: null, sport: 'Baseball', used: 'Bottle cap test, one-thought routine, and its honest limits.' },
];

export function sourceById(id: SourceId, sources: VisionSource[] = VISION_SOURCES): VisionSource {
  const s = sources.find((x) => x.id === id);
  if (!s) throw new Error(`no vision source with id "${id}"`);
  return s;
}

export function sourceUrl(source: VisionSource, atSeconds?: number): string | null {
  if (!source.videoId) return null;
  const base = `https://www.youtube.com/watch?v=${source.videoId}`;
  return atSeconds ? `${base}&t=${atSeconds}s` : base;
}

export interface SourceRef { id: SourceId; atSeconds?: number; }

export interface DeskDrill {
  id: string;
  name: string;
  minutes: number;
  equipment: string;
  steps: string[];
  cricket: string;
  sources: SourceRef[];
  /** What the club changed from the source. Null means as taught. */
  adaptation: string | null;
}

export const DESK_DRILLS: DeskDrill[] = [
  {
    id: 'thumb-box', name: 'Thumb box', minutes: 1, equipment: 'None',
    steps: [
      'Cover one eye and hold your thumb out in front of you.',
      'Move it to the edge of what you can see and hold for 2 seconds.',
      'Trace a box: up, across, down, across, back up, with a 2-second hold at each point.',
      'Switch eyes and repeat.',
    ],
    cricket: 'Taught as the first step of a warm-up before batting.',
    sources: [{ id: 'cricket-trick', atSeconds: 162 }],
    adaptation: null,
  },
  {
    id: 'far-near', name: 'Far-near switching', minutes: 1, equipment: 'A window or the far wall',
    steps: [
      'Look away from your screen and make something far away clear.',
      'Bring your thumb up close and make that clear.',
      'Go back and forth 10 times.',
    ],
    cricket: 'Practises changing focus between the bowler’s hand and the ball coming at you.',
    sources: [{ id: 'fastest-way', atSeconds: 387 }],
    adaptation: 'The video picks a target at game distance. Indoors, use the farthest thing you can see.',
  },
  {
    id: 'bottle-cap', name: 'Bottle cap test', minutes: 1, equipment: 'Two bottle caps and a marker',
    steps: [
      'Draw an up-and-down line on one cap and a side-to-side line on the other. Set them side by side.',
      'Turn your eyes inward until a third cap with a plus sign appears in the middle.',
      'Hold that plus steady for 5 seconds. Do not force it.',
      'If no plus forms or it will not hold, that movement is hard for you. Use finger-to-nose instead: hold a finger out and bring it slowly to your nose.',
    ],
    cricket: 'Both eyes turn in as the ball comes closer. This shows whether that movement is easy for you.',
    sources: [{ id: 'hit-harder', atSeconds: 133 }, { id: 'newsletter' }],
    adaptation: 'A baseball drill. The eye movement is the same, and nothing about it has been tested on cricketers.',
  },
  {
    id: 'one-eye-target', name: 'One-eye paper ball', minutes: 2, equipment: 'Scrap paper and a bin',
    steps: [
      'Cover one eye with your palm. Stand close to the bin.',
      'Keep throwing paper balls in, moving back as it gets easy, for up to a minute.',
      'Switch eyes, then finish with both eyes open. Always finish with both.',
    ],
    cricket: 'Gets you judging distance with each eye, then with both together.',
    sources: [{ id: 'soccer-podcast', atSeconds: 1499 }],
    adaptation: 'The video shoots a ball at a goal or basket wearing the guest’s paid glasses. A palm and a bin are our swap, and may not do the same thing.',
  },
  {
    id: 'grid-jumps', name: 'Grid jumps', minutes: 2, equipment: 'A window frame, or tiles on a wall',
    steps: [
      'Stand facing a grid, such as window panes, tiles or sticky notes on a wall.',
      'Keep your head still and jump your eyes between crossing points, quickly and in a rhythm.',
      'Count how many clean jumps you get in one minute. Do one eye, then the other, then both.',
    ],
    cricket: 'Practises fast, accurate eye jumps, like the one from the release to the bounce.',
    sources: [{ id: 'soccer-podcast', atSeconds: 1729 }],
    adaptation: 'The video uses a soccer net and the guest’s paid glasses. A window grid and a palm are our swap.',
  },
  {
    id: 'ball-tracking', name: 'Follow the ball', minutes: 2, equipment: 'A tennis ball, away from your screens',
    steps: [
      'With someone at home, bounce-pass the ball back and forth. On your own, bounce it off a clear wall.',
      'Follow the ball with your eyes the whole way, every time.',
      'Cover one eye, then the other, then finish with both open.',
    ],
    cricket: 'Practises following a moving ball smoothly.',
    sources: [{ id: 'soccer-podcast', atSeconds: 1861 }],
    adaptation: 'The video is a partner drill with the guest’s paid glasses. The solo wall version and palm are ours.',
  },
  {
    id: 'five-spot', name: 'Five-spot eye jumps', minutes: 1, equipment: 'None, just room to take your stance',
    steps: [
      'Take your stance. Hold your front-side thumb out where the bowler’s hand would be, and look at it.',
      'Choose five spots on the floor, each a ball you normally face, from short to almost a yorker.',
      'Move your eyes thumb, spot 1, thumb, spot 2, and on through spot 5.',
    ],
    cricket: 'Taught for cricket: practises looking at the release, then jumping ahead to the bounce.',
    sources: [{ id: 'cricket-trick', atSeconds: 216 }],
    adaptation: null,
  },
  {
    id: 'soft-to-hard', name: 'Wide view, then lock on', minutes: 1, equipment: 'None',
    steps: [
      'Look straight ahead and take in the whole room without moving your eyes. Stare at nothing.',
      'After 5 seconds, snap onto one small mark and make it sharp.',
      'Go back to the wide view. Do this 6 times.',
    ],
    cricket: 'At the crease: wide between balls, then lock onto the bowler’s hand as they gather.',
    sources: [{ id: 'fastest-way', atSeconds: 249 }, { id: 'badminton', atSeconds: 608 }],
    adaptation: 'The videos describe this idea without a method. The timings and reps are ours.',
  },
  {
    id: 'pause-predict', name: 'Pause and predict', minutes: 3, equipment: 'Any match video. Our own replays are in C3H',
    steps: [
      'Pause just as the bowler lets go, and say the length and where the shot will go.',
      'Play it and check. If you were wrong, rewind and watch the bowler’s arm.',
      'Do 10 clips and keep your score. Try to beat it next time.',
    ],
    cricket: 'Practises reading the bowler before the ball is on its way. A good screen use on a lunch break.',
    sources: [{ id: 'badminton', atSeconds: 532 }],
    adaptation: 'Taught with badminton footage, paused before contact. Pausing at the release is our cricket version.',
  },
  {
    id: 'one-thought', name: 'One-thought routine', minutes: 1, equipment: 'None',
    steps: [
      'Pick one cue for the whole innings, such as “in my arc, hit it; out of it, leave it”.',
      'Take your breath, walk in and face up with only that thought.',
      'Technique thinking belongs in practice, not at the crease.',
    ],
    cricket: 'Rehearse it at your desk so it is automatic when you walk out.',
    sources: [{ id: 'hit-harder', atSeconds: 249 }, { id: 'newsletter' }],
    adaptation: 'The source cue is the baseball “attack the zone”. “My arc” is our cricket wording.',
  },
  {
    id: 'visualize', name: 'Five-minute visualization', minutes: 5, equipment: 'A quiet spot',
    steps: [
      'Close your eyes and pick a real situation, such as the last five overs against their best bowler.',
      'Run the reads and decisions at real speed, not in slow motion.',
    ],
    cricket: 'Good for the evening before a match, or when you have no time for anything else.',
    sources: [{ id: 'sports-skills', atSeconds: 439 }],
    adaptation: 'A general sports idea. The cricket example is ours.',
  },
  {
    id: 'review', name: 'Friday review', minutes: 1, equipment: 'Notes app or paper',
    steps: [
      'After your last hit, ask: was the ball easier to judge late? Did you middle more of them?',
      'Note your grid-jump count and pause-and-predict score. If they are flat after a few weeks, say so and change something.',
    ],
    cricket: 'This is how you find out if any of it is helping you.',
    sources: [{ id: 'hit-harder', atSeconds: 407 }],
    adaptation: 'The two questions are from the video. Keeping the scores is our addition.',
  },
];

export function deskDrillById(id: string, drills: DeskDrill[] = DESK_DRILLS): DeskDrill {
  const d = drills.find((x) => x.id === id);
  if (!d) throw new Error(`no desk drill with id "${id}"`);
  return d;
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export interface DeskDay {
  day: Weekday;
  label: string;
  focus: string;
  /** Short block before you log on. */
  morning: string[];
  /** Short block on a work break. */
  breakTime: string[];
  /** Runs the home version of the combined drill as well. */
  combined: boolean;
  note?: string;
}

export const DESK_WEEK: DeskDay[] = [
  { day: 'mon', label: 'Monday', focus: 'Both eyes working together', morning: ['thumb-box', 'far-near'], breakTime: ['bottle-cap', 'one-eye-target', 'one-thought'], combined: false },
  { day: 'tue', label: 'Tuesday', focus: 'Fast eye jumps, then swing', morning: ['thumb-box', 'far-near'], breakTime: ['grid-jumps'], combined: true },
  { day: 'wed', label: 'Wednesday', focus: 'Reading the bowler', morning: ['far-near', 'soft-to-hard'], breakTime: ['pause-predict', 'ball-tracking'], combined: false },
  { day: 'thu', label: 'Thursday', focus: 'Early pick-up, then swing', morning: ['thumb-box', 'five-spot'], breakTime: ['grid-jumps'], combined: true },
  { day: 'fri', label: 'Friday', focus: 'Light and sharp', morning: ['far-near', 'soft-to-hard'], breakTime: ['pause-predict', 'review'], combined: false, note: 'No full-intent swings today if you play this weekend. Add the five-minute visualization this evening.' },
];

/** Minutes on the plan's own drills, not counting the combined drill. */
export const dayMinutes = (day: DeskDay, drills: DeskDrill[] = DESK_DRILLS): number =>
  [...day.morning, ...day.breakTime].reduce((sum, id) => sum + deskDrillById(id, drills).minutes, 0);

/** Map Date.getDay() (0 = Sunday) to a plan day. Weekends return null. */
export function weekdayFromIndex(dayIndex: number): Weekday | null {
  const days: Array<Weekday | null> = [null, 'mon', 'tue', 'wed', 'thu', 'fri', null];
  return days[dayIndex] ?? null;
}

export const INDOOR_SWAP = 'Got the indoor session today? Skip that day’s plan and do the indoor warm-up below. It is the same work with a bat in your hand.';

export interface WarmupCue { text: string; drillId?: string; }

/** About 3 minutes in the car park or behind the net, before you pad up. */
export const INDOOR_CUES: WarmupCue[] = [
  { text: 'Thumb box, one pass with each eye.', drillId: 'thumb-box' },
  { text: 'Far-near switching, 10 times, using the far end of the net.', drillId: 'far-near' },
  { text: 'Five-spot eye jumps in your stance, in the lane you are about to bat in.', drillId: 'five-spot' },
  { text: 'While you wait: call the length out loud from the first part of each ball’s flight, then check where it lands.' },
  { text: 'Pick your one thought before you walk into the net.', drillId: 'one-thought' },
];

/** About 3 minutes before you walk out. Nothing new, nothing tiring. */
export const MATCH_DAY_CUES: WarmupCue[] = [
  { text: 'Thumb box, one pass with each eye. Stop there if your eyes feel tired.', drillId: 'thumb-box' },
  { text: 'Far-near switching, 10 times, using the far boundary.', drillId: 'far-near' },
  { text: 'Five-spot eye jumps once, at the side of the ground.', drillId: 'five-spot' },
  { text: 'While waiting to bat: wide view between balls, lock onto the bowler’s hand as they gather.', drillId: 'soft-to-hard' },
  { text: 'At the crease: one thought, one breath, face up. No technique thinking.', drillId: 'one-thought' },
];

// ── Combined batting and power-hitting drill ─────────────────────────────
// The swing sets follow the rules already in powerHitting.ts: full intent, real
// rest, stop when the bat slows, and no volume just before a match.

export interface CombinedStep {
  name: string;
  minutes: number;
  what: string;
  /** Where this came from, in words a player can read. */
  origin: string;
}

export interface CombinedVersion {
  id: 'home' | 'indoor';
  name: string;
  where: string;
  equipment: string;
  steps: CombinedStep[];
  limit: string;
}

export const COMBINED_DRILL_NAME = 'See it, call it, hit it';

export const COMBINED_DRILL_WHY = 'Eye drills and swing practice are usually done apart. This puts them in one sequence: get your eyes ready, read the length, make a decision, then swing at full intent. The sequence is the club’s own design. No source teaches it and it has not been tested.';

export const COMBINED_VERSIONS: CombinedVersion[] = [
  {
    id: 'home', name: 'Home version', where: 'Lunch break, with room to swing',
    equipment: 'Your match bat and a die, or someone to call numbers. Check the ceiling and what is around you.',
    limit: 'These are air swings, so they train intent and not timing. The contact check happens in the indoor version.',
    steps: [
      { name: 'Eyes on', minutes: 2, what: 'Thumb box, then far-near switching 10 times.', origin: 'Shah Neurovision drills, as above' },
      { name: 'Set the thought', minutes: 1, what: 'Pick your one cue and take a slow breath.', origin: 'One-thought routine, adapted from baseball' },
      { name: 'Call it', minutes: 2, what: 'Mark five spots on the floor, from short to yorker. Run the five-spot eye jumps in your stance, then roll the die and jump your eyes to that spot. Say the shot you would play.', origin: 'Five-spot eye jumps from Shah Neurovision. The die and the shot call are ours' },
      { name: 'Hit it', minutes: 5, what: '3 sets of 6. For each swing, roll, jump your eyes to that spot and shadow the right shot at full intent. Balls in your arc get your biggest swing. A 6 means leave it, and that counts as a correct rep. Rest 60 seconds between sets.', origin: 'Club-added. Sets follow the C3H power-hitting rules' },
    ],
  },
  {
    id: 'indoor', name: 'Indoor net version', where: 'Your indoor session, with a feeder',
    equipment: 'Bat, pads, a feeder and two balls that look different',
    limit: 'A few sharp sets beat one long one. Stop when your concentration or bat speed drops.',
    steps: [
      { name: 'Eyes on', minutes: 3, what: 'The indoor warm-up cues above.', origin: 'Shah Neurovision drills, as above' },
      { name: 'Call it', minutes: 3, what: 'Six balls, no shot. Say the length out loud from the first part of the flight, then check where it lands.', origin: 'Call the landing, adapted from badminton' },
      { name: 'Hit or leave', minutes: 4, what: 'Twelve balls with the two balls mixed. One is the hit ball, the other must be left however good it looks. The wrong call counts as a fault either way.', origin: 'Colour ball drill, Julian Wood (julianwoodcricket.com), already in our batting notes' },
      { name: 'Hit it', minutes: 4, what: '2 sets of 6. In your arc gets your biggest swing, out of it gets left or defended. Same one thought every ball. Rest between sets, and note how many you middled.', origin: 'Club-added. Sets follow the C3H power-hitting rules' },
    ],
  },
];

export const combinedMinutes = (version: CombinedVersion): number =>
  version.steps.reduce((sum, s) => sum + s.minutes, 0);

export const COMBINED_MATCH_RULE = 'Full-intent swings stay out of the 48 hours before a match, because heavy swinging can leave you flat. Inside 48 hours, do the eye steps only.';

// ── Julian Wood power-hitting lessons ────────────────────────────────────
// Empty until those lessons are shared. Add them here as brief notes in our own
// words, with credit, and never as a step-by-step copy of the method. The panel
// says "still to come" for as long as this list is empty.

export interface PowerLesson { id: string; title: string; summary: string; url: string; }

export const JULIAN_WOOD_LESSONS: PowerLesson[] = [];

// ── Evidence and safety. Both must stay on the page. ─────────────────────

export const EVIDENCE_LIMITS: string[] = [
  'Nobody can promise you results from this, and the club has not measured any. It may help, it may not. Your own scores on the Friday review are the honest test.',
  'Every video here is from one channel, and it sells vision training. The headline numbers in two titles (176% and 88%) have no support in the videos, so we did not use them.',
  'The strongest-sounding stories, like the batter whose strike rate rose 50%, are single clients told by the seller. They are not evidence that the training caused the change.',
  'The University of Cincinnati baseball team’s average went from .251 to .285 after adding eye training. No group skipped the training, so the study cannot show the eye work caused the rise.',
  'The cricket eye-tracking work described in the videos compares good and weaker batters. One study had only four. It shows what good batters do, not that training gets you there. We have not read these studies ourselves.',
  'Not every bad shot comes from your eyes, and passing the bottle cap test will not explain a missed ball.',
  'The videos suggest 15–20 minutes, 4–5 days a week, for their own programme. This plan is shorter because that is what a work day allows, so we do not know if it is enough.',
];

export const DESK_SAFETY = 'This is sports practice, not medical advice or treatment. Stop if you get eye strain, a headache, blur, double vision that does not clear, or dizziness. If that happens, or you have a known eye condition, see an eye professional before doing more of this.';

export const SCREEN_BREAK_NOTE = 'Nearly all of this is done away from your screen, on purpose. The source’s view, given as opinion, is that training with real targets in open space carries over better than phone apps.';
