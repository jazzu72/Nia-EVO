'use strict';

const https = require('https');

const BASE = 'https://api.sam.gov';

function getKey() {
  const k = process.env.SAM_API_KEY;
  if (!k) { const e = new Error('SAM_API_KEY not set'); e.code = 'NO_KEY'; throw e; }
  return k;
}

function request(path, params) {
  return new Promise((resolve, reject) => {
    const qs = Object.entries(params).map(([k, v]) =>
      encodeURIComponent(k) + '=' + encodeURIComponent(v)
    ).join('&');
    const url = BASE + path + '?api_key=' + getKey() + '&' + qs;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          const e = new Error('SAM API ' + res.statusCode + ': ' + body.slice(0, 200));
          e.code = 'API_ERROR'; return reject(e);
        }
        try { resolve(JSON.parse(body)); }
        catch (e) { e.code = 'PARSE_ERROR'; reject(e); }
      });
    }).on('error', reject);
  });
}

const CACHE = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function searchOpportunities({ naics = '541715', days = 30, limit = 100 } = {}) {
  const key = 'opp:' + naics + ':' + days + ':' + limit;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

  const fmt = d => String(d.getMonth() + 1).padStart(2, '0') + '/' +
                   String(d.getDate()).padStart(2, '0') + '/' + d.getFullYear();
  const to = new Date();
  const from = new Date(Date.now() - days * 86400000);

  const data = await request('/prod/opportunities/v2/search', {
    postedFrom: fmt(from),
    postedTo: fmt(to),
    ptype: 'k',
    ncode: naics,
    status: 'active',
    limit: String(limit)
  });
  CACHE.set(key, { at: Date.now(), data });
  return data;
}

async function verifyEntity(uei) {
  const data = await request('/prod/entity-information/v3/entities', { ueiSAM: uei });
  return data;
}

async function searchAwards({ naics = '541715', limit = 25 } = {}) {
  return request('/prod/awards/v2/search', { naics, limit: String(limit) });
}

module.exports = { searchOpportunities, verifyEntity, searchAwards };
