// Server only. Intake records hold names, emails and phone numbers, so they use
// the Admin SDK from API routes. The browser Firestore client cannot read them:
// firestore.rules denies these collections.
import { randomUUID } from 'crypto';
import { isPlayerNameTaken } from '@/lib/c3h-roster';
import {
  approvedPlayers,
  canSetStatus,
  IntakeAction,
  IntakeKind,
  IntakeRecord,
  memberHasAccess,
  PortalMember,
  recordFromInquiry,
  REGISTRATION_SEASON,
} from '@/lib/c3h-intake';

const INTAKE = 'c3h_intake';
const MEMBERS = 'c3h_members';
const MEMBER_CACHE_MS = 60_000;

export type IntakeStore = {
  list(): Promise<IntakeRecord[]>;
  get(id: string): Promise<IntakeRecord | null>;
  put(record: IntakeRecord): Promise<void>;
  listMembers(): Promise<PortalMember[]>;
  getMember(email: string): Promise<PortalMember | null>;
  putMember(member: PortalMember): Promise<void>;
  deleteMember(email: string): Promise<void>;
};

// Loaded only when needed, so public pages and tests don't load the Admin SDK.
async function firestoreStore(serviceAccountJson: string): Promise<IntakeStore> {
  const { cert, getApps, initializeApp } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  const db = getFirestore(app);
  return {
    async list() {
      const snap = await db.collection(INTAKE).orderBy('createdAt', 'desc').limit(500).get();
      return snap.docs.map(d => d.data() as IntakeRecord);
    },
    async get(id) {
      const doc = await db.collection(INTAKE).doc(id).get();
      return doc.exists ? (doc.data() as IntakeRecord) : null;
    },
    async put(record) {
      await db.collection(INTAKE).doc(record.id).set(record);
    },
    async listMembers() {
      const snap = await db.collection(MEMBERS).get();
      return snap.docs.map(d => d.data() as PortalMember);
    },
    async getMember(email) {
      const doc = await db.collection(MEMBERS).doc(email).get();
      return doc.exists ? (doc.data() as PortalMember) : null;
    },
    async putMember(member) {
      await db.collection(MEMBERS).doc(member.email).set(member);
    },
    async deleteMember(email) {
      await db.collection(MEMBERS).doc(email).delete();
    },
  };
}

export function memoryStore(): IntakeStore {
  const records = new Map<string, IntakeRecord>();
  const members = new Map<string, PortalMember>();
  return {
    list: async () => [...records.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    get: async id => records.get(id) ?? null,
    put: async record => void records.set(record.id, record),
    listMembers: async () => [...members.values()],
    getMember: async email => members.get(email) ?? null,
    putMember: async member => void members.set(member.email, member),
    deleteMember: async email => void members.delete(email),
  };
}

const globals = globalThis as unknown as { __c3hIntakeMemory?: IntakeStore };

// Null until FIREBASE_SERVICE_ACCOUNT_KEY is set. INTAKE_STORE=memory is for
// local testing and is ignored in production.
export async function getIntakeStore(): Promise<IntakeStore | null> {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) return firestoreStore(key);
  if (process.env.NODE_ENV !== 'production' && process.env.INTAKE_STORE === 'memory') {
    globals.__c3hIntakeMemory ??= memoryStore();
    return globals.__c3hIntakeMemory;
  }
  return null;
}

export async function saveInquiry(
  store: IntakeStore,
  kind: IntakeKind,
  values: Record<string, string>,
): Promise<void> {
  await store.put(recordFromInquiry(kind, values, randomUUID(), new Date().toISOString()));
}

export type ActionResult = { ok: true; record: IntakeRecord } | { ok: false; error: string; status: number };

export async function applyIntakeAction(
  store: IntakeStore,
  action: IntakeAction,
  by: string,
  now: string = new Date().toISOString(),
): Promise<ActionResult> {
  if (action.action === 'add') {
    const record: IntakeRecord = {
      id: randomUUID(),
      kind: action.kind,
      status: 'new',
      name: action.name,
      email: action.email,
      phone: action.phone,
      details: {},
      note: action.note,
      portalEmail: '',
      source: 'manual',
      createdAt: now,
      history: [{ at: now, by, action: 'Added by hand' }],
    };
    await store.put(record);
    return { ok: true, record };
  }

  const record = await store.get(action.id);
  if (!record) return { ok: false, error: 'Record not found', status: 404 };
  const log = (text: string) => [...record.history, { at: now, by, action: text }];
  let next: IntakeRecord;

  if (action.action === 'update') {
    if (action.status !== undefined && !canSetStatus(record, action.status)) {
      return { ok: false, error: 'That status change is not allowed', status: 400 };
    }
    next = { ...record };
    const changes: string[] = [];
    if (action.status !== undefined && action.status !== record.status) {
      next.status = action.status;
      changes.push(`Status: ${action.status}`);
    }
    if (action.note !== undefined && action.note !== record.note) {
      next.note = action.note;
      changes.push('Note edited');
    }
    if (!changes.length) return { ok: true, record };
    next.history = log(changes.join(', '));
  } else if (record.kind !== 'player') {
    return { ok: false, error: 'Only players get portal access', status: 400 };
  } else if (action.action === 'grant') {
    if (record.status === 'paid') return { ok: false, error: 'Access is already open', status: 400 };
    if (isPlayerNameTaken(action.name, action.email, approvedPlayers(await store.listMembers()))) {
      return { ok: false, error: 'That name is already in the squad lists. Please add a surname or initial.', status: 409 };
    }
    await store.putMember({
      email: action.email,
      name: action.name,
      season: REGISTRATION_SEASON,
      addedBy: by,
      addedAt: now,
    });
    memberCache.delete(action.email);
    next = {
      ...record,
      status: 'paid',
      portalEmail: action.email,
      history: log(`Confirmed payment, opened portal access for ${action.email} as ${action.name}`),
    };
  } else {
    if (record.status !== 'paid') return { ok: false, error: 'This player has no open access', status: 400 };
    await store.deleteMember(record.portalEmail);
    memberCache.delete(record.portalEmail);
    next = { ...record, status: 'removed', history: log(`Removed portal access for ${record.portalEmail}`) };
  }

  await store.put(next);
  return { ok: true, record: next };
}

// NextAuth re-checks access on every session read, so this is cached. A removal
// reaches other server instances within a minute. If the database cannot be
// reached, the last known answer stands, and an unknown address is refused.
const memberCache = new Map<string, { allowed: boolean; at: number }>();

export async function isPortalMember(
  email: string,
  store?: IntakeStore | null,
  now: number = Date.now(),
): Promise<boolean> {
  const cached = memberCache.get(email);
  if (cached && now - cached.at < MEMBER_CACHE_MS) return cached.allowed;
  try {
    const source = store === undefined ? await getIntakeStore() : store;
    if (!source) return false;
    const allowed = memberHasAccess(await source.getMember(email));
    memberCache.set(email, { allowed, at: now });
    return allowed;
  } catch (error) {
    console.error('Could not check C3H member access', error);
    return cached?.allowed ?? false;
  }
}

export const clearMemberCache = () => memberCache.clear();
