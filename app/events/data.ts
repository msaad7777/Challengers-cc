export type EventType =
  | 'match'
  | 'training'
  | 'social'
  | 'fundraiser'
  | 'meeting'
  | 'awards'
  | 'other';

export interface ClubEvent {
  id: string;
  title: string;
  type: EventType;
  startDate: string; // ISO 8601 with timezone, e.g. '2026-05-10T10:00:00-04:00'
  endDate: string;
  venue: string;
  address?: string;
  description: string;
  opponent?: string;
  league?: string;
  rsvpRequired?: boolean;
  rsvpUrl?: string;
  externalUrl?: string;
  featured?: boolean;
}

// Event data — update this file to add/remove events
// All times in Eastern Time (America/Toronto). Use -04:00 (EDT) during daylight saving,
// -05:00 (EST) outside of it. Ontario DST in 2026: Mar 8 → Nov 1.
export const events: ClubEvent[] = [
  {
    id: 'match-opening-day-2026',
    title: 'Opening Day — Challengers CC vs TBD',
    type: 'match',
    startDate: '2026-05-10T10:00:00-04:00',
    endDate: '2026-05-10T15:00:00-04:00',
    venue: 'Thames Valley Golf Course Cricket Grounds',
    address: '850 Sunninghill Ave, London, ON N6H 3E6',
    description:
      'First match of the 2026 season! Come support the team as we kick off our season. Livestream on YouTube — @Challengersccldn. Families and supporters welcome.',
    league: 'LCL',
    featured: true,
  },
  {
    id: 'training-weekly-tuesday',
    title: 'Weekly Training — Tuesdays',
    type: 'training',
    startDate: '2026-05-12T19:00:00-04:00',
    endDate: '2026-05-12T21:00:00-04:00',
    venue: 'Thames Valley Cricket Grounds',
    address: '850 Sunninghill Ave, London, ON N6H 3E6',
    description:
      'Weekly team training session every Tuesday evening through the 2026 season. Open to all registered players — bring your kit. Indoor practice at Kover Drive during bad weather.',
  },
  {
    id: 'training-weekly-saturday',
    title: 'Weekly Training — Saturdays',
    type: 'training',
    startDate: '2026-05-16T09:00:00-04:00',
    endDate: '2026-05-16T12:00:00-04:00',
    venue: 'Thames Valley Cricket Grounds',
    address: '850 Sunninghill Ave, London, ON N6H 3E6',
    description:
      'Saturday morning team training through the 2026 season. Open to all registered players. Coaching-led sessions covering batting, bowling, and fielding drills.',
  },
  {
    id: 'midseason-bbq-2026',
    title: 'Challengers CC Mid-Season BBQ',
    type: 'social',
    startDate: '2026-07-12T13:00:00-04:00',
    endDate: '2026-07-12T18:00:00-04:00',
    venue: 'Thames Valley Cricket Grounds',
    address: '850 Sunninghill Ave, London, ON N6H 3E6',
    description:
      'Our mid-season BBQ — families, players, sponsors, and friends welcome. Food, cricket, kids activities, and community. Bring your family. Halal and vegetarian options available. Free entry — RSVP so we can plan food.',
    rsvpRequired: true,
    featured: true,
  },
  {
    id: 'youth-fundraiser-2026',
    title: 'Youth Cricket Fundraiser',
    type: 'fundraiser',
    startDate: '2026-08-09T11:00:00-04:00',
    endDate: '2026-08-09T16:00:00-04:00',
    venue: 'Thames Valley Cricket Grounds',
    address: '850 Sunninghill Ave, London, ON N6H 3E6',
    description:
      'Fundraising tournament to support youth cricket development. Community teams welcome to enter. Food, games, silent auction, and prizes. All proceeds support Challengers CC youth programs and equipment.',
    featured: true,
  },
  {
    id: 'awards-dinner-2026',
    title: 'End-of-Season Awards Dinner',
    type: 'awards',
    startDate: '2026-09-20T18:00:00-04:00',
    endDate: '2026-09-20T22:00:00-04:00',
    venue: 'TBD — Scarborough',
    description:
      'Celebrate the 2026 season with team awards, player of the year, sponsor recognition, and community thank-yous. Dinner + program. Open to players, families, sponsors, and supporters. Ticket details closer to date.',
    featured: true,
  },
  {
    id: 'agm-2026',
    title: 'Annual General Meeting (AGM)',
    type: 'meeting',
    startDate: '2026-11-15T18:00:00-05:00',
    endDate: '2026-11-15T20:00:00-05:00',
    venue: 'Virtual (Google Meet)',
    description:
      'Annual General Meeting — open to all registered members. Review of 2026 season, financials, board elections, 2027 planning. Link shared closer to date.',
  },
];

export function getUpcomingEvents(now: Date = new Date()): ClubEvent[] {
  return events
    .filter((e) => new Date(e.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function getPastEvents(now: Date = new Date()): ClubEvent[] {
  return events
    .filter((e) => new Date(e.endDate) < now)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

// Generate a Google Calendar "Add Event" URL
// https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...
export function googleCalendarUrl(event: ClubEvent): string {
  // Convert ISO to Google Calendar format: 20260510T140000Z (UTC)
  const toGCalFormat = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getUTCFullYear().toString().padStart(4, '0') +
      (d.getUTCMonth() + 1).toString().padStart(2, '0') +
      d.getUTCDate().toString().padStart(2, '0') +
      'T' +
      d.getUTCHours().toString().padStart(2, '0') +
      d.getUTCMinutes().toString().padStart(2, '0') +
      '00Z'
    );
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGCalFormat(event.startDate)}/${toGCalFormat(event.endDate)}`,
    details: event.description,
    location: event.address ? `${event.venue}, ${event.address}` : event.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate ICS file content for a single event
// ICS = universal calendar format, works with Apple Calendar, Outlook, etc.
export function generateICS(event: ClubEvent): string {
  const toICSFormat = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getUTCFullYear().toString().padStart(4, '0') +
      (d.getUTCMonth() + 1).toString().padStart(2, '0') +
      d.getUTCDate().toString().padStart(2, '0') +
      'T' +
      d.getUTCHours().toString().padStart(2, '0') +
      d.getUTCMinutes().toString().padStart(2, '0') +
      '00Z'
    );
  };

  const escape = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const now = toICSFormat(new Date().toISOString());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Challengers Cricket Club//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@challengerscc.ca`,
    `DTSTAMP:${now}`,
    `DTSTART:${toICSFormat(event.startDate)}`,
    `DTEND:${toICSFormat(event.endDate)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    `LOCATION:${escape(event.address ? `${event.venue}, ${event.address}` : event.venue)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// Generate ICS for all events (subscribe to entire club calendar)
export function generateAllEventsICS(): string {
  const toICSFormat = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getUTCFullYear().toString().padStart(4, '0') +
      (d.getUTCMonth() + 1).toString().padStart(2, '0') +
      d.getUTCDate().toString().padStart(2, '0') +
      'T' +
      d.getUTCHours().toString().padStart(2, '0') +
      d.getUTCMinutes().toString().padStart(2, '0') +
      '00Z'
    );
  };

  const escape = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const now = toICSFormat(new Date().toISOString());

  const vevents = events.map((event) =>
    [
      'BEGIN:VEVENT',
      `UID:${event.id}@challengerscc.ca`,
      `DTSTAMP:${now}`,
      `DTSTART:${toICSFormat(event.startDate)}`,
      `DTEND:${toICSFormat(event.endDate)}`,
      `SUMMARY:${escape(event.title)}`,
      `DESCRIPTION:${escape(event.description)}`,
      `LOCATION:${escape(event.address ? `${event.venue}, ${event.address}` : event.venue)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n'),
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Challengers Cricket Club//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Challengers Cricket Club',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function formatEventDate(event: ClubEvent): string {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const dateFmt: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const timeFmt: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };
  const dateStr = start.toLocaleDateString('en-CA', dateFmt);
  const startTime = start.toLocaleTimeString('en-CA', timeFmt);
  const endTime = end.toLocaleTimeString('en-CA', timeFmt);
  return `${dateStr} · ${startTime} – ${endTime}`;
}
