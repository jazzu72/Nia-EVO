'use strict';
const crypto = require('crypto');
const MAGIC = Buffer.from('NIAV');
const VERSION = 0x01;
const SALT_LEN = 32, IV_LEN = 12, TAG_LEN = 16;
const HEADER_LEN = 5 + SALT_LEN + IV_LEN + TAG_LEN;
const ALGO = 'aes-256-gcm';
function getMasterKey() {
  const raw = process.env.NIA_MASTER_KEY;
  if (!raw) { const e = new Error('NIA_MASTER_KEY not set'); e.code = 'NO_MASTER_KEY'; throw e; }
  if (raw.length < 32) { const e = new Error('NIA_MASTER_KEY too short'); e.code = 'WEAK_KEY'; throw e; }
  return raw;
}
function deriveKey(salt) { return crypto.scryptSync(getMasterKey(), salt, 32); }
function encrypt(plaintext) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(salt);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([MAGIC, Buffer.from([VERSION]), salt, iv, cipher.getAuthTag(), ct]);
}
function decrypt(buf) {
  if (buf.length < HEADER_LEN || !buf.slice(0, 4).equals(MAGIC) || buf[4] !== VERSION) {
    const e = new Error('bad ciphertext format'); e.code = 'BAD_FORMAT'; throw e;
  }
  const salt = buf.slice(5, 5 + SALT_LEN);
  const iv = buf.slice(5 + SALT_LEN, 5 + SALT_LEN + IV_LEN);
  const tag = buf.slice(5 + SALT_LEN + IV_LEN, HEADER_LEN);
  const ct = buf.slice(HEADER_LEN);
  const d = crypto.createDecipheriv(ALGO, deriveKey(salt), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]);
}
function isEncryptedFile(buf) {
  return buf.length >= HEADER_LEN && buf.slice(0, 4).equals(MAGIC) && buf[4] === VERSION;
}
module.exports = { encrypt, decrypt, isEncryptedFile };
