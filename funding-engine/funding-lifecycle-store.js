const fs = require("fs");
const path = require("path");

const STATE_DIR = path.join(__dirname, "state");
const STATE_FILE = path.join(STATE_DIR, "funding-lifecycle.json");

function ensureStore() {
  fs.mkdirSync(STATE_DIR, { recursive: true });

  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify({
        organization: "House of Jazzu",
        records: []
      }, null, 2)
    );
  }
}

function loadStore() {
  ensureStore();

  const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));

  if (data.organization !== "House of Jazzu") {
    throw new Error("LIFECYCLE_ORGANIZATION_MISMATCH");
  }

  if (!Array.isArray(data.records)) {
    throw new Error("LIFECYCLE_RECORDS_INVALID");
  }

  return data;
}

function saveStore(data) {
  if (data.organization !== "House of Jazzu") {
    throw new Error("LIFECYCLE_ORGANIZATION_MISMATCH");
  }

  fs.mkdirSync(STATE_DIR, { recursive: true });

  const tmp = `${STATE_FILE}.tmp`;

  fs.writeFileSync(
    tmp,
    JSON.stringify(data, null, 2)
  );

  fs.renameSync(tmp, STATE_FILE);

  return data;
}

function getRecord(id) {
  const data = loadStore();
  return data.records.find(x => x.id === String(id)) || null;
}

function upsertRecord(record) {
  const data = loadStore();
  const id = String(record.id);

  const index = data.records.findIndex(x => x.id === id);

  if (index === -1) {
    data.records.push(record);
  } else {
    data.records[index] = record;
  }

  saveStore(data);

  return record;
}

function ensureRecord(record) {
  const existing = getRecord(record.id);

  if (existing) {
    return existing;
  }

  return upsertRecord(record);
}

module.exports = {
  STATE_FILE,
  loadStore,
  saveStore,
  getRecord,
  upsertRecord,
  ensureRecord
};
