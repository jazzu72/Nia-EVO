const REQUIRED = [
  'identifiable_opportunity',
  'official_source',
  'eligibility_evidence',
  'deadline_evidence',
  'application_path'
];

function verify(opportunity = {}) {
  const evidence = opportunity.evidence || {};

  const missing = REQUIRED.filter(key => {
    const value = evidence[key];
    return value === undefined || value === null || value === '';
  });

  return {
    state: missing.length === 0 ? 'VERIFIED' : 'CLASSIFIED',
    verified: missing.length === 0,
    missing,
    reason: missing.length
      ? 'Required evidence is incomplete'
      : 'All required verification evidence is present'
  };
}

module.exports = { REQUIRED, verify };
