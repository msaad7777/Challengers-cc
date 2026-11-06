// Sponsor enquiries and player registrations that directors review in C3H.
// Pure so it can be unit-tested. Storage is in c3h-intake-store.ts.
import { isC3HAdmin, resolveDirectorWorkspaceEmail } from '@/lib/c3h-access';
import { ACTIVE_SEASON } from '@/lib/c3h-seasons';

// Registrations open now are for this season. A member approved for it keeps
// portal access until a later season becomes active.
export const REGISTRATION_SEASON = 2027;

export type IntakeKind = 'player' | 'sponsor';

export const INTAKE_STATUSES: Record<IntakeKind, Record<string, string>> = {
  player: {
    new: 'New',
    contacted: 'Contacted, waiting for payment',
    paid: 'Paid, portal access open',
    declined: 'Not joining',
    removed: 'Access removed',
  },
  sponsor: {
    new: 'New',
    contacted: 'Contacted',
    confirmed: 'Confirmed sponsor',
    declined: 'Not going ahead',
  },
};

export type IntakeEvent = { at: string; by: string; action: string };

export type IntakeRecord = {
  id: string;
  kind: IntakeKind;
  status: string;
  name: string;
  email: string;
  phone: string;
  details: Record<string, string>;
  note: string;
  portalEmail: string;
  source: 'website' | 'manual';
  createdAt: string;
  history: IntakeEvent[];
};

export type PortalMember = { email: string; name?: string; season: number; addedBy: string; addedAt: string };

export type IntakeAction =
  | { action: 'add'; kind: IntakeKind; name: string; email: string; phone: string; note: string }
  | { action: 'update'; id: string; status?: string; note?: string }
  | { action: 'grant'; id: string; email: string; name: string }
  | { action: 'revoke'; id: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 5000;

export const normalizeEmail = (email: unknown): string =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

export const isValidEmail = (email: string): boolean => email.length <= 254 && EMAIL.test(email);

export const memberHasAccess = (member: PortalMember | null, activeSeason: number = ACTIVE_SEASON): boolean =>
  !!member && member.season >= activeSeason;

// Portal members with current access, as the Dugout lists them.
export function approvedPlayers(members: PortalMember[], activeSeason: number = ACTIVE_SEASON) {
  return members
    .filter(member => memberHasAccess(member, activeSeason))
    .map(member => ({ email: member.email, name: member.name || member.email.split('@')[0] }));
}

// The numbers directors act on: results first, then the follow-ups that drive them.
export function intakeSummary(records: IntakeRecord[]) {
  const count = (kind: IntakeKind, status: string) =>
    records.filter(record => record.kind === kind && record.status === status).length;
  const newPlayers = count('player', 'new');
  const newSponsors = count('sponsor', 'new');
  const awaitingPayment = count('player', 'contacted');
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const next = [
    newPlayers && `reply to ${plural(newPlayers, 'new player')}`,
    newSponsors && `reply to ${plural(newSponsors, 'new sponsor')}`,
    awaitingPayment && `check payment from ${plural(awaitingPayment, 'player')}`,
  ].filter(Boolean);
  return {
    playersPaid: count('player', 'paid'),
    sponsorsConfirmed: count('sponsor', 'confirmed'),
    newPlayers,
    newSponsors,
    awaitingPayment,
    sponsorsContacted: count('sponsor', 'contacted'),
    nextStep: next.length ? `Next: ${next.join(', ')}.` : 'Nothing is waiting on a director.',
  };
}

// Who may read intake records: admins and directors, by workspace or personal address.
export const canReadIntake = (email?: string | null): boolean =>
  isC3HAdmin(email) || resolveDirectorWorkspaceEmail(email) !== null;

// One key per director, so their workspace and personal addresses share one
// "last opened" time.
export const intakeReaderKey = (email: string): string =>
  resolveDirectorWorkspaceEmail(email) ?? normalizeEmail(email);

// The dashboard badge. `waiting` is every enquiry still marked New, the same
// for all directors, and drops when anyone follows up. `unread` is what reached
// the website since this director last opened the page and is still New.
export function intakeBadge(records: IntakeRecord[], lastSeen: string | null) {
  const fresh = records.filter(record => record.status === 'new');
  return {
    waiting: fresh.length,
    unread: fresh.filter(record => record.source === 'website' && (!lastSeen || record.createdAt > lastSeen)).length,
  };
}

// The "last opened" time to store: the page's load time if it is valid and not
// in the future, otherwise now. Never earlier than what is stored, so an old
// tab cannot bring back items already read in a newer one.
export function nextSeenAt(value: unknown, previous: string | null, now: Date = new Date()): string {
  const at = typeof value === 'string' ? new Date(value) : null;
  const candidate = at && !Number.isNaN(at.getTime()) && at <= now ? at.toISOString() : now.toISOString();
  return previous && previous > candidate ? previous : candidate;
}

const text = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length <= MAX_TEXT ? trimmed : null;
};

// Turns an untrusted request body into an action, or null if it is not valid.
export function parseIntakeAction(body: unknown): IntakeAction | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  if (b.action === 'add') {
    if (b.kind !== 'player' && b.kind !== 'sponsor') return null;
    const name = text(b.name);
    const email = normalizeEmail(b.email);
    const phone = text(b.phone ?? '');
    const note = text(b.note ?? '');
    if (!name || !isValidEmail(email) || phone === null || note === null) return null;
    return { action: 'add', kind: b.kind, name, email, phone, note };
  }

  const id = text(b.id);
  if (!id) return null;

  if (b.action === 'update') {
    const note = b.note === undefined ? undefined : text(b.note);
    if (note === null) return null;
    if (b.status !== undefined && typeof b.status !== 'string') return null;
    if (b.status === undefined && note === undefined) return null;
    return { action: 'update', id, status: b.status, note };
  }
  if (b.action === 'grant') {
    const email = normalizeEmail(b.email);
    const name = text(b.name);
    return isValidEmail(email) && name ? { action: 'grant', id, email, name } : null;
  }
  if (b.action === 'revoke') return { action: 'revoke', id };
  return null;
}

// Status changes that open or close portal access must go through grant and
// revoke, so a status on its own can never disagree with who can sign in.
export function canSetStatus(record: IntakeRecord, status: string): boolean {
  if (!Object.hasOwn(INTAKE_STATUSES[record.kind], status)) return false;
  if (record.kind !== 'player') return true;
  return record.status !== 'paid' && status !== 'paid' && status !== 'removed';
}

export function recordFromInquiry(
  kind: IntakeKind,
  values: Record<string, string>,
  id: string,
  now: string,
): IntakeRecord {
  const { name, organizationName, contactName, email, phone, ...rest } = values;
  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(rest)) if (value) details[key] = value;
  if (kind === 'sponsor' && contactName) details.contactName = contactName;
  return {
    id,
    kind,
    status: 'new',
    name: (kind === 'sponsor' ? organizationName : name) || '',
    email: normalizeEmail(email),
    phone: phone || '',
    details,
    note: '',
    portalEmail: '',
    source: 'website',
    createdAt: now,
    history: [{ at: now, by: 'website form', action: 'Submitted' }],
  };
}
