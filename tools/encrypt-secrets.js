#!/usr/bin/env node
const fs = require("fs");
const crypto = require("crypto");

const ENV_FILE = ".env";
const OUT_FILE = "secrets.enc";
const SALT = Buffer.from("nia-capital-os-v1");

const password = process.env.NIA_MASTER_PASSWORD;
if (!password) { console.error("❌ Set NIA_MASTER_PASSWORD env var"); process.exit(1); }
if (!fs.existsSync(ENV_FILE)) { console.error("❌ .env not found"); process.exit(1); }

const plaintext = fs.readFileSync(ENV_FILE);
const key = crypto.scryptSync(password, SALT, 32);
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();

fs.writeFileSync(OUT_FILE, Buffer.concat([iv, tag, enc]), { mode: 0o600 });
console.log(`✅ Encrypted → ${OUT_FILE} (${fs.statSync(OUT_FILE).size} bytes)`);
