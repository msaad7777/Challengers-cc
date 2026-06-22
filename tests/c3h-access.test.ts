import { describe, it, expect } from 'vitest';
import {
  isC3HAdmin,
  isC3HCaptain,
  isC3HBoard,
  isC3HSquadViewer,
  isC3HDirector,
  resolveDirectorWorkspaceEmail,
  C3H_DIRECTOR_ROSTER,
  C3H_OFFICER_ROSTER,
} from '@/lib/c3h-access';

describe('c3h-access predicates', () => {
  describe('isC3HAdmin', () => {
    it("matches Saad's workspace email", () => {
      expect(isC3HAdmin('saad@challengerscc.ca')).toBe(true);
    });
    it("matches Saad's personal Gmail", () => {
      expect(isC3HAdmin('mbadru3434@gmail.com')).toBe(true);
    });
    it('is case-insensitive', () => {
      expect(isC3HAdmin('SAAD@challengerscc.ca')).toBe(true);
      expect(isC3HAdmin('MBaDrU3434@GMAIL.com')).toBe(true);
    });
    it('rejects other directors', () => {
      expect(isC3HAdmin('tarek@challengerscc.ca')).toBe(false);
      expect(isC3HAdmin('gokul@challengerscc.ca')).toBe(false);
    });
    it('rejects the shared contact inbox (deliberate exclusion)', () => {
      expect(isC3HAdmin('contact@challengerscc.ca')).toBe(false);
    });
    it('rejects null / undefined / empty', () => {
      expect(isC3HAdmin(null)).toBe(false);
      expect(isC3HAdmin(undefined)).toBe(false);
      expect(isC3HAdmin('')).toBe(false);
    });
  });

  describe('isC3HCaptain', () => {
    it('includes Saad (admin is implicitly captain)', () => {
      expect(isC3HCaptain('saad@challengerscc.ca')).toBe(true);
    });
    it('matches Shahriar (LCL captain)', () => {
      expect(isC3HCaptain('shariar@challengerscc.ca')).toBe(true);
      expect(isC3HCaptain('syedshahriar77@gmail.com')).toBe(true);
    });
    it('matches Tarek (LPL captain)', () => {
      expect(isC3HCaptain('tarek@challengerscc.ca')).toBe(true);
      expect(isC3HCaptain('monirulislambd64@gmail.com')).toBe(true);
    });
    it('matches Ankush (LCL vice-captain)', () => {
      expect(isC3HCaptain('ankush@challengerscc.ca')).toBe(true);
      expect(isC3HCaptain('92ankusharora@gmail.com')).toBe(true);
    });
    it('matches Shoeb (informal captain-level access — Match Plan reviewer)', () => {
      // Whitelisted so he can access the Match Plan tab in /c3h/nets.
      // Both workspace and personal Gmail must resolve to true so he
      // can sign in via either path and still see captain-gated views.
      expect(isC3HCaptain('shoeb@challengerscc.ca')).toBe(true);
      expect(isC3HCaptain('shabyansari0023@gmail.com')).toBe(true);
    });
    it('is case-insensitive on email matching', () => {
      // Google sometimes preserves original case on personal Gmail;
      // the predicate should not care.
      expect(isC3HCaptain('SHABYANSARI0023@GMAIL.COM')).toBe(true);
      expect(isC3HCaptain('Shoeb@ChallengersCC.ca')).toBe(true);
    });
    it('rejects players who are not captains', () => {
      expect(isC3HCaptain('denisondavis9@gmail.com')).toBe(false);
    });
  });

  describe('isC3HBoard', () => {
    it('is currently an alias for captain (per c3h-access docs)', () => {
      expect(isC3HBoard('saad@challengerscc.ca')).toBe(isC3HCaptain('saad@challengerscc.ca'));
      expect(isC3HBoard('tarek@challengerscc.ca')).toBe(isC3HCaptain('tarek@challengerscc.ca'));
    });
  });

  describe('isC3HSquadViewer', () => {
    it('excludes Qaiser (left the Club; Treasurer read-only access removed)', () => {
      expect(isC3HSquadViewer('qaiser@challengerscc.ca')).toBe(false);
      expect(isC3HSquadViewer('qureshiqaiser007@gmail.com')).toBe(false);
    });
    it('includes contact@ shared inbox (read-only board visibility)', () => {
      expect(isC3HSquadViewer('contact@challengerscc.ca')).toBe(true);
    });
    it('includes captains (squad viewing is captain-implicit)', () => {
      expect(isC3HSquadViewer('saad@challengerscc.ca')).toBe(true);
    });
  });

  describe('isC3HDirector', () => {
    const expectedDirectors = [
      'saad@challengerscc.ca',
      'ankush@challengerscc.ca',
      'tarek@challengerscc.ca',
      'roman@challengerscc.ca',
      'gokul@challengerscc.ca',
    ];

    it.each(expectedDirectors)('matches %s', (email) => {
      expect(isC3HDirector(email)).toBe(true);
    });

    it('rejects non-directors (Shahriar Captain, Madhu — former Secretary candidate)', () => {
      expect(isC3HDirector('shariar@challengerscc.ca')).toBe(false);
      expect(isC3HDirector('madhu@challengerscc.ca')).toBe(false);
    });

    it('accepts Roman (Sazzad Mahmud, both workspace + personal Gmail)', () => {
      // Sazzad Mahmud goes by "Roman" — his workspace email is roman@,
      // his personal Gmail is romans987@gmail.com. Both should match
      // the director predicate.
      expect(isC3HDirector('roman@challengerscc.ca')).toBe(true);
      expect(isC3HDirector('romans987@gmail.com')).toBe(true);
    });

    it('rejects shared contact inbox', () => {
      expect(isC3HDirector('contact@challengerscc.ca')).toBe(false);
    });
  });

  describe('resolveDirectorWorkspaceEmail', () => {
    it('returns canonical workspace email when given workspace email', () => {
      expect(resolveDirectorWorkspaceEmail('saad@challengerscc.ca')).toBe('saad@challengerscc.ca');
    });
    it('maps personal Gmail to canonical workspace email', () => {
      expect(resolveDirectorWorkspaceEmail('mbadru3434@gmail.com')).toBe('saad@challengerscc.ca');
      expect(resolveDirectorWorkspaceEmail('92ankusharora@gmail.com')).toBe('ankush@challengerscc.ca');
      expect(resolveDirectorWorkspaceEmail('monirulislambd64@gmail.com')).toBe('tarek@challengerscc.ca');
      expect(resolveDirectorWorkspaceEmail('gokulprakash663@gmail.com')).toBe('gokul@challengerscc.ca');
    });
    it('returns null for non-directors', () => {
      expect(resolveDirectorWorkspaceEmail('qaiser@challengerscc.ca')).toBeNull();
      expect(resolveDirectorWorkspaceEmail('madhu@challengerscc.ca')).toBeNull();
      expect(resolveDirectorWorkspaceEmail('contact@challengerscc.ca')).toBeNull();
    });
    it('handles case-insensitive personal emails', () => {
      expect(resolveDirectorWorkspaceEmail('MBADRU3434@gmail.com')).toBe('saad@challengerscc.ca');
    });
    it('returns null for null/undefined/empty', () => {
      expect(resolveDirectorWorkspaceEmail(null)).toBeNull();
      expect(resolveDirectorWorkspaceEmail(undefined)).toBeNull();
      expect(resolveDirectorWorkspaceEmail('')).toBeNull();
    });
  });

  describe('roster integrity', () => {
    it('director roster has exactly 5 entries (matches federal corporate profile)', () => {
      expect(C3H_DIRECTOR_ROSTER).toHaveLength(5);
    });

    it('every director in roster is in C3H_DIRECTOR_EMAILS', () => {
      for (const d of C3H_DIRECTOR_ROSTER) {
        expect(isC3HDirector(d.workspaceEmail)).toBe(true);
      }
    });

    it('officer roster has the expected role/director crossover (only the President is a Director)', () => {
      // The President is intentionally a Director who also holds an
      // officer title — standard NFP dual director+officer pattern,
      // permitted by Bylaws Article 4.7. All other officer roles
      // (Treasurer, Secretary, Captains, …) are non-director.
      for (const o of C3H_OFFICER_ROSTER) {
        if (o.role === 'President') {
          expect(isC3HDirector(o.workspaceEmail)).toBe(true);
        } else {
          expect(isC3HDirector(o.workspaceEmail)).toBe(false);
        }
      }
    });

    it('director roster has no duplicate workspace emails', () => {
      const seen = new Set<string>();
      for (const d of C3H_DIRECTOR_ROSTER) {
        expect(seen.has(d.workspaceEmail)).toBe(false);
        seen.add(d.workspaceEmail);
      }
    });
  });
});
