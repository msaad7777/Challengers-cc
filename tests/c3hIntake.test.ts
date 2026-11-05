import { beforeEach, describe, expect, it } from 'vitest';
import {
  approvedPlayers,
  canSetStatus,
  intakeSummary,
  IntakeRecord,
  memberHasAccess,
  parseIntakeAction,
  recordFromInquiry,
  REGISTRATION_SEASON,
} from '@/lib/c3h-intake';
import { mergeApprovedPlayers, PLAYER_ROSTER } from '@/lib/c3h-roster';
import { applyIntakeAction, clearMemberCache, IntakeStore, isPortalMember, memoryStore } from '@/lib/c3h-intake-store';

const player = (): IntakeRecord =>
  recordFromInquiry(
    'player',
    { name: 'New Player', email: 'New@Example.com', phone: '000', skillLevel: 'Beginner', gamesCommitted: '13' },
    'p1',
    '2026-11-04T00:00:00.000Z',
  );

describe('recordFromInquiry', () => {
  it('splits contact details from the rest and lowercases the email', () => {
    const r = player();
    expect(r).toMatchObject({ name: 'New Player', email: 'new@example.com', phone: '000', status: 'new' });
    expect(r.details).toEqual({ skillLevel: 'Beginner', gamesCommitted: '13' });
  });

  it('names a sponsor by business and keeps the contact person', () => {
    const r = recordFromInquiry(
      'sponsor',
      { organizationName: 'Biz', contactName: 'Pat', email: 'a@b.ca', phone: '1', sponsorshipLevel: 'Custom Package' },
      's1',
      '2026-11-04T00:00:00.000Z',
    );
    expect(r.name).toBe('Biz');
    expect(r.details).toEqual({ contactName: 'Pat', sponsorshipLevel: 'Custom Package' });
  });
});

describe('parseIntakeAction', () => {
  it('accepts valid actions and lowercases a granted email', () => {
    expect(parseIntakeAction({ action: 'grant', id: 'x', email: ' A@B.ca ', name: ' New ' })).toEqual({ action: 'grant', id: 'x', email: 'a@b.ca', name: 'New' });
    expect(parseIntakeAction({ action: 'revoke', id: 'x' })).toEqual({ action: 'revoke', id: 'x' });
    expect(parseIntakeAction({ action: 'update', id: 'x', note: '' })).toEqual({ action: 'update', id: 'x', status: undefined, note: '' });
  });

  it('rejects invalid requests', () => {
    expect(parseIntakeAction(null)).toBeNull();
    expect(parseIntakeAction({ action: 'grant', id: 'x', email: 'nope', name: 'A' })).toBeNull();
    expect(parseIntakeAction({ action: 'grant', id: 'x', email: 'a@b.ca' })).toBeNull();
    expect(parseIntakeAction({ action: 'update', id: 'x' })).toBeNull();
    expect(parseIntakeAction({ action: 'add', kind: 'other', name: 'A', email: 'a@b.ca' })).toBeNull();
    expect(parseIntakeAction({ action: 'delete', id: 'x' })).toBeNull();
    expect(parseIntakeAction({ action: 'revoke' })).toBeNull();
  });
});

describe('canSetStatus', () => {
  it('keeps access statuses behind grant and revoke', () => {
    const r = player();
    expect(canSetStatus(r, 'contacted')).toBe(true);
    expect(canSetStatus(r, 'paid')).toBe(false);
    expect(canSetStatus(r, 'removed')).toBe(false);
    expect(canSetStatus({ ...r, status: 'paid' }, 'declined')).toBe(false);
    expect(canSetStatus(r, 'constructor')).toBe(false);
  });
});

describe('memberHasAccess', () => {
  const member = { email: 'a@b.ca', season: 2027, addedBy: 'd', addedAt: '' };
  it('lasts through the approved season only', () => {
    expect(memberHasAccess(member, 2026)).toBe(true);
    expect(memberHasAccess(member, 2027)).toBe(true);
    expect(memberHasAccess(member, 2028)).toBe(false);
    expect(memberHasAccess(null, 2026)).toBe(false);
  });
});

describe('approvedPlayers', () => {
  const m = (email: string, season: number, name?: string) => ({ email, name, season, addedBy: 'd', addedAt: '' });
  it('lists current members and falls back to the email name', () => {
    expect(approvedPlayers([m('a@x.ca', 2027, 'Ann'), m('old@x.ca', 2025, 'Old'), m('bob@x.ca', 2027)], 2026)).toEqual([
      { email: 'a@x.ca', name: 'Ann' },
      { email: 'bob@x.ca', name: 'bob' },
    ]);
  });
});

describe('mergeApprovedPlayers', () => {
  it('adds approved players without touching the code roster', () => {
    const { emailToPlayer, allPlayers } = mergeApprovedPlayers([{ email: 'new@x.ca', name: 'Zed Newplayer' }]);
    expect(emailToPlayer['new@x.ca']).toBe('Zed Newplayer');
    expect(allPlayers).toContain('Zed Newplayer');
    expect(allPlayers.length).toBe(PLAYER_ROSTER.length + 1);
    expect(PLAYER_ROSTER).not.toContain('Zed Newplayer');
  });
});

describe('portal access', () => {
  let store: IntakeStore;

  beforeEach(async () => {
    clearMemberCache();
    store = memoryStore();
    await store.put(player());
  });

  it('opens access with a record of who did it, then removes it', async () => {
    expect(await isPortalMember('login@gmail.com', store)).toBe(false);
    clearMemberCache();

    const granted = await applyIntakeAction(store, { action: 'grant', id: 'p1', email: 'login@gmail.com', name: 'Zed Newplayer' }, 'director@x.ca');
    expect(granted).toMatchObject({ ok: true, record: { status: 'paid', portalEmail: 'login@gmail.com' } });
    expect(await store.getMember('login@gmail.com')).toMatchObject({ addedBy: 'director@x.ca', season: REGISTRATION_SEASON });
    expect(await isPortalMember('login@gmail.com', store)).toBe(true);

    const revoked = await applyIntakeAction(store, { action: 'revoke', id: 'p1' }, 'director@x.ca');
    expect(revoked).toMatchObject({ ok: true, record: { status: 'removed' } });
    expect(await isPortalMember('login@gmail.com', store)).toBe(false);
    expect((await store.get('p1'))?.history.map(h => h.by)).toEqual(['website form', 'director@x.ca', 'director@x.ca']);
  });

  it('refuses access for sponsors and a status shortcut to paid', async () => {
    await store.put({ ...player(), id: 's1', kind: 'sponsor' });
    expect(await applyIntakeAction(store, { action: 'grant', id: 's1', email: 'a@b.ca', name: 'Zed' }, 'd')).toMatchObject({ ok: false });
    expect(await applyIntakeAction(store, { action: 'update', id: 'p1', status: 'paid' }, 'd')).toMatchObject({ ok: false });
    expect(await store.getMember('a@b.ca')).toBeNull();
  });

  it('refuses a name another player already has', async () => {
    await store.putMember({ email: 'first@x.ca', name: 'Zed Newplayer', season: 2027, addedBy: 'd', addedAt: '' });
    const taken = await applyIntakeAction(store, { action: 'grant', id: 'p1', email: 'second@x.ca', name: 'zed newplayer' }, 'd');
    expect(taken).toMatchObject({ ok: false, status: 409 });
    expect(await store.getMember('second@x.ca')).toBeNull();
    const roster = await applyIntakeAction(store, { action: 'grant', id: 'p1', email: 'second@x.ca', name: PLAYER_ROSTER[0] }, 'd');
    expect(roster).toMatchObject({ ok: false, status: 409 });
  });

  it('refuses an unknown record', async () => {
    expect(await applyIntakeAction(store, { action: 'revoke', id: 'none' }, 'd')).toMatchObject({ ok: false, status: 404 });
  });

  it('refuses without storage or when an unknown address cannot be checked', async () => {
    expect(await isPortalMember('a@b.ca', null)).toBe(false);
    const broken = { ...store, getMember: async () => { throw new Error('down'); } };
    expect(await isPortalMember('a@b.ca', broken)).toBe(false);
  });

  it('caches an answer for a minute', async () => {
    const t = 1_000_000;
    expect(await isPortalMember('a@b.ca', store, t)).toBe(false);
    await store.putMember({ email: 'a@b.ca', season: 2027, addedBy: 'd', addedAt: '' });
    expect(await isPortalMember('a@b.ca', store, t + 59_000)).toBe(false);
    expect(await isPortalMember('a@b.ca', store, t + 61_000)).toBe(true);
  });
});

describe('intakeSummary', () => {
  const r = (kind: 'player' | 'sponsor', status: string) => ({ kind, status }) as IntakeRecord;

  it('counts results and says what to do next', () => {
    const summary = intakeSummary([
      r('player', 'paid'), r('player', 'new'), r('player', 'new'), r('player', 'contacted'),
      r('sponsor', 'confirmed'), r('sponsor', 'new'), r('player', 'declined'),
    ]);
    expect(summary).toMatchObject({ playersPaid: 1, sponsorsConfirmed: 1, newPlayers: 2, newSponsors: 1, awaitingPayment: 1 });
    expect(summary.nextStep).toBe('Next: reply to 2 new players, reply to 1 new sponsor, check payment from 1 player.');
  });

  it('says so when nothing is waiting', () => {
    expect(intakeSummary([r('player', 'paid')]).nextStep).toBe('Nothing is waiting on a director.');
  });
});
