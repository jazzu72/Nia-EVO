const fs = require('fs');
const VAULT_FILE = './runtime/vault/secrets.enc';

function getSecret(key) {
  try {
    const data = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf8'));
    return data[key] || null;
  } catch { return null; }
}

function setSecret(key, value) {
  const data = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf8'));
  data[key] = value;
  fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2));
}

module.exports = { getSecret, setSecret };
