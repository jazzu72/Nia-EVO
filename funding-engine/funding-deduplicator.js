const crypto = require("crypto");

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .replace(/\s+/g, " ");
}

function opportunityKey(candidate) {
  const identity = [
    normalize(candidate.name),
    normalize(candidate.officialUrl),
    normalize(candidate.source)
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(identity)
    .digest("hex");
}

function deduplicate(candidates) {
  const seen = new Set();
  const unique = [];
  const duplicates = [];

  for (const candidate of candidates || []) {
    const key = opportunityKey(candidate);

    if (seen.has(key)) {
      duplicates.push({
        ...candidate,
        opportunityKey: key,
        duplicate: true
      });
      continue;
    }

    seen.add(key);

    unique.push({
      ...candidate,
      opportunityKey: key,
      duplicate: false
    });
  }

  return {
    inputCount: (candidates || []).length,
    uniqueCount: unique.length,
    duplicateCount: duplicates.length,
    unique,
    duplicates
  };
}

module.exports = {
  normalize,
  opportunityKey,
  deduplicate
};
