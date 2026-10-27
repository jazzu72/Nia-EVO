'use strict';

// Per-portal field maps. The `kind` maps into the application-kit sections.
// `selector` overrides fuzzy matching for known-stable portals.

const PORTALS = {
  NSF_SBIR_PITCH: {
    name: 'NSF SBIR Project Pitch',
    urlPattern: /seedfund\.nsf\.gov/i,
    fields: [
      { match: 'project title',         kind: 'title',      maxLen: 200 },
      { match: 'technology innovation', kind: 'tech',       maxLen: 2500 },
      { match: 'technical objectives',  kind: 'objectives', maxLen: 5000 },
      { match: 'commercial potential',  kind: 'commercial', maxLen: 2500 },
      { match: 'team',                  kind: 'team',       maxLen: 2500, optional: true }
    ],
    submitHint: 'Review each field. Click "Submit Project Pitch" yourself.'
  },
  NSF_SBIR_PROPOSAL: {
    name: 'NSF SBIR Phase I Full Proposal',
    urlPattern: /research\.gov/i,
    fields: [
      { match: 'project summary',     kind: 'summary' },
      { match: 'project description', kind: 'objectives' },
      { match: 'references cited',    kind: 'references', optional: true },
      { match: 'biographical sketch', kind: 'team',       optional: true }
    ],
    submitHint: 'Multi-page submission. Fill each page, save, submit yourself.'
  },
  NIH_SBIR: {
    name: 'NIH SBIR Phase I',
    urlPattern: /(?:grants|era)\.nih\.gov/i,
    fields: [
      { match: 'project title',    kind: 'title' },
      { match: 'specific aims',    kind: 'objectives' },
      { match: 'research strategy',kind: 'objectives' },
      { match: 'commercialization',kind: 'commercial', optional: true }
    ],
    submitHint: 'Complete eRA Commons submission yourself.'
  },
  VIPC: {
    name: 'VIPC Launch Grant',
    urlPattern: /vipc\.org/i,
    fields: [
      { match: 'company name',        kind: 'legalName', optional: true },
      { match: 'project description', kind: 'objectives' },
      { match: 'use of funds',        kind: 'budget',     optional: true },
      { match: 'milestone',           kind: 'milestones', optional: true }
    ],
    submitHint: 'Submit through VIPC portal yourself.'
  },
  GENERIC: {
    name: 'Generic Portal',
    urlPattern: /.*/,
    fields: [
      { match: 'title',       kind: 'title',      optional: true },
      { match: 'summary',     kind: 'summary',    optional: true },
      { match: 'description', kind: 'objectives', optional: true }
    ],
    submitHint: 'Review all fields. Submit yourself.'
  }
};

function detectPortal(grantTitle, url) {
  if (url) {
    for (const [key, p] of Object.entries(PORTALS)) {
      if (key !== 'GENERIC' && p.urlPattern.test(url)) return key;
    }
  }
  const g = (grantTitle || '').toLowerCase();
  if (/nsf|sbir|sttr|national science/.test(g)) return 'NSF_SBIR_PITCH';
  if (/nih|national institutes of health/.test(g)) return 'NIH_SBIR';
  if (/vipc|virginia innovation/.test(g)) return 'VIPC';
  return 'GENERIC';
}

module.exports = { PORTALS, detectPortal };
