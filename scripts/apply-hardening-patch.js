'use strict';
const fs = require('fs');
const path = require('path');

const patches = [
  {
    file: path.join(__dirname, '..', 'grants-engine', 'grant-api.js'),
    oldStr: `router.post("/submit/:id",(req,res)=>{
  res.json(tracker.submit(req.params.id));
});`,
    newStr: `router.post("/submit/:id",(req,res)=>{
  if(!process.env.NIA_APPROVAL_TOKEN){
    return res.status(500).json({error:"NIA_APPROVAL_TOKEN not configured — refusing to submit"});
  }
  if(req.get("x-nia-approval-token")!==process.env.NIA_APPROVAL_TOKEN){
    return res.status(403).json({error:"Missing or invalid approval token"});
  }
  res.json(tracker.submit(req.params.id));
});`,
  },
  {
    file: path.join(__dirname, '..', 'grants-engine', 'submission-tracker.js'),
    oldStr: `function save(data){
  fs.writeFileSync(DB,JSON.stringify(data,null,2));
}`,
    newStr: `function save(data){
  if(fs.existsSync(DB)){
    const backupDir=path.join(__dirname,"backups");
    if(!fs.existsSync(backupDir)) fs.mkdirSync(backupDir,{recursive:true});
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    fs.copyFileSync(DB,path.join(backupDir,\`submission-db.\${stamp}.json\`));
    const files=fs.readdirSync(backupDir).filter(f=>f.startsWith("submission-db.")).sort();
    const excess=files.length-20;
    if(excess>0) files.slice(0,excess).forEach(f=>fs.unlinkSync(path.join(backupDir,f)));
  }
  fs.writeFileSync(DB,JSON.stringify(data,null,2));
}`,
  },
];

let failed = false;
for (const p of patches) {
  if (!fs.existsSync(p.file)) { console.error(`MISSING FILE: ${p.file}`); failed = true; continue; }
  const content = fs.readFileSync(p.file, 'utf8');
  const count = content.split(p.oldStr).length - 1;
  if (count === 0) { console.error(`OLD BLOCK NOT FOUND in ${p.file} — already patched, or the file changed. Not touching it.`); failed = true; continue; }
  if (count > 1) { console.error(`OLD BLOCK APPEARS ${count} TIMES in ${p.file} — refusing to guess. Patch by hand.`); failed = true; continue; }
  fs.copyFileSync(p.file, p.file + '.bak');
  fs.writeFileSync(p.file, content.replace(p.oldStr, p.newStr), 'utf8');
  console.log(`Patched ${p.file}  (backup: ${p.file}.bak)`);
}
if (failed) { console.error('\nNot everything applied — nothing partial was written for the failed file(s).'); process.exit(1); }
console.log('\nBoth patches applied cleanly.');
