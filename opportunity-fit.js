const PROFILE = {
  keywords: [
    'artificial intelligence',
    'ai',
    'machine learning',
    'software',
    'fintech',
    'financial technology',
    'education',
    'financial literacy',
    'innovation',
    'small business',
    'startup'
  ],
  preferredAgencies: [
    'National Science Foundation',
    'Small Business Administration',
    'Department of Education'
  ]
};

function score(opportunity = {}) {
  const text = [
    opportunity.title,
    opportunity.description,
    opportunity.agencyName,
    opportunity.category
  ].filter(Boolean).join(' ').toLowerCase();

  let score = 0;
  const matches = [];

  for (const keyword of PROFILE.keywords) {
    if (text.includes(keyword)) {
      score += keyword === 'artificial intelligence' ? 15 : 8;
      matches.push(keyword);
    }
  }

  if (
    opportunity.agencyName &&
    PROFILE.preferredAgencies.some(
      a => opportunity.agencyName.toLowerCase().includes(a.toLowerCase())
    )
  ) {
    score += 10;
  }

  score = Math.min(score, 100);

  return {
    score,
    matches,
    tier:
      score >= 70 ? 'HIGH_FIT' :
      score >= 45 ? 'MEDIUM_FIT' :
      'LOW_FIT'
  };
}

module.exports = { PROFILE, score };
