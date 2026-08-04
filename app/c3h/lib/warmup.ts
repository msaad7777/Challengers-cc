// warmup.ts — the daily eye/neural warm-up for the NeuroVision Lab.
// Monocular eye stretches (one eye at a time) to activate each eye's full range
// of motion, then near-far focus + convergence to switch on the eye-brain link.
// Meant to be run FIRST, every day, before any other drill or a game — low
// intensity, no fatigue. Pure data so it stays testable. Shape matches the
// RoutinePlayer step ({text, seconds, breathe}).

export interface WarmupStep { text: string; seconds: number; breathe: boolean; }

export const WARMUP_STEPS: WarmupStep[] = [
  { seconds: 12, breathe: false, text: 'Relax first. Rub your palms together until warm, then cup them gently over your closed eyes for a few seconds. Let the eyes settle.' },
  { seconds: 14, breathe: false, text: 'Cover your LEFT eye. With your right eye only, look all the way UP… and all the way DOWN. Slow, full range. 4 times.' },
  { seconds: 14, breathe: false, text: 'Right eye only: look far LEFT… and far RIGHT. Full stretch into each corner. 4 times.' },
  { seconds: 14, breathe: false, text: 'Right eye only: trace the DIAGONALS — top-left to bottom-right, then top-right to bottom-left. 3 each way.' },
  { seconds: 14, breathe: false, text: 'Right eye only: draw big, slow CIRCLES — 3 clockwise, 3 anti-clockwise, right out to the edges.' },
  { seconds: 14, breathe: false, text: 'Switch. Cover your RIGHT eye. Left eye only: UP and DOWN, full range, 4 times.' },
  { seconds: 14, breathe: false, text: 'Left eye only: far LEFT and far RIGHT, 4 times.' },
  { seconds: 16, breathe: false, text: 'Left eye only: DIAGONALS both ways, 3 each — then big CIRCLES, 3 clockwise and 3 anti-clockwise.' },
  { seconds: 14, breathe: false, text: 'Both eyes now. Hold a finger at arm’s length. Focus on it, then snap your focus to something far away, and back. 8 times.' },
  { seconds: 14, breathe: false, text: 'Convergence: bring your finger slowly toward the tip of your nose, keeping it single as long as you can. When it doubles, ease back out. 5 slow reps.' },
  { seconds: 8, breathe: false, text: 'Finish: blink softly 10 times and relax. Your eyes are switched on — now go into your session.' },
];

export const WARMUP_SAFETY = 'Stop if you feel eye strain, a headache, blur or dizziness. Slow and gentle — this is activation, not effort.';

// ── NeuroVision Edge weekly program (off-screen drill sets) ───────────────
// The structured weekly progression — equipment drills done with your kit
// (eye patch, bullseye, Brock string, Hart chart, pencil, boba straw, balance
// board, jump rope, ping-pong ball). Drill 1 every week is the daily warm-up
// above. Reference/summaries only — the exact method follows the course.

export interface FoundationDrill {
  n: number;
  name: string;
  what: string;
  protocol: string;
  cricket: string;
}

export interface NeuroWeek {
  week: number;
  theme: string;
  drills: FoundationDrill[];
  note: string;
}

export const NEUROVISION_WEEKS: NeuroWeek[] = [
  {
    week: 3,
    theme: 'Vision under load — keep seeing clearly while your body is unstable',
    note: 'Balance load: dominant leg = easier, non-dominant leg = harder; cushion / folded pillow if you have no board. By session 3–4 it starts feeling controlled. If not, repeat the week.',
    drills: [
      {
        n: 2, name: 'Monocular Bullseye + Balance',
        what: 'Patch one eye. Balance on one leg (dominant = easy, non-dominant = hard) or a board, focused on a bullseye target.',
        protocol: 'Alternate hard focus ↔ soft focus on the target while holding balance. Switch eyes. Master it on the leg first, then add the board/BOSU.',
        cricket: 'Batters switch between sharp focus and relaxed peripheral awareness while moving, transferring weight and adjusting to bounce.',
      },
      {
        n: 3, name: 'Near/Far Hart Chart',
        what: 'Patch one eye. Hart chart 6–8 ft away + a near card. Read near row 1 → far row 1 → near row 2 → far row 2, and so on, as FAST as you can.',
        protocol: 'Time it without balance, then repeat while balancing. Log both times daily — the gap should shrink as your nervous system learns to hold focus speed under load.',
        cricket: 'Look down → up to the bowler → the release → out to the boundary — fast near-far refocusing.',
      },
      {
        n: 4, name: 'Brock String (training)',
        what: 'Anchor at eye level, other end on your nose. Closest bead ~5 cm, the rest spread out to the far end. Look bead 1 → 2 → 3 → … — a clear “X” must cross exactly at each bead.',
        protocol: '25 cycles (one cycle = through all beads). Quality over speed. Progresses into your batting stance later.',
        cricket: 'Convergence, eye teaming and depth perception — judging length.',
      },
      {
        n: 5, name: 'Cossack Squats + Hart Chart',
        what: 'Hart chart 6–8 ft away. Do continuous lateral (Cossack) lunges while reading the chart aloud.',
        protocol: 'Don’t stop squatting to read or stop reading to squat — both at once, every rep. Through the chart once, fast, keeping the motion.',
        cricket: 'Moving laterally while tracking the ball — footwork for batting, keeping and fielding.',
      },
    ],
  },
  {
    week: 4,
    theme: 'Speed + sport-specific gaze + reaction under pressure',
    note: 'Same drills, faster and more sport-specific. Expect it to expose left/right asymmetries you didn’t know were there — that’s normal; repetition fixes it.',
    drills: [
      {
        n: 2, name: 'Monocular Near/Far + Balance',
        what: 'Patch one eye. Non-dominant leg / BOSU / board. Near card + Hart chart 6–8 ft. Read near row → far row, alternating.',
        protocol: 'Half the chart, then switch eyes for the other half. This week the focus is pure SPEED — shift near↔far as fast as you can while balancing.',
        cricket: 'Constantly shifting focus between the bowler’s hand, the ball, the non-striker and the field.',
      },
      {
        n: 3, name: 'Brock String Multi-Gaze',
        what: 'Brock string, but not only straight ahead — hold each head/gaze position: centre, up, left, right, down, and your sport (batting) stance. Clear “X” at each bead.',
        protocol: '25 cycles in EACH position. If your batting stance is hard, your stance isn’t engaging both eyes — give that one extra reps.',
        cricket: 'Your head is rarely upright when batting/keeping/fielding — keeps the eyes coordinated in any posture.',
      },
      {
        n: 4, name: 'Monocular Ping-Pong Wall Catches',
        what: 'Patch one eye. Throw a ping-pong ball (or vector ball) against a wall and catch the rebound, adding a wrist flick so it comes back faster.',
        protocol: 'L1 dominant throw→dominant catch · L2 non-dominant→non-dominant · L3 cross (dominant throw→non-dominant catch, and reverse). Speed up each level, then switch eyes.',
        cricket: 'Single-eye depth, reaction time and catching accuracy — tracking the ball under speed.',
      },
    ],
  },
  {
    week: 5,
    theme: 'Foundational visual control — fine motor precision + convergence',
    note: 'The hardest week (pencil-in-straw, jump-rope reading). Shakiness is your brain recalibrating spatial estimation — it settles by session 3–4. If it’s still rough after a week, repeat the week.',
    drills: [
      {
        n: 2, name: 'Pencil in Straw (the hard one)',
        what: 'Patch one eye. Dominant hand holds the pencil, other holds a wide (boba) straw. Thread the pencil through, centre gaze only.',
        protocol: '3 slow accuracy reps, then 10 FAST reps — speed is the goal. Switch the patch to the other eye and repeat. Note which eye was harder (your weaker side).',
        cricket: 'One eye estimates distance, angle & trajectory — picking length, catching, middling the ball.',
      },
      {
        n: 3, name: 'Brock String + Balance',
        what: 'Batting stance on your dominant leg (or a board), watching the bead — the “X” crosses exactly at the bead every rep.',
        protocol: '25 cycles, then switch legs for 25. Quality, not speed.',
        cricket: 'Balance + convergence + head stability — like batting against pace.',
      },
      {
        n: 4, name: 'Pencil Push-ups',
        what: 'No patch, both eyes. From ~40 cm, bring the pencil slowly to your nose keeping it single; pause and refocus at any blur, then to almost-touching and back out.',
        protocol: '25 reps (in and out = 1 cycle).',
        cricket: 'Convergence & depth — holding focus as the ball closes from 22 yards to contact.',
      },
      {
        n: 5, name: 'Hart Chart + Jump Rope',
        what: 'Hart chart 6–8 ft away. Skip rope continuously while reading the chart aloud — no stops, no missed letters, in sync.',
        protocol: 'Through the whole chart once in rhythm; if jerky, smooth it out and read it once more.',
        cricket: 'Multitasking under movement — watch, move the feet, decide the shot, balance, all at once.',
      },
    ],
  },
];

export const PROGRAM_NOTE = 'Drill 1 every week is your daily warm-up above. Week numbers are guidelines, not deadlines — if a week still feels shaky, repeat it until it’s smooth. Nailing the foundation matters more than rushing through.';
