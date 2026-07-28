// followAlong.ts — long-form guided "follow-along" visualization scripts for
// cricket, modelled on Dr. Shah's AFL follow-alongs (foundational image-control
// build → execution reps → positive scenarios → mistake + instant recovery).
// One session per discipline: batting, bowling, wicketkeeping. Original
// wording (cricket-specific), deterministic, no LLM — kept pure/testable.

export type Discipline = 'batting' | 'bowling' | 'keeping';

export interface FollowStep { text: string; seconds: number; breathe: boolean; }
export interface FollowAlongSession {
  id: string;
  discipline: Discipline;
  name: string;
  emoji: string;
  steps: FollowStep[];
}

// Shared opening: settle the breath, then a simple image-control drill (a ball
// tracing a square) before any game imagery — the "learn to hold an image"
// foundation Dr. Shah insists on.
const OPENING: FollowStep[] = [
  { seconds: 16, breathe: true, text: 'Slow breath in through your nose… and slowly out. Again — in… and out. Let your shoulders drop, your jaw loosen, your breathing settle.' },
  { seconds: 14, breathe: false, text: 'Picture a simple square floating in front of you — four equal sides. Now place a bright red cricket ball in the top-left corner. Roll it slowly along the top, down the right side, across the bottom, up the left, back to the start. Smooth. Controlled. Clear.' },
  { seconds: 9, breathe: true, text: 'If the image slips for a moment, that’s fine — just bring it back. That control is exactly what lets you see the game clearly. One more slow breath in… and out.' },
];

const CLOSE = (line: string): FollowStep => ({ seconds: 11, breathe: true, text: `One final slow breath in… and out. ${line}` });

export const FOLLOW_ALONG_SESSIONS: FollowAlongSession[] = [
  {
    id: 'batting', discipline: 'batting', name: 'Batting', emoji: '🏏',
    steps: [
      ...OPENING,
      { seconds: 10, breathe: false, text: 'Now see yourself walking to the crease — the grass, the strip, the field spread around you. See it through your own eyes.' },
      { seconds: 9, breathe: false, text: 'Bring in sound — the hum of the ground, a fielder chirping, the captain setting his field, and your own breathing, steady and calm.' },
      { seconds: 10, breathe: false, text: 'Feel your gloves, and the bat in your hands — its weight, its pickup. Feel your feet settle as you take guard. Balanced. Still. Alert.' },
      { seconds: 9, breathe: false, text: 'Look around the field and see the gaps — the space at cover, the opening at midwicket. Great batters gather information before the ball arrives.' },
      { seconds: 9, breathe: false, text: 'The bowler walks back to his mark. Soft eyes. Now he runs in — watch his rhythm, his arm, the seam sitting in his hand.' },
      { seconds: 12, breathe: false, text: 'See the ball leave the hand. Pick up line and length early — it’s full, on off stump. You’re forward, head still, and you drive it cleanly along the ground through the gap. Feel the middle of the bat.' },
      { seconds: 10, breathe: false, text: 'Next ball — short, into the body. You rock back, watch it onto the bat, and pull it in front of square. Timed, not forced. Controlled.' },
      { seconds: 9, breathe: false, text: 'Next ball you work off your hip into the gap, call, and jog the single. Calm, busy, in control of the innings.' },
      { seconds: 10, breathe: false, text: 'Now a mistake — you push at a wide one and miss, the ball beating the edge. Frustration flickers. But you reset instantly. One breath. Eyes up. Next ball.' },
      { seconds: 11, breathe: false, text: 'You leave the next one on length, right under your eyes. Then the bowler overpitches — and you punch it through cover for four. The good ball is behind you; you’re already onto the next.' },
      { seconds: 10, breathe: false, text: 'Now a tight chase — crowd noise rising, runs needed. Your breathing stays calm. You watch the ball, back your range, pick your gap, and execute cleanly.' },
      CLOSE('You’ve just rehearsed watching the ball, finding the gap, and recovering from a mistake — exactly what you’ll do out there.'),
    ],
  },
  {
    id: 'bowling', discipline: 'bowling', name: 'Bowling', emoji: '🎳',
    steps: [
      ...OPENING,
      { seconds: 10, breathe: false, text: 'Now see yourself at the top of your mark, ball in hand — the pitch stretching away, the batter taking guard, your field set behind you.' },
      { seconds: 9, breathe: false, text: 'Bring in sound — the captain’s word, a fielder clapping you in, your own breathing, the quiet just before you run.' },
      { seconds: 10, breathe: false, text: 'Feel the ball in your fingers — the seam upright under your fingertips, the weight, your grip settled. Feel your feet, balanced and ready.' },
      { seconds: 9, breathe: false, text: 'Pick your target — top of off stump, a good length that makes the batter play. See exactly where you want it to land.' },
      { seconds: 9, breathe: false, text: 'Now you run in — smooth, rhythmic, building. Eyes on your target. Load up. Brace the front leg.' },
      { seconds: 12, breathe: false, text: 'Release. Watch the ball leave your hand, seam spinning true, land on your length, and shape past the outside edge. The keeper takes it. Dot ball. Pressure building.' },
      { seconds: 10, breathe: false, text: 'Next ball, same spot — but it nips back, beats the inside edge, thuds into the pad. A huge appeal. Two on the spot in a row. You own this over.' },
      { seconds: 9, breathe: false, text: 'Now you change it up — slower ball, held in the fingers, well disguised. The batter is early on the shot and spoons it up. Plan working.' },
      { seconds: 11, breathe: false, text: 'Now a mistake — you drop short and it’s pulled away for four. The crowd lifts. But elite bowlers reset instantly. One breath. Back to your mark. Next ball, right on the spot.' },
      { seconds: 10, breathe: false, text: 'Next over you beat the edge and the catch goes down at slip. Frustration flickers — then it’s gone. Eyes up. You trust your plan and run in again.' },
      { seconds: 10, breathe: false, text: 'Death overs, runs to defend. Heart rate up, but your breathing steadies you. You nail your yorker length, right into the base of the stumps. Executed under pressure.' },
      CLOSE('You’ve rehearsed hitting your length, holding your plan, and resetting after being hit — the mark of a bowler who stays in the contest.'),
    ],
  },
  {
    id: 'keeping', discipline: 'keeping', name: 'Wicketkeeping', emoji: '🧤',
    steps: [
      ...OPENING,
      { seconds: 10, breathe: false, text: 'Now see yourself crouched behind the stumps — the batter in front, the bowler at the top of his mark, the slips beside you. See it through your own eyes.' },
      { seconds: 9, breathe: false, text: 'Bring in sound — the field chattering, your own quiet count as the bowler runs in, your breathing, calm and low.' },
      { seconds: 10, breathe: false, text: 'Feel your stance — low, balanced, weight on the balls of your feet, gloves relaxed and ready in front of you. Eyes level.' },
      { seconds: 9, breathe: false, text: 'The bowler runs in. Watch the ball out of the hand — never off the bat. Let it come to you. Stay down until it arrives.' },
      { seconds: 12, breathe: false, text: 'The ball beats the outside edge. You watch it all the way, give with soft hands, and take it cleanly in front of your chest. Rise with the ball. Smooth. Quiet.' },
      { seconds: 10, breathe: false, text: 'Next ball slides down the leg side. You move quickly — low and balanced — and take it two-handed outside the line. Clean take, no fuss.' },
      { seconds: 10, breathe: false, text: 'Now up to the stumps. The batter’s foot lifts. The ball turns past the bat — you take it and break the stumps in one motion. Stumped. Sharp hands.' },
      { seconds: 10, breathe: false, text: 'Now a mistake — one climbs on you and bursts through the gloves for byes. Annoyance flickers. But you reset instantly. One breath. Back down. Watch the next one all the way.' },
      { seconds: 10, breathe: false, text: 'An edge flies at catchable height and you shell it — gone as fast as it came. Eyes up. You stay low, trust your hands, and the next one sticks.' },
      { seconds: 10, breathe: false, text: 'Last over, tight game. You stay switched on every ball — watching, giving, taking clean. Calm behind the stumps steadies the whole side.' },
      CLOSE('You’ve rehearsed watching the ball, soft clean takes, and resetting after a miss — the keeper the team trusts.'),
    ],
  },
];
