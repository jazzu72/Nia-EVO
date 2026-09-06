const fs = require("fs");

const QUEUE = "execution-queue.json";

function loadQueue() {
  if (!fs.existsSync(QUEUE)) return [];
  return JSON.parse(fs.readFileSync(QUEUE));
}

function addExecutionTask(task) {
  const queue = loadQueue();
  queue.push(task);
  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));

  console.log("📥 TASK QUEUED");
  console.log("QUEUE SIZE:", queue.length);

  return queue;
}

function getQueue() {
  return loadQueue();
}

module.exports = {
  addExecutionTask,
  getQueue
};
