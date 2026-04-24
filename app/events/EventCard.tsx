'use client';

import { type ClubEvent, googleCalendarUrl, generateICS, formatEventDate } from './data';

const typeLabels: Record<ClubEvent['type'], string> = {
  match: 'Match',
  training: 'Training',
  social: 'Social',
  fundraiser: 'Fundraiser',
  meeting: 'Meeting',
  awards: 'Awards',
  other: 'Event',
};

const typeColors: Record<ClubEvent['type'], string> = {
  match: 'bg-primary-500/20 border-primary-500/50 text-primary-300',
  training: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  social: 'bg-accent-500/20 border-accent-500/50 text-accent-300',
  fundraiser: 'bg-red-500/20 border-red-500/50 text-red-300',
  meeting: 'bg-gray-500/20 border-gray-500/50 text-gray-300',
  awards: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  other: 'bg-white/10 border-white/20 text-white',
};

export default function EventCard({ event, isPast = false }: { event: ClubEvent; isPast?: boolean }) {
  const downloadICS = () => {
    const ics = generateICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const directionsUrl = event.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`
    : null;

  return (
    <div
      className={`glass rounded-2xl p-6 md:p-8 border transition-all duration-300 ${
        isPast ? 'opacity-60 border-white/10' : 'border-white/10 hover:border-primary-500/40'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${typeColors[event.type]}`}
            >
              {typeLabels[event.type]}
            </span>
            {event.featured && !isPast && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-accent-500/50 bg-accent-500/20 text-accent-300 text-xs font-semibold uppercase tracking-wider">
                Featured
              </span>
            )}
            {event.league && (
              <span className="text-xs text-gray-400 font-medium">{event.league}</span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{event.title}</h3>
          <p className="text-sm text-primary-400 font-medium mb-1">{formatEventDate(event)}</p>
          <p className="text-sm text-gray-400">
            {event.venue}
            {event.address && <span className="text-gray-500"> · {event.address}</span>}
          </p>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed mb-6">{event.description}</p>

      {!isPast && (
        <div className="flex flex-wrap gap-2">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg text-sm font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Google Calendar
          </a>
          <button
            onClick={downloadICS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg text-sm font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .ics
          </button>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg text-sm font-semibold transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Directions
            </a>
          )}
          {event.rsvpUrl && (
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 rounded-lg text-sm font-semibold shadow-xl hover:shadow-accent-500/50 transition-all duration-300 hover:scale-105"
            >
              RSVP
            </a>
          )}
          {event.rsvpRequired && !event.rsvpUrl && (
            <a
              href="mailto:contact@challengerscc.ca?subject=RSVP — {event.title}"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 rounded-lg text-sm font-semibold shadow-xl hover:shadow-accent-500/50 transition-all duration-300 hover:scale-105"
            >
              RSVP via Email
            </a>
          )}
          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg text-sm font-semibold transition-all"
            >
              More Info
            </a>
          )}
        </div>
      )}
    </div>
  );
}
