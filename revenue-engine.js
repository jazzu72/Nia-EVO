const fs = require("fs");

const QUEUE = "execution-queue.json";
const REVENUE = "nia-revenue.json";

function calculateRevenue() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  let revenue = [];
  if (fs.existsSync(REVENUE)) {
    revenue = JSON.parse(fs.readFileSync(REVENUE));
  }

  queue.forEach(task => {
    if (task.status === "COMPLETED") {
      const exists = revenue.find(r => r.id === task.id);

      if (!exists) {
        const profit =
          Number(task.arv || 0) -
          Number(task.offer || 0);

        revenue.push({
          id: task.id,
          property: task.property || "UNKNOWN",
          estimatedProfit: profit,
          completedAt: task.completedAt || new Date().toISOString()
        });

        console.log(
          "💵 REVENUE RECORDED:",
          task.id,
          "$" + profit
        );
      }
    }
  });

  fs.writeFileSync(
    REVENUE,
    JSON.stringify(revenue, null, 2)
  );
}

console.log("💵 NIA REVENUE ENGINE ONLINE");

calculateRevenue();

setInterval(calculateRevenue, 60000);
