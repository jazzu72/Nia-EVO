'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_PATH = path.join(DATA_DIR, 'pipeline.json');
const TMP_PATH = path.join(DATA_DIR, '.pipeline.json.tmp');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BACKUPS_TO_KEEP = 20;

const STAGES = ['discovered', 'analyzed', 'recommended', 'approval_required', 'executed'];

async function ensureDataFile() {
  try {
    await fsp.access(DATA_PATH, fs.constants.F_OK);
  } catch {
    await writeTickets([]);
  }
}

async function readTickets() {
  await ensureDataFile();
  const raw = await fsp.readFile(DATA_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.tickets) ? parsed.tickets : [];
  } catch (err) {
    throw new Error(`pipeline.json is corrupt: ${err.message}`);
  }
}

async function backupCurrentFile() {
  try {
    await fsp.access(DATA_PATH, fs.constants.F_OK);
  } catch {
    return;
  }
  await fsp.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await fsp.copyFile(DATA_PATH, path.join(BACKUP_DIR, `pipeline.${stamp}.json`));

  const files = (await fsp.readdir(BACKUP_DIR))
    .filter((f) => f.startsWith('pipeline.') && f.endsWith('.json'))
    .sort();
  const excess = files.length - BACKUPS_TO_KEEP;
  if (excess > 0) {
    await Promise.all(files.slice(0, excess).map((f) => fsp.unlink(path.join(BACKUP_DIR, f))));
  }
}

async function writeTickets(tickets) {
  const payload = JSON.stringify({ tickets, updatedAt: new Date().toISOString() }, null, 2);
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await backupCurrentFile();
  await fsp.writeFile(TMP_PATH, payload, 'utf8');
  await fsp.rename(TMP_PATH, DATA_PATH);
}

function summarize(tickets) {
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0]));
  let pendingApprovalValue = 0;
  let oldestApprovalAgeMs = 0;
  let executedThisMonthValue = 0;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  for (const t of tickets) {
    if (t.stage in counts) counts[t.stage] += 1;

    if (t.stage === 'approval_required') {
      pendingApprovalValue += Number(t.value) || 0;
      const age = now - new Date(t.createdAt);
      if (age > oldestApprovalAgeMs) oldestApprovalAgeMs = age;
    }

    if (t.stage === 'executed' && t.executedAt) {
      const d = new Date(t.executedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key === monthKey && t.countsAsRevenue) {
        executedThisMonthValue += Number(t.value) || 0;
      }
    }
  }

  return {
    counts,
    pendingApprovalCount: counts.approval_required,
    pendingApprovalValue,
    oldestApprovalAgeMs,
    revenueThisMonth: executedThisMonthValue,
  };
}

async function setStage(id, nextStage, extra = {}) {
  const tickets = await readTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) {
    const err = new Error(`No ticket with id "${id}"`);
    err.code = 'NOT_FOUND';
    throw err;
  }

  const ticket = tickets[idx];

  if ((nextStage === 'executed' || nextStage === 'declined') && ticket.stage !== 'approval_required') {
    const err = new Error(`Ticket "${id}" is not awaiting approval (currently "${ticket.stage}")`);
    err.code = 'INVALID_TRANSITION';
    throw err;
  }

  tickets[idx] = {
    ...ticket,
    stage: nextStage,
    updatedAt: new Date().toISOString(),
    ...extra,
  };

  await writeTickets(tickets);
  return tickets[idx];
}

module.exports = {
  STAGES,
  readTickets,
  writeTickets,
  summarize,
  setStage,
};
