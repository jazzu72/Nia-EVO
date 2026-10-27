'use strict';
const fs = require('fs');
const vault = require('./crypto-vault');
function readVaultText(basePath) {
  const encPath = basePath + '.enc';
  if (fs.existsSync(encPath) && process.env.NIA_MASTER_KEY) {
    return vault.decrypt(fs.readFileSync(encPath)).toString('utf8');
  }
  if (fs.existsSync(basePath)) return fs.readFileSync(basePath, 'utf8');
  if (fs.existsSync(encPath)) {
    const e = new Error('encrypted file exists but NIA_MASTER_KEY not set'); e.code = 'NO_MASTER_KEY'; throw e;
  }
  const e = new Error('file not found: ' + basePath); e.code = 'ENOENT'; throw e;
}
function readVaultJSON(basePath) { return JSON.parse(readVaultText(basePath)); }
function writeVaultJSON(obj, basePath) {
  const buf = Buffer.from(JSON.stringify(obj, null, 2), 'utf8');
  if (process.env.NIA_MASTER_KEY) {
    fs.writeFileSync(basePath + '.enc', vault.encrypt(buf));
    if (fs.existsSync(basePath)) fs.unlinkSync(basePath);
  } else fs.writeFileSync(basePath, buf);
}
module.exports = { readVaultText, readVaultJSON, writeVaultJSON };
