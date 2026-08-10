const path = require('path');

const QuantumVault = require('./src/vault/core/vault');

const vault = new QuantumVault(
  path.join(__dirname, 'src/vault/config.json')
);

function getSecret(key) {
  if (!key) throw new Error('Secret key is required');
  return vault.retrieveSecret(key);
}

function setSecret(key, value) {
  if (!key) throw new Error('Secret key is required');
  if (value === undefined || value === null) {
    throw new Error('Secret value is required');
  }

  return vault.storeSecret(key, String(value));
}

function health() {
  return vault.health();
}

module.exports = {
  getSecret,
  setSecret,
  health
};
