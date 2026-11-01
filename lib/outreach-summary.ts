// Sponsor-outreach summary written on the club Mac by
// challengers-outreach/scripts/publish-summary.js after each daily run.
// The file is AES-256-GCM encrypted with OUTREACH_SUMMARY_KEY and holds
// aggregates only: counts, run status, lead names and next steps. No email
// addresses, phone numbers or contact names.
import { createDecipheriv } from 'crypto';

export type OutreachLead = {
  name: string;
  stage: 'Renewal' | 'Warm lead';
  status: string;
  nextStep: string;
  nextStepDate: string;
  lastContact: string;
};

export type OutreachSummary = {
  generated: string;
  today: string;
  n8n: 'up' | 'down';
  seasonStart: string;
  sent: { today: number; week: number; season: number; allTime: number; lastSendDay: string | null };
  bounces: { week: number; season: number; rate: number };
  optOuts: { season: number };
  replies: { total: number; waiting: number };
  contactsLeft: { openCategories: number; contacts: number } | null;
  lastRun: {
    reportDate: string | null;
    status: 'ok' | 'error' | 'skipped' | 'none';
    sent: number;
    planned: number;
    failed: number;
    inboxChecked: number;
    replies: number;
    optOuts: number;
    bounces: number;
    needsReply: number;
    errors: string[];
  };
  leads: OutreachLead[];
  alerts: string[];
};

type Envelope = { v: number; iv: string; tag: string; data: string };

export function decryptSummary(text: string, keyB64: string): OutreachSummary {
  const env = JSON.parse(text) as Envelope;
  if (env.v !== 1) throw new Error(`unknown summary format v${env.v}`);
  const key = Buffer.from(keyB64.trim(), 'base64');
  if (key.length !== 32) throw new Error('OUTREACH_SUMMARY_KEY must be 32 bytes, base64');
  const d = createDecipheriv('aes-256-gcm', key, Buffer.from(env.iv, 'base64'));
  d.setAuthTag(Buffer.from(env.tag, 'base64'));
  const plain = Buffer.concat([d.update(Buffer.from(env.data, 'base64')), d.final()]).toString('utf-8');
  return JSON.parse(plain) as OutreachSummary;
}

// Hours since the summary was written; the daily run is 09:30 Mon–Fri, so
// anything older than ~1 working day means the Mac or the job missed a run.
export function staleHours(s: Pick<OutreachSummary, 'generated'>, now = new Date()): number {
  return (now.getTime() - new Date(s.generated).getTime()) / 36e5;
}
