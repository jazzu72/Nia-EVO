const fs = require("fs");

const QUEUE = "execution-queue.json";

function prepareClosing() {
  if (!fs.existsSync(QUEUE)) return;

  let queue = JSON.parse(fs.readFileSync(QUEUE));

  queue = queue.map(task => {
    if (task.status === "FUNDING_REVIEW" && task.fundingStatus === "READY_FOR_CAPITAL_PARTNER") {
      console.log(
        "🏁 CLOSING PREP STARTED:",
        task.id
      );

      return {
        ...task,
        status: "CLOSING_PREP",
        closingChecklist: [
          "TITLE_REVIEW",
          "INSPECTION",
          "FUNDING_CONFIRMATION",
          "CONTRACT_REVIEW"
        ],
        closingStarted: new Date().toISOString()
      };
    }

    return task;
  });

  fs.writeFileSync(
    QUEUE,
    JSON.stringify(queue, null, 2)
  );
}

console.log("🏁 NIA CLOSING PREP ENGINE ONLINE");

prepareClosing();

setInterval(prepareClosing, 60000);
