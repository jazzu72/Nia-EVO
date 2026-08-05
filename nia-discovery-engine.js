const discovery = require("./discovery-to-execution");

let cycle = 0;

function scan() {
  cycle++;

  console.log("🔎 NIA DISCOVERY CYCLE:", cycle);

  const leads = [
    {
      address: "4110 Reisterstown Rd, Baltimore MD",
      arv: 155000,
      offer: 93000,
      source: "AUTONOMOUS-SCAN"
    }
  ];

  discovery(leads);
}

console.log("🧠 NIA DISCOVERY ENGINE ONLINE");

scan();
setInterval(scan, 300000);
