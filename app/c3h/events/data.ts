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
  // RRULE fragment without "RRULE:" prefix, e.g.
  // 'FREQ=WEEKLY;BYDAY=WE;UNTIL=20260831T235959Z' for weekly Wednesday through Aug 31
  recurrenceRule?: string;
}

// Event data — update this file to add/remove events
// All times in Eastern Time (America/Toronto). Use -04:00 (EDT) during daylight saving,
// -05:00 (EST) outside of it. Ontario DST in 2026: Mar 8 → Nov 1.
export const events: ClubEvent[] = [
  {
    id: 'training-weekly-wednesday',
    title: 'Weekly Training — Wednesdays',
    type: 'training',
    startDate: '2026-04-29T19:00:00-04:00',
    endDate: '2026-04-29T20:30:00-04:00',
    venue: 'Silverwoods Cricket Ground',
    address: 'Silverwoods Cricket Ground, London, ON',
    description:
      'Weekly team training — every Wednesday, 7:00 PM to 8:30 PM at Silverwoods Cricket Ground. Running through the end of August 2026. Open to all registered players — bring your kit. Coaching-led sessions covering batting, bowling, and fielding.',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=WE;UNTIL=20260831T235959Z',
  },
];

// Extract UNTIL date from RRULE (e.g., 'UNTIL=20260831T235959Z') as a Date
function getRecurrenceUntil(rule: string): Date | null {
  const match = rule.match(/UNTIL=(\d{8}T\d{6}Z?)/);
  if (!match) return null;
  const u = match[1];
  const iso = `${u.slice(0, 4)}-${u.slice(4, 6)}-${u.slice(6, 8)}T${u.slice(9, 11)}:${u.slice(11, 13)}:${u.slice(13, 15)}Z`;
  return new Date(iso);
}

// An event's effective end: for recurring events, the UNTIL date; otherwise the endDate.
function getEffectiveEnd(event: ClubEvent): Date {
  if (event.recurrenceRule) {
    const until = getRecurrenceUntil(event.recurrenceRule);
    if (until) return until;
  }
  return new Date(event.endDate);
}

export function getUpcomingEvents(now: Date = new Date()): ClubEvent[] {
  return events
    .filter((e) => getEffectiveEnd(e) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function getPastEvents(now: Date = new Date()): ClubEvent[] {
  return events
    .filter((e) => getEffectiveEnd(e) < now)
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

  if (event.recurrenceRule) {
    params.append('recur', `RRULE:${event.recurrenceRule}`);
  }

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

  const lines = [
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
  ];

  if (event.recurrenceRule) {
    lines.push(`RRULE:${event.recurrenceRule}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
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

  const vevents = events.map((event) => {
    const parts = [
      'BEGIN:VEVENT',
      `UID:${event.id}@challengerscc.ca`,
      `DTSTAMP:${now}`,
      `DTSTART:${toICSFormat(event.startDate)}`,
      `DTEND:${toICSFormat(event.endDate)}`,
      `SUMMARY:${escape(event.title)}`,
      `DESCRIPTION:${escape(event.description)}`,
      `LOCATION:${escape(event.address ? `${event.venue}, ${event.address}` : event.venue)}`,
      'STATUS:CONFIRMED',
    ];
    if (event.recurrenceRule) {
      parts.push(`RRULE:${event.recurrenceRule}`);
    }
    parts.push('END:VEVENT');
    return parts.join('\r\n');
  });

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
  const timeFmt: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  };
  const startTime = start.toLocaleTimeString('en-CA', timeFmt);
  const endTime = end.toLocaleTimeString('en-CA', timeFmt);

  // Recurring event: show frequency + day of week + end date
  if (event.recurrenceRule) {
    const dayNames: Record<string, string> = {
      MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday', TH: 'Thursday',
      FR: 'Friday', SA: 'Saturday', SU: 'Sunday',
    };
    const byDayMatch = event.recurrenceRule.match(/BYDAY=([A-Z,]+)/);
    const dayCode = byDayMatch?.[1].split(',')[0] ?? '';
    const dayName = dayNames[dayCode] ?? 'week';
    const until = getRecurrenceUntil(event.recurrenceRule);
    const untilStr = until
      ? until.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    return `Every ${dayName} · ${startTime} – ${endTime}${untilStr ? ` · Until ${untilStr}` : ''}`;
  }

  const dateFmt: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const dateStr = start.toLocaleDateString('en-CA', dateFmt);
  return `${dateStr} · ${startTime} – ${endTime}`;
}

// Convert a schedule match to an ad-hoc ClubEvent (used by /schedule page to
// generate calendar links). Assumes Ontario EDT (-04:00) during match season.
// Match duration defaults to 5 hours (T30 with breaks).
export function matchDetailsToEvent(params: {
  league?: string;
  matchNumber: number;
  date: string; // 'May 10, 2026'
  time: string; // '1:00 PM'
  opponent: string;
  venue: string;
  durationHours?: number;
}): ClubEvent {
  const months: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12',
  };
  const cleanDate = params.date.replace(',', '');
  const [monthName, dayStr, yearStr] = cleanDate.split(' ');
  const month = months[monthName] ?? '01';
  const day = dayStr.padStart(2, '0');
  const year = yearStr;

  const timeMatch = params.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hour = timeMatch ? parseInt(timeMatch[1], 10) : 10;
  const minute = timeMatch ? timeMatch[2] : '00';
  const period = timeMatch ? timeMatch[3].toUpperCase() : 'AM';
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const startHour = hour.toString().padStart(2, '0');
  const endHour = ((hour + (params.durationHours ?? 5)) % 24).toString().padStart(2, '0');

  const startDate = `${year}-${month}-${day}T${startHour}:${minute}:00-04:00`;
  const endDate = `${year}-${month}-${day}T${endHour}:${minute}:00-04:00`;

  const leaguePrefix = params.league ? `${params.league} ` : '';
  const title = `Challengers CC vs ${params.opponent}`;
  const description = `${leaguePrefix}Match ${params.matchNumber}: Challengers Cricket Club vs ${params.opponent} at ${params.venue}. Follow live on YouTube @Challengersccldn (when streaming). Full schedule at challengerscc.ca/schedule.`;

  return {
    id: `${(params.league ?? 'match').toLowerCase()}-${params.matchNumber}-${params.date.replace(/[^0-9]/g, '')}`,
    title,
    type: 'match',
    startDate,
    endDate,
    venue: params.venue,
    description,
    opponent: params.opponent,
    league: params.league,
  };
}
