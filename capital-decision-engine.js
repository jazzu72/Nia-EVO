const fs = require("fs");

const QUEUE = "execution-queue.json";

function evaluate(task) {
  const arv = Number(task.arv || 0);
  const offer = Number(task.offer || 0);

  const spread = arv - offer;
  const margin = arv ? ((spread / arv) * 100) : 0;

  let capitalDecision = "REVIEW";

  if (spread >= 40000 && margin >= 25) {
    capitalDecision = "FUNDING_READY";
  }

  return {
    ...task,
    spread,
    margin: margin.toFixed(2) + "%",
    capitalDecision
  };
}

function run() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    const result = evaluate(task);

    console.log(
      "💰 CAPITAL DECISION:",
      task.id,
      result.capitalDecision
    );

    return result;
  });

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("💰 NIA CAPITAL DECISION ENGINE ONLINE");

run();

setInterval(run, 60000);
