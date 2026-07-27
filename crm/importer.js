const Datastore = require("@seald-io/nedb");

const db = new Datastore({
  filename: "./opportunities.db",
  autoload: true
});

const grants = [
  {
    type: "Grant",
    title: "NSF Small Business Innovation Research (SBIR)",
    organization: "National Science Foundation",
    value: 305000,
    status: "Research",
    deadline: "",
    notes: "AI, education, quantum, software"
  },
  {
    type: "Grant",
    title: "DOE Small Business Innovation Research",
    organization: "U.S. Department of Energy",
    value: 250000,
    status: "Research",
    deadline: "",
    notes: "Energy AI, optimization"
  },
  {
    type: "Grant",
    title: "EDA Build to Scale",
    organization: "Economic Development Administration",
    value: 2000000,
    status: "Research",
    deadline: "",
    notes: "Startup ecosystem"
  },
  {
    type: "Grant",
    title: "VIPC Commonwealth Commercialization Fund",
    organization: "Virginia Innovation Partnership Corporation",
    value: 100000,
    status: "Research",
    deadline: "",
    notes: "Virginia startups"
  },
  {
    type: "Grant",
    title: "USDA Rural Innovation",
    organization: "USDA",
    value: 500000,
    status: "Research",
    deadline: "",
    notes: "Technology expansion"
  }
];

db.insert(grants, (err, docs) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log("✅ Imported", docs.length, "grant opportunities.");
  process.exit(0);
});
