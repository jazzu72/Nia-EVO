'use strict';

const store = require('./rss-store');

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildFeed(options={}) {
  const title = options.title || 'Nia Intelligence';
  const link = options.link || process.env.PUBLIC_APP_URL || 'http://localhost:3000';
  const description = options.description || 'Nia Executive OS normalized intelligence feed';
  const items = store.list(options.limit || 100);

  const xmlItems = items.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <category>${escapeXml(item.category)}</category>
      <source url="${escapeXml(item.link || link)}">${escapeXml(item.source)}</source>
      <pubDate>${new Date(item.published_at || Date.now()).toUTCString()}</pubDate>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Nia Executive OS</generator>
    ${xmlItems}
  </channel>
</rss>
`;
}

module.exports = { buildFeed };
