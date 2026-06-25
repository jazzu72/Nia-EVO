import { fetchAllRSS } from '../rss-engine.js';
import { scoreDeal } from '../deal-scoring.js';

async function autonomyLoop() {
  console.log("[HEARTBEAT] NIA-EVO Reasoning Cycle Active...");
  const deals = await fetchAllRSS();
  
  for (const deal of deals) {
    const { score } = scoreDeal(deal);
    if (score > 50) {
      console.log(`[ACTION] High-priority deal detected: ${deal.title} (Score: ${score})`);
      // Future logic: Trigger contract generation or email notification
    }
  }
  setTimeout(autonomyLoop, 60000); // 1-minute cycle
}

autonomyLoop();
