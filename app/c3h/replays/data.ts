export interface MatchInnings {
  name: string;
  runs?: number;
  notes?: string;
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
  summary?: string;
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
    summary:
      'Our opening match of the year against Sarnia Cricket Club. Strong batting display from both sides — multiple Challengers reached 20+. Watch the full match below and use it for your reflection card in The Nets.',
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
