const fs = require("fs");

const INPUT = "imports/realestate.csv";
const QUEUE = "data/acquisition/queue.json";

fs.mkdirSync("imports", { recursive: true });

if (!fs.existsSync(INPUT)) {
    console.log("❌ imports/realestate.csv not found");
    process.exit(1);
}

const csv = fs.readFileSync(INPUT, "utf8").trim().split("\n");

const queue = fs.existsSync(QUEUE)
    ? JSON.parse(fs.readFileSync(QUEUE, "utf8"))
    : [];

for (let i = 1; i < csv.length; i++) {

    const [company, contact, city, agents, value] = csv[i].split(",");

    queue.push({
        company,
        contact,
        city,
        agents: Number(agents),
        value: Number(value)
    });
}

fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));

console.log(`✅ Imported ${csv.length - 1} leads`);

