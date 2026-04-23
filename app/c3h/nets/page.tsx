"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, getDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Reflection {
  id: string;
  email: string;
  date: string;
  matchIndex: number;
  match: string;
  opponent: string;
  howGotOut: string | string[];
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
];

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
const WAGON_REGIONS: { id: number; label: string; angle: number }[] = [
  { id: 1, label: 'Straight', angle: 0 },
  { id: 2, label: 'Mid-off', angle: -30 },
  { id: 3, label: 'Cover', angle: -60 },
  { id: 4, label: 'Point', angle: -90 },
  { id: 5, label: 'Third Man', angle: -135 },
  { id: 6, label: 'Fine Leg', angle: 135 },
  { id: 7, label: 'Mid-wicket', angle: 60 },
  { id: 8, label: 'Mid-on', angle: 30 },
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
  const [view, setView] = useState<'list' | 'new' | 'detail' | 'patterns' | 'planner'>('list');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [match, setMatch] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
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

  // Shot planner state
  const [shotPlan, setShotPlan] = useState<ShotPlan>({ shotConfidence: {}, bowlerPlans: {}, notes: '' });
  const [plannerBowlerType, setPlannerBowlerType] = useState('');
  const [plannerSaving, setPlannerSaving] = useState(false);
  const [plannerLoaded, setPlannerLoaded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

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

    // Auto-delete reflections older than 3 matches (keep last 3 match reflections + all practice)
    const matchReflections = data.filter(r => r.matchIndex !== 99);
    const practiceReflections = data.filter(r => r.matchIndex === 99);
    if (matchReflections.length > 3) {
      const toDelete = matchReflections.slice(3);
      for (const r of toDelete) {
        await deleteDoc(doc(db, 'reflections', r.id));
      }
    }
    const kept = [...matchReflections.slice(0, 3), ...practiceReflections.slice(0, 3)];
    setReflections(kept);
    setLoading(false);
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
    await addDoc(collection(db, 'reflections'), {
      email: session.user.email.toLowerCase(),
      date: new Date().toISOString().split('T')[0],
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
      createdAt: new Date().toISOString(),
    });
    try { await loadReflections(); } catch { /* index may still be building */ }
    setSaving(false);
    setView('list');
    setMatch(''); setMatchIndex(0); setHowGotOut([]); setFeeling(3); setBodyStatus([]); setNutrition([]); setWhatWentRight([]);
    setWhatWentWrong([]); setMindsetWord(''); setNextInningsPlan('');
    setStrengthToBuild(''); setPressureResponse(''); setIntentScore(3); setNotes('');
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
                onClick={() => { if (view !== 'planner') { setView('planner'); if (!plannerLoaded) loadShotPlan(); } else setView('list'); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'planner' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                Shot Planner
              </button>
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
              {view !== 'new' && view !== 'planner' && (
                <button
                  onClick={() => setView('new')}
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
              {loading ? (
                <div className="text-center py-12"><span className="text-gray-500">Loading reflections...</span></div>
              ) : reflections.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/10">
                  <div className="text-5xl mb-4">🏏</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Reflections Yet</h3>
                  <p className="text-gray-400 mb-6">After each match or practice, create a reflection to track your growth.</p>
                  <button onClick={() => setView('new')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-105">
                    Create Your First Reflection
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reflections.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedReflection(r); setView('detail'); }}
                      className="w-full text-left glass rounded-xl p-5 border border-white/10 hover:border-primary-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold text-sm">{r.match}</span>
                        <span className="text-gray-500 text-xs">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>Out: {Array.isArray(r.howGotOut) ? r.howGotOut.join(', ') || 'N/A' : r.howGotOut || 'N/A'}</span>
                        <span>Intent: {r.intentScore}/5</span>
                        <span className="text-primary-400">{r.mindsetWord || '—'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {/* Video Review */}
              <div className="mt-6 glass rounded-xl p-5 border border-accent-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎥</span>
                  <h4 className="text-white font-bold text-sm">Need a Video Review?</h4>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Upload your batting or bowling video to YouTube (unlisted) and share the link with your captain or team group for feedback from TPG Cricket Academy coaching staff.
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">{selectedReflection.match}</h2>
                  <span className="text-gray-500 text-sm">{selectedReflection.date}</span>
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
                  {plannerSaving && <span className="text-accent-400 text-xs">Saving...</span>}
                </div>
                <div className="flex justify-center">
                  <svg viewBox="0 0 200 200" className="w-64 h-64 sm:w-72 sm:h-72">
                    {/* Field circle */}
                    <circle cx="100" cy="100" r="95" fill="#0d3318" stroke="#3d8b4f" strokeWidth="1" />
                    <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.2" />
                    {/* Pitch */}
                    <rect x="96" y="70" width="8" height="40" rx="1" fill="#c4a265" opacity="0.5" />
                    {/* Batter marker */}
                    <circle cx="100" cy="105" r="3" fill="#3b82f6" stroke="#93c5fd" strokeWidth="0.5" />
                    {/* Region segments */}
                    {WAGON_REGIONS.map(r => {
                      const angleRad = (r.angle - 90) * Math.PI / 180;
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
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-3 text-[10px]">
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
              <button onClick={() => setView('list')} className="text-gray-500 text-sm hover:text-primary-400 mb-4 inline-block">&larr; Cancel</button>
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">Match</h3>
                  <select value={match} onChange={e => { setMatch(e.target.value); const m = MATCHES.find(x => x.label === e.target.value); setMatchIndex(m?.index || 0); }} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white text-sm">
                    <option value="" className="bg-gray-900">Select match...</option>
                    {MATCHES.filter(m => isMatchAvailable(m.date)).map(m => <option key={m.label} value={m.label} className="bg-gray-900">{m.label}</option>)}
                    {MATCHES.filter(m => !isMatchAvailable(m.date)).length > 0 && (
                      <option disabled className="bg-gray-900 text-gray-600">── Upcoming (locked) ──</option>
                    )}
                    {MATCHES.filter(m => !isMatchAvailable(m.date)).map(m => <option key={m.label} disabled className="bg-gray-900 text-gray-600">{m.label}</option>)}
                  </select>
                </div>

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

                <button onClick={handleSubmit} disabled={!match || saving} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-xl hover:shadow-primary-500/50 transition-all hover:scale-[1.02] disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save Reflection'}
                </button>
              </div>
            </>
          )}

        </div>
      </section>
    </div>
  );
}
