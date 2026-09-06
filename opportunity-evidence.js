function firstValue(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return '';
}

function extract(detail = {}, candidate = {}) {
  const data = detail.data || detail;

  const deadline = firstValue(data, [
    'closeDate',
    'closeDateTime',
    'applicationDeadline'
  ]) || firstValue(candidate, ['closeDate']);

  const eligibility = firstValue(data, [
    'eligibilities',
    'eligibility',
    'applicantTypes'
  ]);

  const applicationPath = firstValue(data, [
    'applicationUrl',
    'applicationURL',
    'url',
    'opportunityUrl'
  ]) || 'https://www.grants.gov/';

  return {
    identifiable_opportunity:
      candidate.id ||
      candidate.opportunityId ||
      data.id ||
      data.opportunityId ||
      '',

    official_source: 'https://www.grants.gov/',

    eligibility_evidence: eligibility,

    deadline_evidence: deadline,

    application_path: applicationPath
  };
}

module.exports = { extract };
