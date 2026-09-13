const fs = require("fs");
const path = require("path");

const STATE_DIR = path.join(__dirname, "state");
const LEDGER_FILE = path.join(STATE_DIR, "funding-transition-ledger.json");

function loadLedger() {
  fs.mkdirSync(STATE_DIR, { recursive: true });

  if (!fs.existsSync(LEDGER_FILE)) {
    fs.writeFileSync(
      LEDGER_FILE,
      JSON.stringify({
        organization: "House of Jazzu",
        events: []
      }, null, 2)
    );
  }

  const data = JSON.parse(
    fs.readFileSync(LEDGER_FILE, "utf8")
  );

  if (data.organization !== "House of Jazzu")
    throw new Error("LEDGER_ORGANIZATION_MISMATCH");

  if (!Array.isArray(data.events))
    throw new Error("LEDGER_EVENTS_INVALID");

  return data;
}

function appendEvent(event) {
  const data = loadLedger();

  data.events.push({
    id: event.id,
    opportunityId: String(event.opportunityId),
    previousState: event.previousState,
    newState: event.newState,
    actor: event.actor,
    reason: event.reason,
    timestamp: event.timestamp
  });

  const tmp = `${LEDGER_FILE}.tmp`;

  fs.writeFileSync(
    tmp,
    JSON.stringify(data, null, 2)
  );

  fs.renameSync(tmp, LEDGER_FILE);

  return data.events[data.events.length - 1];
}

module.exports = {
  LEDGER_FILE,
  loadLedger,
  appendEvent
};
