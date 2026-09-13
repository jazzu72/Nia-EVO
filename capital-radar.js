const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(process.cwd(), "data", "capital-radar");
const FILE = path.join(ROOT, "opportunities.json");

fs.mkdirSync(ROOT, { recursive: true });

const targets = [
  {
    name: "Hello Alice Funding Center",
    type: "grant-marketplace",
    url: "https://www.helloalice.com/small-business-grants-and-funding",
    tags: ["small-business","startup","minority","technology","grant","capital"],
    priority: 95
  },
  {
    name: "Verizon Small Business Digital Ready",
    type: "corporate-grant",
    url: "https://www.verizon.com/business/solutions/small-business/",
    tags: ["small-business","technology","digital","grant"],
    priority: 92
  },
  {
    name: "Main Street Rising Tour",
    type: "pitch-competition",
    url: "https://mainstreet.helloalice.com/",
    tags: ["AI","small-business","pitch","cash-prize"],
    priority: 88
  },
  {
    name: "Black Ambition Prize",
    type: "startup-prize",
    url: "https://blackambitionprize.com/apply-now/",
    tags: ["Black-founder","startup","technology","prize"],
    priority: 80,
    watch: true
  },
  {
    name: "NAACP Powershift Entrepreneur Grant",
    type: "grant",
    url: "https://naacp.org/find-resources/grants/powershift-entrepreneur-grant",
    tags: ["Black-founder","small-business","grant"],
    priority: 82,
    watch: true
  }
];

function score(o) {
  let score = o.priority || 50;

  const preferred = [
    "small-business",
    "startup",
    "technology",
    "AI",
    "grant",
    "cash-prize",
    "Black-founder",
    "minority"
  ];

  for (const tag of preferred) {
    if (o.tags.includes(tag)) score += 2;
  }

  return Math.min(score, 100);
}

function buildRadar() {
  const now = new Date().toISOString();

  const opportunities = targets.map(o => ({
    ...o,
    score: score(o),
    status: o.watch ? "WATCH" : "RESEARCH",
    discoveredAt: now,
    verifiedAt: null,
    eligibility: "NEEDS_VERIFICATION",
    applicationStatus: "NOT_STARTED",
    humanApprovalRequired: true
  })).sort((a,b) => b.score - a.score);

  const radar = {
    generatedAt: now,
    objective: "Find currently available capital for House of Jazzu and qualifying projects",
    strategy: [
      "GRANTS",
      "PRIZES",
      "PITCH_COMPETITIONS",
      "ACCELERATORS",
      "CDFI",
      "SBA_BACKED_FINANCING",
      "CORPORATE_FUNDING",
      "STRATEGIC_INVESTMENT"
    ],
    scoring: {
      capital: 30,
      eligibility: 25,
      deadline: 20,
      probability: 15,
      strategicFit: 10
    },
    opportunities
  };

  fs.writeFileSync(FILE, JSON.stringify(radar, null, 2));

  console.log("========================================");
  console.log("🛰️ NIA CAPITAL RADAR");
  console.log("========================================");
  console.log(`Generated: ${now}`);
  console.log(`Opportunities: ${opportunities.length}`);
  console.log("");

  opportunities.forEach((o, i) => {
    console.log(
      `${i + 1}. ${o.name} | SCORE ${o.score} | ${o.status}`
    );
  });

  console.log("");
  console.log(`DATA: ${FILE}`);
  console.log("========================================");
}

buildRadar();
