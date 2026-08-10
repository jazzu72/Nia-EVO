const fs = require('fs');
const path = require('path');

const registry = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'official-opportunity-sources.json'),
    'utf8'
  )
);

function validate(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');

    const match = registry.sources.find(source =>
      host === source.domain || host.endsWith(`.${source.domain}`)
    );

    return {
      valid: Boolean(match),
      domain: host,
      source: match || null
    };
  } catch {
    return {
      valid: false,
      domain: null,
      source: null
    };
  }
}

module.exports = { validate };
