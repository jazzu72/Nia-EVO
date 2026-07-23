const fs = require('fs');
const GRANT_FILE = './data/grants.json';

function getPendingGrants() {
  const grants = JSON.parse(fs.readFileSync(GRANT_FILE, 'utf8'));
  return grants.filter(g => g.status === 'SUBMITTED' && !g.followedUp);
}

function markFollowedUp(id) {
  const grants = JSON.parse(fs.readFileSync(GRANT_FILE, 'utf8'));
  const g = grants.find(g => g.id === id);
  if (g) { g.followedUp = true; }
  fs.writeFileSync(GRANT_FILE, JSON.stringify(grants, null, 2));
}
module.exports = { getPendingGrants, markFollowedUp };
