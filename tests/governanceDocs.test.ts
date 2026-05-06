import { describe, it, expect } from 'vitest';
import { GOVERNANCE_DOCS, findDoc } from '@/app/c3h/pavilion/governanceDocs';

describe('governanceDocs', () => {
  it('exports at least the IP Ownership and Service Agreement docs', () => {
    expect(GOVERNANCE_DOCS.length).toBeGreaterThanOrEqual(2);
    expect(GOVERNANCE_DOCS.find((d) => d.id === 'ip-ownership-acknowledgement')).toBeDefined();
    expect(GOVERNANCE_DOCS.find((d) => d.id === 'service-agreement-v1')).toBeDefined();
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

  it('Saad is recused (conflict of interest) on every doc requiring conflict-aware signing', () => {
    for (const d of GOVERNANCE_DOCS) {
      if (d.whoMustSign === 'all-directors-except-conflicted') {
        expect(d.conflictedSigners).toContain('saad@challengerscc.ca');
      }
    }
  });

  it('findDoc returns the matching doc', () => {
    expect(findDoc('ip-ownership-acknowledgement')?.shortTitle).toBe('IP Ownership Acknowledgement');
    expect(findDoc('service-agreement-v1')?.shortTitle).toBe('Software Licence Agreement');
  });

  it('findDoc returns undefined for unknown id', () => {
    expect(findDoc('does-not-exist')).toBeUndefined();
    expect(findDoc('')).toBeUndefined();
  });

  it('no two docs share the same id', () => {
    const ids = GOVERNANCE_DOCS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Software Licence Agreement requires licensor signature (two-party with Mohammed Saad personally)', () => {
    const sa = GOVERNANCE_DOCS.find((d) => d.id === 'service-agreement-v1');
    expect(sa?.requiresLicensorSignature).toBe(true);
  });

  it('IP Ownership Acknowledgement does NOT require licensor signature (unilateral CCC act)', () => {
    const ipo = GOVERNANCE_DOCS.find((d) => d.id === 'ip-ownership-acknowledgement');
    expect(ipo?.requiresLicensorSignature ?? false).toBe(false);
  });
});
