#!/usr/bin/env node
/**
 * read-form-entry-ids.mjs — read a Google Form's questions and entry IDs
 * straight off its public page, and check them against the website.
 *
 *   node scripts/read-form-entry-ids.mjs           # list questions + entry IDs
 *   node scripts/read-form-entry-ids.mjs --check   # compare against Registration.tsx
 *
 * No credentials, no API, no Apps Script. A published Google Form ships its
 * whole structure to the browser in a global called FB_PUBLIC_LOAD_DATA_ —
 * that is how the form renders itself — so the entry IDs are readable by
 * anyone who can open the form. We are only reading our own club's form.
 *
 * Why this exists: components/Registration.tsx POSTs to Google Forms using
 * hardcoded `entry.NNNNN` names. If a question is renamed, replaced or newly
 * added in the Forms UI, its entry ID changes or appears, and the website
 * silently posts to nothing. --check catches that drift.
 *
 * It also catches the trap that breaks everything: a question marked Required
 * in Google that the website does not submit. Google rejects the whole
 * response, the hidden iframe swallows the error, and the player still sees a
 * success message. --check exits non-zero if it finds one.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REGISTRATION = resolve(HERE, '..', 'components', 'Registration.tsx');

/** Pulled from Registration.tsx so there is one URL, not two. */
function formUrlFromSource(src) {
  const m = src.match(/GOOGLE_FORM_URL\s*=\s*["']([^"']+)["']/);
  if (!m) throw new Error('Could not find GOOGLE_FORM_URL in Registration.tsx');
  return m[1].replace(/\/formResponse\b.*$/, '/viewform');
}

/** The ENTRY_IDS map the website is currently using. */
function entryIdsFromSource(src) {
  const block = src.match(/const ENTRY_IDS = \{([\s\S]*?)\} as const;/);
  if (!block) throw new Error('Could not find ENTRY_IDS in Registration.tsx');
  const ids = {};
  for (const line of block[1].split('\n')) {
    const m = line.match(/^\s*(\w+)\s*:\s*'([^']*)'/);
    if (m) ids[m[1]] = m[2];
  }
  return ids;
}

function parseForm(html) {
  const m = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);
  if (!m) throw new Error('FB_PUBLIC_LOAD_DATA_ not found — is the form published?');
  const data = JSON.parse(m[1]);
  const items = data?.[1]?.[1] ?? [];
  const questions = [];
  for (const item of items) {
    const title = item[1] ?? '';
    const fields = item[4];
    if (!Array.isArray(fields) || fields.length === 0) continue; // section header
    for (const f of fields) {
      questions.push({ title, entryId: `entry.${f[0]}`, required: Boolean(f[2]) });
    }
  }
  return questions;
}

const src = readFileSync(REGISTRATION, 'utf8');
const url = formUrlFromSource(src);

const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) {
  console.error(`Could not fetch the form: HTTP ${res.status}`);
  process.exit(2);
}
const questions = parseForm(await res.text());

const pad = (s, n) => String(s).padEnd(n);
console.log(`\nForm: ${url}\n`);
console.log(`${pad('QUESTION', 46)} ${pad('ENTRY ID', 20)} REQUIRED IN GOOGLE`);
console.log('-'.repeat(88));
for (const q of questions) {
  console.log(`${pad(q.title.slice(0, 44), 46)} ${pad(q.entryId, 20)} ${q.required ? 'yes' : ''}`);
}

if (!process.argv.includes('--check')) {
  console.log('\nRun with --check to compare against components/Registration.tsx.');
  process.exit(0);
}

// ── drift check ────────────────────────────────────────────────────────
const wired = entryIdsFromSource(src);
const live = new Set(questions.map((q) => q.entryId));
const wiredIds = new Set(Object.values(wired).filter(Boolean));

const problems = [];

for (const [key, id] of Object.entries(wired)) {
  if (!id) {
    problems.push(`UNWIRED   ${key} has no entry id — its answers are not recorded.`);
  } else if (!live.has(id)) {
    problems.push(`DEAD      ${key} -> ${id} no longer exists on the form. Submissions for it go nowhere.`);
  }
}

for (const q of questions) {
  if (!wiredIds.has(q.entryId)) {
    const sev = q.required ? 'BREAKING ' : 'UNUSED   ';
    const why = q.required
      ? 'is REQUIRED in Google but the website never submits it — Google will reject EVERY submission.'
      : 'exists on the form but the website does not submit it.';
    problems.push(`${sev} "${q.title}" (${q.entryId}) ${why}`);
  }
}

console.log('\n' + '-'.repeat(88));
if (problems.length === 0) {
  console.log('OK — every wired field exists, and every Google question is submitted.');
  process.exit(0);
}
for (const p of problems) console.log(p);

const breaking = problems.some((p) => p.startsWith('BREAKING') || p.startsWith('DEAD'));
console.log(
  breaking
    ? '\nAt least one problem will silently break live registrations. Fix before relying on the form.'
    : '\nNothing is broken, but some answers are not being captured.',
);
process.exit(breaking ? 1 : 0);
