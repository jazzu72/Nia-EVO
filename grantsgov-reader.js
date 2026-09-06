const https = require('https');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);

    const req = https.request({
      hostname: 'api.grants.gov',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 30000
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error(`Invalid Grants.gov JSON: HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('timeout', () => req.destroy(new Error('Grants.gov timeout')));
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function search(keyword = 'small business technology') {
  return post('/v1/api/search2', {
    rows: 10,
    keyword,
    oppStatuses: 'posted|forecasted'
  });
}


async function fetchOpportunity(opportunityId) {
  return post('/v1/api/fetchOpportunity', {
    opportunityId
  });
}

module.exports = { search, fetchOpportunity };
