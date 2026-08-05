const fs = require("fs");

const QUEUE = "execution-queue.json";

function prioritize() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    let priority = 0;

    const arv = Number(task.arv || 0);
    const offer = Number(task.offer || 0);

    const margin = arv ? ((arv - offer) / arv) * 100 : 0;

    if (task.validation === "PASSED") priority += 40;
    if (margin >= 30) priority += 30;
    if (task.confidence === "91.01%") priority += 20;
    if (task.approved === true) priority += 10;

    let tier =
      priority >= 80 ? "A" :
      priority >= 50 ? "B" :
      "C";

    console.log(
      "🏆 PRIORITY:",
      task.id,
      "TIER:",
      tier,
      "SCORE:",
      priority
    );

    return {
      ...task,
      priorityScore: priority,
      priorityTier: tier
    };
  });

  queue.sort(
    (a,b) => (b.priorityScore || 0) - (a.priorityScore || 0)
  );

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("🏆 NIA DEAL PRIORITY ENGINE ONLINE");

prioritize();

setInterval(prioritize, 60000);
