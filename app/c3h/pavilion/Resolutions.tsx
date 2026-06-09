"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseAuthReady } from '@/lib/firebase';
import { C3H_DIRECTOR_ROSTER, C3H_OFFICER_ROSTER } from '@/lib/c3h-access';

const COLLECTION = 'board_resolutions';

// ── CNCA-aligned resolution templates ────────────────────────────────
// Quick-start templates for common Board actions, with motion text
// drafted to be compliant with the Canada Not-for-profit Corporations
// Act and the Corporation's bylaws. Selecting a template pre-fills the
// propose form; the director can edit anything before submitting.
//
// Sources:
//   CNCA s. 142(2) — Board may remove an officer at any time by
//                    resolution
//   CNCA s. 144(1) — Resolution in writing signed by all directors
//                    is as valid as a resolution passed at a meeting
//   Bylaws Art. 4.6 — Officer appointment + removal
//   Bylaws Art. 3.6 — Board review of officer conduct
type OfficerRemovalVars = {
  officerName: string;
  officeTitle: string;
  reasonSummary: string;
};

function buildOfficerRemovalText(v: OfficerRemovalVars): { title: string; description: string } {
  return {
    title: `Removal from office — ${v.officerName} (${v.officeTitle})`,
    description: `RESOLUTION OF THE BOARD OF DIRECTORS

Pursuant to subsection 142(2) of the Canada Not-for-profit Corporations Act (CNCA) and Article 4.6 of the Corporation's Bylaws, the Directors of Challengers Cricket Club (Corporation #1746974-8) hereby RESOLVE that:

${v.officerName}, currently holding the office of ${v.officeTitle}, is hereby removed from that office effective immediately upon passage of this resolution.

The Corporation acknowledges that:
(1) The Board has the authority to remove an officer at any time, by resolution, under CNCA s. 142(2) and the Bylaws.
(2) This removal does not affect any other status the person holds with the Corporation (e.g., membership or volunteer roles), which are governed separately by the Bylaws.
(3) The duties of ${v.officeTitle} shall revert to the Board until a successor is appointed by Board resolution under Article 4.6.

REASON FOR REMOVAL:
${v.reasonSummary}

EFFECTIVE DATE:
Upon passage by majority vote of the Directors at a meeting, or upon written resolution signed by all Directors pursuant to CNCA s. 144(1), whichever occurs first.`,
  };
}

type Vote = {
  voterName: string;
  voterEmail: string;       // canonical (workspace)
  voterLoginEmail?: string;
  vote: 'yes' | 'no' | 'abstain';
  comment?: string;
  votedAt: Timestamp | null;
};

type Resolution = {
  id: string;
  title: string;
  description: string;
  category: 'officer-review' | 'financial' | 'governance' | 'membership' | 'general';
  proposedByEmail: string;
  proposedByName: string;
  proposedAt: Timestamp | null;
  deadline: Timestamp | null;
  status: 'open' | 'closed';
  recusedEmails?: string[];
  closedAt?: Timestamp | null;
  closedNote?: string;
  votes?: Record<string, Vote>;
};

const CATEGORY_LABELS: Record<Resolution['category'], string> = {
  'officer-review': '👔 Officer review',
  financial: '💰 Financial',
  governance: '🏛️ Governance',
  membership: '🎫 Membership',
  general: '📝 General',
};

function fmtDate(t?: Timestamp | null): string {
  if (!t) return '—';
  return t.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isExpired(deadline: Timestamp | null | undefined): boolean {
  if (!deadline) return false;
  return deadline.toDate().getTime() < Date.now();
}

type Props = {
  userEmail: string;
  userWorkspaceEmail: string;
  userName: string;
  // True only for directors. Officers and other read-only viewers see
  // the resolutions list but cannot propose, vote, or close.
  canVote?: boolean;
};

export default function Resolutions({
  userEmail, userWorkspaceEmail, userName, canVote = true,
}: Props) {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [voting, setVoting] = useState<Record<string, { vote: Vote['vote']; comment: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    firebaseAuthReady().then(() => {
      const q = query(collection(db, COLLECTION), orderBy('proposedAt', 'desc'));
      unsub = onSnapshot(q, (snap) => {
        const list: Resolution[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Resolution, 'id'>) });
        });
        setResolutions(list);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
    return () => { if (unsub) unsub(); };
  }, []);

  const open = resolutions.filter((r) => r.status === 'open');
  const closed = resolutions.filter((r) => r.status === 'closed');

  const submitVote = async (res: Resolution, vote: Vote['vote'], comment: string) => {
    setBusy(res.id);
    try {
      const path = `votes.${userWorkspaceEmail.replace(/[^a-z0-9]/gi, '_')}`;
      await updateDoc(doc(db, COLLECTION, res.id), {
        [path]: {
          voterName: userName,
          voterEmail: userWorkspaceEmail,
          voterLoginEmail: userEmail.toLowerCase(),
          vote,
          comment: comment.trim() || null,
          votedAt: serverTimestamp(),
        },
      });
      setVoting((v) => ({ ...v, [res.id]: { vote, comment: '' } }));
    } finally {
      setBusy(null);
    }
  };

  const closeResolution = async (res: Resolution) => {
    if (!confirm('Close this resolution? No further votes will be accepted.')) return;
    setBusy(res.id);
    try {
      await updateDoc(doc(db, COLLECTION, res.id), {
        status: 'closed',
        closedAt: serverTimestamp(),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Board Resolutions</h2>
          <p className="text-sm text-gray-400 mt-1">
            Formal record of decisions made by the Directors of the Corporation pursuant to the Bylaws and the{' '}
            <em>Canada Not-for-profit Corporations Act</em>. Use this space for matters the bylaws or Board-adopted
            policies place at the Board level — for example, appointment or removal of officers, captains, and committee
            chairs (Bylaws Art. 4.6); adoption or amendment of internal policies (Financial, Code of Conduct, Conflict
            of Interest); spending authorisations outside an approved budget; review of officer conduct under Bylaws
            Art. 3.6; and other matters expressly reserved to the Board.
          </p>
          <p className="text-xs text-gray-500 mt-2 italic">
            Note: amendments to the Bylaws or to the Articles of Incorporation are <strong>not</strong> Board
            resolutions — those require a <strong>special resolution of the members</strong> under{' '}
            <em>CNCA s. 197</em>. Each Board resolution records each Director&apos;s vote, optional comment, and a
            server-side timestamp in an append-only ledger.
          </p>
        </div>
        {canVote && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all"
          >
            {showForm ? 'Cancel' : '+ Propose resolution'}
          </button>
        )}
      </div>

      {showForm && (
        <ResolutionForm
          userEmail={userEmail}
          userWorkspaceEmail={userWorkspaceEmail}
          userName={userName}
          onCreated={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading resolutions…</p>
      ) : (
        <>
          <h3 className="text-sm uppercase tracking-wider text-primary-400 font-bold mt-6 mb-3">
            Open ({open.length})
          </h3>
          {open.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No open resolutions. Propose one above to start.</p>
          ) : (
            <div className="space-y-3">
              {open.map((r) => (
                <ResolutionCard
                  key={r.id}
                  res={r}
                  expanded={expandedId === r.id}
                  onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  userEmail={userEmail}
                  userWorkspaceEmail={userWorkspaceEmail}
                  userName={userName}
                  voting={voting[r.id] ?? { vote: 'yes', comment: '' }}
                  setVoting={(v) => setVoting((prev) => ({ ...prev, [r.id]: v }))}
                  onVote={(vote, comment) => submitVote(r, vote, comment)}
                  onClose={() => closeResolution(r)}
                  busy={busy === r.id}
                  roleCanVote={canVote}
                />
              ))}
            </div>
          )}

          <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold mt-8 mb-3">
            Closed ({closed.length})
          </h3>
          {closed.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No closed resolutions yet.</p>
          ) : (
            <div className="space-y-3">
              {closed.map((r) => (
                <ResolutionCard
                  key={r.id}
                  res={r}
                  expanded={expandedId === r.id}
                  onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  userEmail={userEmail}
                  userWorkspaceEmail={userWorkspaceEmail}
                  userName={userName}
                  voting={{ vote: 'yes', comment: '' }}
                  setVoting={() => {}}
                  onVote={() => {}}
                  onClose={() => {}}
                  busy={false}
                  roleCanVote={canVote}
                />
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-[11px] text-gray-500 mt-6 italic">
        Suggested practice: where the Board chooses to conduct routine officer reviews, a quarterly cadence (Q1–Q4)
        with additional reviews at season transitions can be a useful structure — this is a suggestion, not a
        Board-adopted policy. Title each resolution clearly (e.g. &ldquo;Q3 2026 — Treasurer review&rdquo; or
        &ldquo;Adoption — Financial Policy expense-threshold clause&rdquo;) so the record is searchable.
      </p>
    </div>
  );
}

// ── Card for a single resolution ──────────────────────────────────────

function ResolutionCard({
  res, expanded, onToggle,
  userEmail, userWorkspaceEmail, userName,
  voting, setVoting, onVote, onClose, busy,
  roleCanVote,
}: {
  res: Resolution;
  expanded: boolean;
  onToggle: () => void;
  userEmail: string;
  userWorkspaceEmail: string;
  userName: string;
  voting: { vote: Vote['vote']; comment: string };
  setVoting: (v: { vote: Vote['vote']; comment: string }) => void;
  onVote: (vote: Vote['vote'], comment: string) => void;
  onClose: () => void;
  busy: boolean;
  // Role-based voting permission. False for officers / read-only viewers,
  // true for directors. Combines with the existing per-resolution
  // canVote (open + not recused + not expired) below.
  roleCanVote: boolean;
}) {
  const votes = res.votes ?? {};
  const allDirectors = C3H_DIRECTOR_ROSTER;
  const recused = res.recusedEmails ?? [];
  const required = allDirectors.filter((d) => !recused.includes(d.workspaceEmail));

  const tally = useMemo(() => {
    let yes = 0, no = 0, abstain = 0;
    Object.values(votes).forEach((v) => {
      if (v.vote === 'yes') yes++;
      else if (v.vote === 'no') no++;
      else abstain++;
    });
    return { yes, no, abstain, total: yes + no + abstain };
  }, [votes]);

  const myVote = useMemo(() => {
    return Object.values(votes).find(
      (v) => v.voterEmail === userWorkspaceEmail || v.voterLoginEmail === userEmail.toLowerCase(),
    );
  }, [votes, userWorkspaceEmail, userEmail]);

  const isProposer = res.proposedByEmail === userWorkspaceEmail;
  const isRecused = recused.includes(userWorkspaceEmail);
  const expired = isExpired(res.deadline);
  // Final voting permission combines role (director vs officer/read-only)
  // with per-resolution state (open + not recused + not expired).
  const canVote = roleCanVote && res.status === 'open' && !isRecused && !expired;
  const passedThreshold = tally.yes > required.length / 2;

  return (
    <div className="rounded-xl bg-white/3 border border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-white/5 rounded-xl transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
              {CATEGORY_LABELS[res.category]}
            </span>
            {res.status === 'closed' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">
                Closed
              </span>
            )}
            {res.status === 'open' && expired && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Expired
              </span>
            )}
          </div>
          <h4 className="text-white font-bold mt-2">{res.title}</h4>
          <p className="text-xs text-gray-500 mt-1">
            Proposed by {res.proposedByName} · {fmtDate(res.proposedAt)}
            {res.deadline ? ` · Deadline ${fmtDate(res.deadline)}` : ''}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs">
            <span className="text-primary-400 font-semibold">{tally.yes} yes</span>
            <span className="text-gray-400"> · </span>
            <span className="text-red-400 font-semibold">{tally.no} no</span>
            <span className="text-gray-400"> · </span>
            <span className="text-gray-400 font-semibold">{tally.abstain} abstain</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {tally.total} of {required.length} directors voted
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 space-y-4">
          <p className="text-sm text-gray-300 whitespace-pre-wrap mt-3">{res.description}</p>

          {/* Vote tally bar */}
          {tally.total > 0 && (
            <div className="rounded-lg bg-black/30 border border-white/5 p-3 space-y-2">
              <div className="text-xs text-gray-500">Current tally</div>
              <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                {tally.yes > 0 && <div style={{ flex: tally.yes }} className="bg-primary-500" />}
                {tally.no > 0 && <div style={{ flex: tally.no }} className="bg-red-500" />}
                {tally.abstain > 0 && <div style={{ flex: tally.abstain }} className="bg-gray-500" />}
              </div>
              <div className="text-xs text-gray-400">
                {passedThreshold ? '✓ Majority of required directors in favour' : 'Awaiting majority'}
              </div>
            </div>
          )}

          {/* Per-director vote list */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Director votes
            </div>
            <div className="space-y-1">
              {allDirectors.map((d) => {
                const v = votes[d.workspaceEmail.replace(/[^a-z0-9]/gi, '_')];
                const isThisRecused = recused.includes(d.workspaceEmail);
                return (
                  <div
                    key={d.workspaceEmail}
                    className="flex items-center justify-between gap-3 text-sm rounded px-2 py-1.5 bg-white/3"
                  >
                    <div className="min-w-0">
                      <span className="text-white">{d.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{d.role}</span>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {isThisRecused ? (
                        <span className="text-xs text-amber-300">Recused</span>
                      ) : v ? (
                        <div>
                          <span className={`text-xs font-semibold ${
                            v.vote === 'yes' ? 'text-primary-400' :
                            v.vote === 'no' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {v.vote === 'yes' ? '✓ Yes' : v.vote === 'no' ? '✗ No' : '— Abstain'}
                          </span>
                          {v.comment && (
                            <p className="text-[11px] text-gray-400 italic mt-0.5 max-w-[260px] truncate" title={v.comment}>
                              &ldquo;{v.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Not voted</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {recused.length > 0 && (
              <p className="text-[11px] text-gray-500 italic mt-2">
                Recused: {recused.map((e) => allDirectors.find((d) => d.workspaceEmail === e)?.name ?? e).join(', ')}
              </p>
            )}
          </div>

          {/* Cast or update vote */}
          {canVote && (
            <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-3 space-y-3">
              <div className="text-xs text-primary-300 font-semibold">
                {myVote ? 'Update your vote' : 'Cast your vote'}
              </div>
              <div className="flex gap-2">
                {(['yes', 'no', 'abstain'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setVoting({ ...voting, vote: opt })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                      voting.vote === opt
                        ? opt === 'yes' ? 'bg-primary-500 text-black border-primary-500'
                        : opt === 'no' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-500 text-white border-gray-500'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {opt === 'yes' ? '✓ Yes' : opt === 'no' ? '✗ No' : '— Abstain'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional comment (visible to all directors)"
                value={voting.comment}
                onChange={(e) => setVoting({ ...voting, comment: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              />
              <button
                type="button"
                onClick={() => onVote(voting.vote, voting.comment)}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all disabled:opacity-50"
              >
                {busy ? 'Submitting…' : myVote ? 'Update vote' : 'Submit vote'}
              </button>
            </div>
          )}

          {!roleCanVote && res.status === 'open' && (
            <p className="text-xs text-gray-500 italic">
              🔒 Read-only — only directors vote on board resolutions. Officers and other read-only viewers
              can see the resolution and the running tally for transparency.
            </p>
          )}

          {roleCanVote && isRecused && res.status === 'open' && (
            <p className="text-xs text-amber-300 italic">
              You are recused on this resolution (conflict of interest declared). You cannot vote.
            </p>
          )}

          {expired && res.status === 'open' && (
            <p className="text-xs text-amber-300 italic">
              Voting deadline has passed. Proposer can close the resolution to lock the result.
            </p>
          )}

          {/* Proposer can close — only if they still have role-based voting rights */}
          {isProposer && res.status === 'open' && roleCanVote && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-sm hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                Close resolution + lock result
              </button>
              <p className="text-[10px] text-gray-500 italic mt-1">
                Only the proposer can close. Once closed, no further votes accepted.
              </p>
            </div>
          )}

          {res.status === 'closed' && (
            <div className="rounded-lg bg-black/30 border border-white/5 p-3 text-xs text-gray-400">
              <strong className="text-gray-300">Closed</strong> on {fmtDate(res.closedAt)}.
              {res.closedNote && <span className="block mt-1 italic">&ldquo;{res.closedNote}&rdquo;</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Form for new resolutions ──────────────────────────────────────────

function ResolutionForm({
  userEmail, userWorkspaceEmail, userName, onCreated,
}: {
  userEmail: string;
  userWorkspaceEmail: string;
  userName: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Resolution['category']>('officer-review');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [recusedEmails, setRecusedEmails] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Officer Removal template state
  const [showRemovalTemplate, setShowRemovalTemplate] = useState(false);
  const [removalOfficerEmail, setRemovalOfficerEmail] = useState<string>('');
  const [removalReason, setRemovalReason] = useState<string>('');

  const applyRemovalTemplate = () => {
    const officer = C3H_OFFICER_ROSTER.find((o) => o.workspaceEmail === removalOfficerEmail);
    if (!officer) {
      setError('Pick an officer to remove first.');
      return;
    }
    if (removalReason.trim().length < 15) {
      setError('Please add a fuller reason — at least one or two sentences.');
      return;
    }
    setError(null);
    const t = buildOfficerRemovalText({
      officerName: officer.name,
      officeTitle: officer.role,
      reasonSummary: removalReason.trim(),
    });
    setTitle(t.title);
    setDescription(t.description);
    setCategory('officer-review');
    setDeadlineDays(3);
    setShowRemovalTemplate(false);
  };

  const submit = async () => {
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please add a longer description so other directors can vote informedly.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + deadlineDays);
      await addDoc(collection(db, COLLECTION), {
        title: title.trim(),
        description: description.trim(),
        category,
        proposedByEmail: userWorkspaceEmail,
        proposedByName: userName,
        proposedLoginEmail: userEmail.toLowerCase(),
        proposedAt: serverTimestamp(),
        deadline: Timestamp.fromDate(deadline),
        status: 'open',
        recusedEmails,
        votes: {},
      });
      onCreated();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Failed to create resolution. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl bg-accent-500/5 border-2 border-accent-500/30 p-4 mb-4 space-y-3">
      <h3 className="text-base font-bold text-white">Propose a new resolution</h3>

      {/* CNCA quick templates — accelerates common Board actions with
          bylaws-correct motion text. Currently officer removal only;
          more templates (officer appointment, financial ratification,
          policy adoption) can be added as needed. */}
      <div className="rounded-lg bg-purple-500/5 border border-purple-500/30 p-3">
        <button
          type="button"
          onClick={() => setShowRemovalTemplate((s) => !s)}
          className="flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-purple-200"
        >
          <span>⚡</span>
          <span>Quick template — Remove an officer (CNCA s. 142(2))</span>
          <span className="text-purple-400">{showRemovalTemplate ? '▾' : '▸'}</span>
        </button>
        {showRemovalTemplate && (
          <div className="mt-3 space-y-2.5">
            <p className="text-[10px] text-gray-500 italic">Pre-fills the form with a CNCA s. 142(2) + Bylaws Art. 4.6-aligned officer removal motion. The Board may remove an officer at any time by resolution (majority vote at meeting, or unanimous written resolution per CNCA s. 144(1)). All fields are editable after applying.</p>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Officer to remove</label>
              <select
                value={removalOfficerEmail}
                onChange={(e) => setRemovalOfficerEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="" className="bg-gray-900">— Pick an officer —</option>
                {C3H_OFFICER_ROSTER.map((o) => (
                  <option key={o.workspaceEmail} value={o.workspaceEmail} className="bg-gray-900">
                    {o.name} ({o.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Reason for removal (factual, one or two sentences)</label>
              <textarea
                rows={3}
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="e.g. Pattern of public character attacks on directors documented on [date1], [date2], [date3], inconsistent with the Club's Code of Conduct and the Treasurer's duties under Bylaws Art. 4.6."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <button
              type="button"
              onClick={applyRemovalTemplate}
              className="px-3 py-1.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30 text-xs font-semibold"
            >
              Apply template → fills the form below
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='e.g. "Q3 2026 Treasurer review (Qaiser)"'
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Resolution['category'])}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Voting deadline (days from now)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(parseInt(e.target.value, 10) || 7)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Description (full motion text)</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Explain what is being voted on and any context other directors need to vote informedly.'
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Directors recused (conflict of interest) — check anyone who must abstain
        </label>
        <div className="grid sm:grid-cols-2 gap-1">
          {C3H_DIRECTOR_ROSTER.map((d) => (
            <label key={d.workspaceEmail} className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={recusedEmails.includes(d.workspaceEmail)}
                onChange={(e) => {
                  if (e.target.checked) setRecusedEmails([...recusedEmails, d.workspaceEmail]);
                  else setRecusedEmails(recusedEmails.filter((x) => x !== d.workspaceEmail));
                }}
              />
              {d.name} <span className="text-gray-500">({d.role})</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-2">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="px-5 py-2 rounded-lg bg-primary-500 text-black font-semibold text-sm hover:bg-primary-400 transition-all disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create resolution'}
        </button>
      </div>
    </div>
  );
}
