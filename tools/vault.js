'use strict';
const fs = require('fs');
const path = require('path');
const vault = require('./crypto-vault');
const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  'data/owner-identity.json',
  'data/funding/house-of-jazzu-profile.json',
  'data/funding/nsf-sbir-phase1-application-package.json'
];
function status() {
  let e=0,p=0,m=0;
  for (const rel of TARGETS) {
    const abs=path.join(ROOT,rel);
    const enc=fs.existsSync(abs+'.enc'), pln=fs.existsSync(abs);
    let s;
    if (enc && !pln) { s='✅ ENCRYPTED'; e++; }
    else if (pln && !enc) { s='⚠️  PLAINTEXT ONLY'; p++; }
    else if (pln && enc) { s='⚠️  BOTH'; p++; }
    else { s='❌ MISSING'; m++; }
    console.log(rel.padEnd(58), s);
  }
  console.log('---'); console.log('encrypted:',e,'| plaintext:',p,'| missing:',m);
  console.log('master key:', process.env.NIA_MASTER_KEY ? 'set' : 'NOT SET');
}
function encryptAll() {
  if (!process.env.NIA_MASTER_KEY) { console.error('ERROR: NIA_MASTER_KEY required'); process.exit(1); }
  for (const rel of TARGETS) {
    const abs=path.join(ROOT,rel);
    if (!fs.existsSync(abs)) { console.log('SKIP (missing):'.padEnd(20), rel); continue; }
    const plain=fs.readFileSync(abs);
    if (vault.isEncryptedFile(plain)) { console.log('SKIP (enc):'.padEnd(20), rel); continue; }
    const ct=vault.encrypt(plain);
    fs.writeFileSync(abs+'.enc', ct);
    fs.unlinkSync(abs);
    console.log('ENCRYPTED:'.padEnd(20), rel, '('+plain.length+' → '+ct.length+' bytes)');
  }
}
function decryptAll() {
  if (!process.env.NIA_MASTER_KEY) { console.error('ERROR: NIA_MASTER_KEY required'); process.exit(1); }
  for (const rel of TARGETS) {
    const abs=path.join(ROOT,rel);
    if (!fs.existsSync(abs+'.enc')) { console.log('SKIP (no .enc):'.padEnd(20), rel); continue; }
    fs.writeFileSync(abs, vault.decrypt(fs.readFileSync(abs+'.enc')));
    console.log('DECRYPTED:'.padEnd(20), rel);
  }
}
function verify() {
  if (!process.env.NIA_MASTER_KEY) { console.error('ERROR: NIA_MASTER_KEY required'); process.exit(1); }
  let ok=0,fail=0;
  for (const rel of TARGETS) {
    const enc=path.join(ROOT,rel)+'.enc';
    if (!fs.existsSync(enc)) continue;
    try { vault.decrypt(fs.readFileSync(enc)); console.log('✅ '.padEnd(4), rel+'.enc'); ok++; }
    catch(e) { console.log('❌ '.padEnd(4), rel+'.enc —', e.message); fail++; }
  }
  console.log('---'); console.log('verified:',ok,'| failed:',fail);
  process.exit(fail>0?1:0);
}
const cmd=process.argv[2];
if (cmd==='status') status();
else if (cmd==='encrypt-all') encryptAll();
else if (cmd==='decrypt-all') decryptAll();
else if (cmd==='verify') verify();
else console.log('Usage: node tools/vault.js {status|encrypt-all|decrypt-all|verify}');
