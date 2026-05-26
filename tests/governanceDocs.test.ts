import { describe, it, expect } from 'vitest';
import { GOVERNANCE_DOCS, findDoc } from '@/app/c3h/pavilion/governanceDocs';

describe('governanceDocs', () => {
  it('exports at least the TGR, LoD, and President Appointment', () => {
    expect(GOVERNANCE_DOCS.length).toBeGreaterThanOrEqual(3);
    expect(GOVERNANCE_DOCS.find((d) => d.id === 'technology-governance-record-2026')).toBeDefined();
    expect(GOVERNANCE_DOCS.find((d) => d.id === 'lod-cibc-gokul-qaiser-2026')).toBeDefined();
    expect(GOVERNANCE_DOCS.find((d) => d.id === 'president-appointment-gokul-2026')).toBeDefined();
  });

  it('every doc has a non-empty stable id, version, title and effective date', () => {
    for (const d of GOVERNANCE_DOCS) {
      expect(d.id).toBeTruthy();
      expect(d.version).toBeTruthy();
      expect(d.title).toBeTruthy();
      expect(d.shortTitle).toBeTruthy();
      expect(d.effective).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('every doc has either an inline marker or a publicUrl (so it can be read before signing)', () => {
    for (const d of GOVERNANCE_DOCS) {
      expect(Boolean(d.inline) || Boolean(d.publicUrl)).toBe(true);
    }
  });

  it('Saad is recused on every doc requiring conflict-aware signing', () => {
    for (const d of GOVERNANCE_DOCS) {
      if (d.whoMustSign === 'all-directors-except-conflicted') {
        expect(d.conflictedSigners).toContain('saad@challengerscc.ca');
      }
    }
  });

  it('findDoc returns the matching doc', () => {
    expect(findDoc('technology-governance-record-2026')?.shortTitle).toBe('Technology Governance Record');
    expect(findDoc('lod-cibc-gokul-qaiser-2026')?.shortTitle).toBe('Letter of Direction — CIBC');
    expect(findDoc('president-appointment-gokul-2026')?.shortTitle).toBe('President Appointment — Gokul Prakash');
  });

  it('findDoc returns undefined for unknown id', () => {
    expect(findDoc('does-not-exist')).toBeUndefined();
    expect(findDoc('')).toBeUndefined();
  });

  it('no two docs share the same id', () => {
    const ids = GOVERNANCE_DOCS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Technology Governance Record requires all five directors (no recusal)', () => {
    const tgr = GOVERNANCE_DOCS.find((d) => d.id === 'technology-governance-record-2026');
    expect(tgr?.whoMustSign).toBe('all-directors');
    expect(tgr?.conflictedSigners ?? []).toHaveLength(0);
  });

  it('LoD requires all five directors (no recusal)', () => {
    const lod = GOVERNANCE_DOCS.find((d) => d.id === 'lod-cibc-gokul-qaiser-2026');
    expect(lod?.whoMustSign).toBe('all-directors');
    expect(lod?.conflictedSigners ?? []).toHaveLength(0);
  });

  it('President Appointment requires all five directors including the appointee (no recusal)', () => {
    const pres = GOVERNANCE_DOCS.find((d) => d.id === 'president-appointment-gokul-2026');
    expect(pres?.whoMustSign).toBe('all-directors');
    expect(pres?.conflictedSigners ?? []).toHaveLength(0);
  });
});
