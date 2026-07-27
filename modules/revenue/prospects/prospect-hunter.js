const db = require("./prospects");

function discoverBusinesses() {
  const businesses = [
    {
      name: "ABC HVAC",
      industry: "hvac",
      city: "Norfolk",
      state: "VA",
      phone: "",
      website: ""
    },
    {
      name: "Coastal Realty",
      industry: "real estate",
      city: "Virginia Beach",
      state: "VA",
      phone: "",
      website: ""
    },
    {
      name: "Elite Roofing",
      industry: "roofing",
      city: "Chesapeake",
      state: "VA",
      phone: "",
      website: ""
    },
    {
      name: "Precision Plumbing",
      industry: "plumbing",
      city: "Portsmouth",
      state: "VA",
      phone: "",
      website: ""
    }
  ];

  const added = [];
  businesses.forEach(company => {
    added.push(db.add(company));
  });
  return added;
}

function topProspects(limit = 10) {
  return db
    .getHighPriority()
    .slice(0, limit);
}

module.exports = {
  discoverBusinesses,
  topProspects
};
