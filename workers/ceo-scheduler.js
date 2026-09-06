// NIA CEO Scheduler

const { exec } = require("child_process");

console.log("🏰 CEO Scheduler Started");

function runLoop() {
    console.log("▶ Running CEO Loop:", new Date().toISOString());

    exec(
        "node autopilot/daily-ceo-loop.js",
        (err, stdout, stderr) => {

            if (err) {
                console.error(stderr);
                return;
            }

            console.log(stdout);
        }
    );
}

// Run immediately
runLoop();

// Then every hour
setInterval(runLoop, 60 * 60 * 1000);
