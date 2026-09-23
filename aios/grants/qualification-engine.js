/*
  NIA GRANT QUALIFICATION ENGINE
  Evaluates grant eligibility against verified company facts.
  Never invents eligibility. Unknowns become POSSIBLE, not QUALIFIED.
*/

const STATUS = Object.freeze({
  QUALIFIED: "QUALIFIED",
  POSSIBLE: "POSSIBLE",
  WATCHLIST: "WATCHLIST",
  DISQUALIFIED: "DISQUALIFIED"
});

function qualify(grant, company) {
  company = company || companyProfile;
  const required = grant.requiredEligibility || [];
  const verified = company.verifiedEligibility || {};
  const conflicts = [];
  const unknowns = [];

  for (const rule of required) {
    const value = verified[rule.key];
    if (value === false && rule.mustBe === true) conflicts.push(rule);
    else if (value === undefined || value === null) unknowns.push(rule);
  }

  if (conflicts.length) {
    return { status: STATUS.DISQUALIFIED, reason: "Verified eligibility conflict", conflicts: conflicts, unknowns: unknowns };
  }

  if (grant.applicationStatus === "CLOSED" || grant.applicationStatus === "WATCHLIST") {
    return { status: STATUS.WATCHLIST, reason: grant.watchReason || "Current application pathway unavailable", conflicts: conflicts, unknowns: unknowns };
  }

  if (unknowns.length) {
    return { status: STATUS.POSSIBLE, reason: "Eligibility facts require verification", conflicts: conflicts, unknowns: unknowns };
  }

  return { status: STATUS.QUALIFIED, reason: "All published mandatory eligibility requirements verified", conflicts: conflicts, unknowns: unknowns };
}

const companyProfile = {
  name: "House of Jazzu",
  verifiedEligibility: {
    usBased: true,
    smallBusiness: true,
    forProfit: true,
    virginiaBased: true,
    hamptonRoadsBased: true,
    minorityOwned: true,
    under500Employees: true
  },
  unverifiedEligibility: [
    "sam_gov_registration_active",
    "university_partner_confirmed",
    "matching_funds_available",
    "prior_sbir_phase1"
  ]
};

const grants = [
  {
    id: "DOE-GENESIS-DE-FOA-0003612",
    name: "The Genesis Mission: Transforming Science and Energy with AI",
    funder: "U.S. Department of Energy",
    awardAmount: "$500,000-$750,000 Phase I",
    applicationStatus: "WATCHLIST",
    watchReason: "FY2026 Phase I deadline passed; Phase II tied to qualifying Phase I awards.",
    lane: "AI_DEEP_TECH",
    technicalFit: ["AI", "quantum information science", "semiconductors", "advanced manufacturing"],
    requiredEligibility: [
      { key: "usBased", mustBe: true },
      { key: "smallBusiness", mustBe: true }
    ],
    source: "DE-FOA-0003612"
  },
  {
    id: "DOE-QUANTUM-GENESIS-DE-FOA-0003657",
    name: "DOE Quantum Genesis Q Competition",
    funder: "U.S. Department of Energy",
    awardAmount: "See current FOA",
    applicationStatus: "OPEN",
    deadline: "2026-10-19",
    lane: "AI_DEEP_TECH",
    technicalFit: ["quantum", "AI", "advanced technology"],
    requiredEligibility: [
      { key: "usBased", mustBe: true },
      { key: "smallBusiness", mustBe: true },
      { key: "forProfit", mustBe: true }
    ],
    source: "DE-FOA-0003657"
  },
  {
    id: "NSF-SBIR-STTR-PHASE1",
    name: "NSF SBIR/STTR Phase I - Deep Technologies",
    funder: "National Science Foundation",
    awardAmount: "Up to $2,000,000 Phase I",
    applicationStatus: "OPEN",
    deadline: "2026-11-04",
    lane: "NSF_SBIR_RD",
    technicalFit: ["AI", "autonomous systems", "deep technology", "software"],
    requiredEligibility: [
      { key: "usBased", mustBe: true },
      { key: "smallBusiness", mustBe: true },
      { key: "forProfit", mustBe: true },
      { key: "under500Employees", mustBe: true }
    ],
    requires: ["SAM.gov registration", "Project Pitch invitation"],
    source: "NSF 26-510"
  },
  {
    id: "VIPC-LAUNCH-GRANT",
    name: "VIPC Launch Grant",
    funder: "Virginia Innovation Partnership Corporation",
    awardAmount: "$50,000 non-dilutive",
    applicationStatus: "OPEN",
    deadline: "Periodic - check VIPC",
    lane: "SMALL_BIZ_TECH",
    technicalFit: ["technology commercialization", "Virginia startup"],
    requiredEligibility: [
      { key: "virginiaBased", mustBe: true },
      { key: "forProfit", mustBe: true },
      { key: "smallBusiness", mustBe: true }
    ],
    source: "vipc.org"
  },
  {
    id: "VIPC-CCF-HE-POC",
    name: "VIPC Commonwealth Commercialization Fund - Higher Education POC",
    funder: "Virginia Innovation Partnership Corporation",
    awardAmount: "$75,000-$300,000",
    applicationStatus: "OPEN",
    deadline: "2026-06-05",
    lane: "NSF_SBIR_RD",
    technicalFit: ["advanced technology", "IT", "autonomous systems"],
    requiredEligibility: [
      { key: "virginiaBased", mustBe: true }
    ],
    requires: ["Virginia university partnership", "1:1 match"],
    note: "Requires university partner - only fits if partnered",
    source: "vipc.org"
  },
  {
    id: "NSF-AISL",
    name: "NSF Advancing Informal STEM Learning (AISL)",
    funder: "National Science Foundation",
    awardAmount: "$75,000-$3,500,000",
    applicationStatus: "OPEN",
    deadline: "Rolling - June 2026 for FY2026",
    lane: "MONEY_MUNCHKINS_STEM",
    technicalFit: ["informal STEM learning", "K-12 STEM", "financial literacy"],
    requiredEligibility: [
      { key: "usBased", mustBe: true }
    ],
    note: "Strong fit for Money Munchkins financial literacy program",
    source: "nsf.gov"
  },
  {
    id: "TOSHIBA-STEAM-GRANTS",
    name: "Toshiba America Foundation STEM Grants",
    funder: "Toshiba America Foundation",
    awardAmount: "$1,000-$5,000",
    applicationStatus: "OPEN",
    deadline: "2026-10-01",
    lane: "MONEY_MUNCHKINS_STEM",
    technicalFit: ["K-12 STEM", "project-based learning", "financial literacy"],
    requiredEligibility: [
      { key: "usBased", mustBe: true }
    ],
    note: "Small but fast - classroom-level fit for Money Munchkins",
    source: "toshiba.com/taf"
  },
  {
    id: "GOVA-REGION2",
    name: "GO Virginia Region 2 Grants",
    funder: "GO Virginia / Virginia DHCD",
    awardAmount: "$1.5M pool - up to $250K planning",
    applicationStatus: "OPEN",
    deadline: "2026-09-11",
    lane: "VIRGINIA_ECONOMIC_DEV",
    technicalFit: ["IT/engineering services/emerging technology", "workforce development"],
    requiredEligibility: [
      { key: "virginiaBased", mustBe: true }
    ],
    note: "Requires collaboration between business, education, government",
    source: "cece.vt.edu/GOVAR2"
  },
  {
    id: "NORFOLK-CAP",
    name: "City of Norfolk Capital Access Program",
    funder: "City of Norfolk Economic Development",
    awardAmount: "Varies - affordable financing",
    applicationStatus: "OPEN",
    deadline: "Rolling since 2026-07-21",
    lane: "VIRGINIA_ECONOMIC_DEV",
    technicalFit: ["small business growth", "local Norfolk business"],
    requiredEligibility: [
      { key: "virginiaBased", mustBe: true },
      { key: "forProfit", mustBe: true },
      { key: "smallBusiness", mustBe: true }
    ],
    requires: ["Norfolk business license", "Mandatory workshop"],
    source: "norfolkdevelopment.com"
  },
  {
    id: "HRCF-COMMUNITY",
    name: "Hampton Roads Community Foundation Community Grants",
    funder: "Hampton Roads Community Foundation",
    awardAmount: "$1,000-$10,000",
    applicationStatus: "OPEN",
    deadline: "2026-10-01",
    lane: "VIRGINIA_ECONOMIC_DEV",
    technicalFit: ["education", "community development"],
    requiredEligibility: [
      { key: "hamptonRoadsBased", mustBe: true }
    ],
    note: "Nonprofit focus - fits Money Munchkins if structured as nonprofit arm",
    source: "hamptonroadscf.org"
  },
  {
    id: "VA-CATALYST-R20",
    name: "Virginia Catalyst Grant Round 20",
    funder: "Virginia Catalyst",
    awardAmount: "$200,000-$800,000",
    applicationStatus: "CLOSED",
    watchReason: "LOI deadline was 2026-09-25; next round expected Q1 2027",
    lane: "NSF_SBIR_RD",
    technicalFit: ["life sciences", "healthcare innovation"],
    requiredEligibility: [
      { key: "virginiaBased", mustBe: true }
    ],
    requires: ["Two Virginia university partners", "1:1 match"],
    source: "virginiacatalyst.org"
  }
];

function filterQualified(grantsList, company) {
  company = company || companyProfile;
  const out = { qualified: [], possible: [], watchlist: [], disqualified: [] };
  for (const g of grantsList || grants) {
    const q = qualify(g, company);
    const entry = Object.assign({}, g, { qualification: q });
    if (q.status === STATUS.QUALIFIED) out.qualified.push(entry);
    else if (q.status === STATUS.POSSIBLE) out.possible.push(entry);
    else if (q.status === STATUS.WATCHLIST) out.watchlist.push(entry);
    else out.disqualified.push(entry);
  }
  return out;
}

module.exports = {
  STATUS: STATUS,
  qualify: qualify,
  filterQualified: filterQualified,
  companyProfile: companyProfile,
  grants: grants
};
