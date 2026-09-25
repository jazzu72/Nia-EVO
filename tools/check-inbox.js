const fs = require("fs"), crypto = require("crypto");
const SALT = Buffer.from("nia-capital-os-v1");
const raw = fs.readFileSync("secrets.enc");
const isB64 = !raw.includes(0) && /^[A-Za-z0-9+/=\s]+$/.test(raw.toString("ascii"));
const p = isB64 ? Buffer.from(raw.toString("ascii").replace(/\s/g,""), "base64") : raw;
const key = crypto.scryptSync(process.env.NIA_MASTER_PASSWORD, SALT, 32);
const d = crypto.createDecipheriv("aes-256-gcm", key, p.slice(0,12));
d.setAuthTag(p.slice(12,28));
const t = Buffer.concat([d.update(p.slice(28)), d.final()]).toString("utf8");
const get = k => t.match(new RegExp("^" + k + "=(.*)$", "m"))?.[1];

const USER = get("IMAP_USER") || get("GMAIL_USER") || "lesane1972@gmail.com";
const PASS = (get("IMAP_PASSWORD") || get("GMAIL_APP_PASSWORD") || "").replace(/\s+/g, "");
if (!PASS) { console.error("ERR: no password"); process.exit(1); }
console.log("using", USER, "| pass length", PASS.length);

const { ImapFlow } = require("imapflow");
(async () => {
  const c = new ImapFlow({ host: "imap.gmail.com", port: 993, secure: true, logger: false, disableCompression: true,
    auth: { user: USER, pass: PASS } });
  await c.connect();
  const lock = await c.getMailboxLock("INBOX");
  const since = new Date(Date.now() - 3*24*3600*1000);
  const want = ["vipc.org","cece.vt.edu","norfolk.gov","virsbdc.org","virginiacatalyst.org","hamptonroadscf.org","toshiba.com"];
  let n = 0;
  for await (const m of c.fetch({ since }, { envelope: true })) {
    const from = (m.envelope?.from?.[0]?.address || "").toLowerCase();
    if (want.some(x => from.endsWith(x))) {
      console.log(new Date(m.envelope.date).toISOString(), "|", from, "|", m.envelope.subject);
      n++;
    }
  }
  console.log("--- matched:", n);
  lock.release(); await c.logout();
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
