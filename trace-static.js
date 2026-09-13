const fs = require('fs');
const path = require('path');
const seen = new Set();
const missing = [];
const entries = ['app.js','NIA-CEO/autonomous.js','orchestrator.js','telegram-interface.js'];

function resolveRel(fromFile, reqPath) {
  if (!reqPath.startsWith('.')) return null;
  let base = path.resolve(path.dirname(fromFile), reqPath);
  const candidates = [base, base + '.js', path.join(base, 'index.js')];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function trace(file) {
  const full = path.resolve(file);
  if (seen.has(full)) return;
  if (!fs.existsSync(full)) { missing.push(file); return; }
  seen.add(full);
  const src = fs.readFileSync(full, 'utf8');
  const re = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const resolved = resolveRel(full, m[1]);
    if (resolved) trace(path.relative(process.cwd(), resolved));
  }
}

entries.forEach(e => trace(e));
const files = [...seen].map(f => path.relative(process.cwd(), f)).sort();
console.log('LIVE FILE COUNT:', files.length);
console.log('MISSING ENTRIES:', missing);
fs.writeFileSync('./live-requires-real.txt', files.join('\n'));
