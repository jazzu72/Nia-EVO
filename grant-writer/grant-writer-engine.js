const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "../data/grant-applications.json");

function load() {
  if (!fs.existsSync(DATA)) {
    fs.writeFileSync(DATA, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA));
}

function save(data) {
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2));
}

function createApplication(grant) {

  const application = {
    id: "APP-" + Date.now(),

    grant: grant.name,

    requestedAmount: grant.amount,

    company: "House of Jazzu",

    sections: {
      executiveSummary:
        "House of Jazzu is building AI-powered technology platforms focused on financial intelligence, quantum technology, and autonomous business operations.",

      problem:
        "Small businesses lack access to affordable AI tools that improve operations, funding discovery, and decision-making.",

      solution:
        "Nia is an autonomous AI executive system designed to manage business intelligence, capital discovery, and operational workflows.",

      innovation:
        "A unified AI operating system combining automation, intelligence, and business execution.",

      market:
        "Millions of small businesses require affordable AI solutions to compete in an increasingly digital economy.",

      milestones: [
        "Complete Nia Capital OS development",
        "Deploy AI business operations platform",
        "Acquire pilot customers",
        "Scale technology infrastructure"
      ],

      budget: {
        development: 100000,
        infrastructure: 50000,
        research: 50000,
        operations: 50000
      }
    },

    status:"DRAFT_READY",

    created:new Date().toISOString()
  };

  const apps = load();
  apps.push(application);
  save(apps);

  return application;
}


function generateVIPC() {
  return createApplication({
    name:"Virginia Innovation Partnership Corporation",
    amount:250000
  });
}


function getApplications(){
  return load();
}


module.exports={
  createApplication,
  generateVIPC,
  getApplications
};
