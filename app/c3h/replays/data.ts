export interface MatchInnings {
  name: string;
  runs?: number;
  notes?: string;
}

export interface TeamTotal {
  runs: number;
  wickets: number;
  overs: string; // e.g., "30.0" or "29.1"
  allOut?: boolean;
}

export interface MatchReplay {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  opponent: string;
  league?: string;
  venue?: string;
  youtubeUrl: string;
  result?: 'Won' | 'Lost' | 'Tied' | 'No Result' | 'Practice';
  resultDetail?: string; // e.g., "Won by 4 wickets" or "CCC chased 209 in 29.1 overs"
  toss?: string; // e.g., "SCC won the toss and elected to bat"
  summary?: string;
  ourTotal?: TeamTotal;
  oppTotal?: TeamTotal;
  ourBatting?: MatchInnings[];
  oppBatting?: MatchInnings[];
  reflectionPrompt?: string;
}

// Add new replays at the top — newest first
export const matchReplays: MatchReplay[] = [
  {
    id: 'vs-sarnia-cricket-club-apr-2026',
    title: 'Challengers CC vs Sarnia Cricket Club',
    date: '2026-04-26',
    opponent: 'Sarnia Cricket Club',
    venue: 'Sarnia, ON',
    youtubeUrl: 'https://www.youtube.com/watch?v=tSg-RzLFrCQ',
    result: 'Practice',
    resultDetail:
      'Challengers chased the 209 target in 29.1 overs. As a practice match, the innings continued for the full 30 overs — final CCC total 215/7.',
    toss: 'SCC won the toss and elected to bat.',
    summary:
      'Our opening match of the year against Sarnia Cricket Club. Strong batting display from both sides. Watch the full match below and use it for your reflection card in The Nets.',
    ourTotal: { runs: 215, wickets: 7, overs: '30.0' },
    oppTotal: { runs: 208, wickets: 11, overs: '30.0', allOut: true },
    oppBatting: [
      { name: 'Fateh', runs: 35 },
      { name: 'Vishal', runs: 35 },
      { name: 'Arund', runs: 35 },
      { name: 'Swaraj', runs: 28 },
    ],
    ourBatting: [
      { name: 'Shiva', runs: 33 },
      { name: 'Madhu', runs: 27 },
      { name: 'Shivam', runs: 23 },
      { name: 'Shoaib', runs: 23 },
      { name: 'Ankush', runs: 22 },
      { name: 'Manohar', runs: 21 },
      { name: 'Qaiser', runs: 21 },
    ],
    reflectionPrompt:
      'Watch your innings and the bowlers you faced. Note one thing you did well and one thing to improve. Open The Nets to fill out a reflection card while it\'s fresh.',
  },
];

// Extract YouTube video ID from common URL formats
export function youtubeIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:v=|\/embed\/|\.be\/)([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function getReplayBySlug(id: string): MatchReplay | undefined {
  return matchReplays.find((r) => r.id === id);
}
