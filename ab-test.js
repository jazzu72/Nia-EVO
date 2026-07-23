const fs = require('fs');
const VARIATIONS = [
  "Great! Can we schedule an inspection tomorrow?",
  "We're offering \$85,000. Want to set up a call?",
  "I'm in your area tomorrow — can we meet?"
];

function getBestVariation() {
  const stats = JSON.parse(fs.readFileSync('./ab_stats.json', 'utf8'));
  let best = VARIATIONS[0];
  let bestRate = 0;
  for (const v of VARIATIONS) {
    const rate = (stats[v]?.replies || 0) / (stats[v]?.sent || 1);
    if (rate > bestRate) { bestRate = rate; best = v; }
  }
  return best;
}

function trackSent(variation) {
  const stats = JSON.parse(fs.readFileSync('./ab_stats.json', 'utf8'));
  stats[variation] = stats[variation] || { sent: 0, replies: 0 };
  stats[variation].sent++;
  fs.writeFileSync('./ab_stats.json', JSON.stringify(stats, null, 2));
}

module.exports = { getBestVariation, trackSent };
