const fs = require("fs");

const hunter = require("../hunter/realestate/realestate-hunter");

const QUEUE = "data/acquisition/queue.json";

function loadQueue() {
    if (!fs.existsSync(QUEUE)) return [];
    return JSON.parse(fs.readFileSync(QUEUE, "utf8"));
}

function saveQueue(queue) {
    fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));
}

const queue = loadQueue();

console.log(`📥 ${queue.length} prospects waiting`);

while (queue.length) {

    const lead = queue.shift();

    try {

        hunter.addBrokerage(lead);

        console.log(`✅ ${lead.company}`);

    } catch (err) {

        console.log(`❌ ${lead.company}: ${err.message}`);

    }

}

saveQueue(queue);

console.log("🏁 Acquisition queue complete");
