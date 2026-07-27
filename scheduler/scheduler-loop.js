
const scheduler =
require("./task-engine");


setInterval(()=>{

console.log(
"🧠 Nia scheduler running..."
);

scheduler.generateDailyTasks();


},86400000);


console.log(
"🚀 Nia Autonomous Scheduler Online"
);

