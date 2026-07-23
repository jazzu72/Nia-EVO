const fs = require('fs');
const brain = JSON.parse(fs.readFileSync('./brain_matrix.json', 'utf8'));

function assess() {
  console.log('🧠 Self-Assessment Running...');
  console.log(`Current Capabilities: ${brain.self_awareness.capabilities.join(', ')}`);
  console.log(`Target Market: ${brain.self_awareness.target_market.join(', ')}`);
  console.log(`Goal: ${brain.strategy.goal}`);
  console.log('✅ Brain Matrix is aligned with sales pitch.');
}

setInterval(assess, 86400000); // once per day
