'use strict';

const { createProviderBoundary } = require('./provider-boundary');

function createHttpReadonlyProvider(name, baseUrl, headers = {}) {
  if (!name || !baseUrl) throw new TypeError('name and baseUrl are required');

  return createProviderBoundary(name, async (path = '') => {
    const url = new URL(path, baseUrl).toString();
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', ...headers }
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return Object.freeze({
      status: res.status,
      ok: res.ok,
      url,
      data
    });
  });
}

module.exports = { createHttpReadonlyProvider };
