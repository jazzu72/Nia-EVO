const fs = require("fs");

const QUEUE = "execution-queue.json";

function scoreDeal(task) {
  const arv = Number(task.arv || 0);
  const offer = Number(task.offer || 0);

  const margin = arv > 0 ? ((arv - offer) / arv) * 100 : 0;

  let score = 0;

  if (margin >= 30) score += 40;
  if (task.confidence === "91.01%") score += 30;
  if (task.property) score += 30;

  return {
    score,
    margin: margin.toFixed(2) + "%",
    decision: score >= 70 ? "APPROVED" : "REVIEW"
  };
}

function runGate() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    const result = scoreDeal(task);

    console.log(
      "📊 DEAL SCORE:",
      task.id,
      result.score,
      result.decision
    );

    return {
      ...task,
      dealScore: result.score,
      margin: result.margin,
      decision: result.decision
    };
  });

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("🧠 NIA DEAL SCORE GATE ONLINE");
runGate();

setInterval(runGate, 60000);
