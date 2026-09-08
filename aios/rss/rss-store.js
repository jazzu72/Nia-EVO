'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'intelligence.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(ITEMS_FILE)) {
  fs.writeFileSync(ITEMS_FILE, '[]\n', { mode: 0o600 });
}

function readItems() {
  try {
    const data = JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeItems(items) {
  const tmp = ITEMS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, ITEMS_FILE);
}

function normalize(item, source) {
  const title = String(item.title || 'Untitled intelligence').trim();
  const link = String(item.link || '').trim();
  const guid = String(
    item.guid ||
    item.id ||
    link ||
    (source + ':' + title)
  ).trim();

  return {
    id: guid.slice(0, 500),
    title: title.slice(0, 500),
    description: String(item.contentSnippet || item.content || item.description || '').slice(0, 4000),
    link: link.slice(0, 2000),
    source: String(source || 'unknown').slice(0, 500),
    category: String(item.category || 'intelligence').slice(0, 100),
    published_at: item.isoDate || item.pubDate || new Date().toISOString(),
    ingested_at: new Date().toISOString()
  };
}

function upsert(items) {
  const db = readItems();
  const existing = new Map(db.map(x => [x.id, x]));

  for (const item of items) {
    if (!item || !item.id) continue;
    existing.set(item.id, { ...existing.get(item.id), ...item });
  }

  const result = Array.from(existing.values())
    .sort((a,b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
    .slice(0, 1000);

  writeItems(result);
  return result;
}

function list(limit=100) {
  return readItems().slice(0, Math.max(1, Math.min(Number(limit) || 100, 1000)));
}

module.exports = { normalize, upsert, list };
