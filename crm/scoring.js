function scoreOpportunity(item) {
  let score = 0;

  // Amount-based scoring
  if (item.amount) {
    if (item.amount >= 1000000) score += 50;
    else if (item.amount >= 500000) score += 40;
    else if (item.amount >= 100000) score += 30;
    else if (item.amount >= 50000) score += 20;
    else score += 10;
  }

  // Type-based scoring
  if (item.type === "grant") score += 20;
  if (item.type === "investor") score += 18;
  if (item.type === "contract") score += 15;
  if (item.type === "property") score += 12;

  // Feature-based scoring
  if (item.ai === true) score += 15;
  if (item.education === true) score += 10;
  if (item.quantum === true) score += 10;
  if (item.minority === true) score += 10;

  return score;
}

module.exports = { scoreOpportunity };
