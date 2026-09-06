const fs = require("fs");
const crypto = require("crypto");

const FILES = [
"execution-queue.json",
"nia-actions.json",
"nia-action-execution.json",
"nia-capital-report.json",
"nia-revenue-attribution.json"
];

const BACKUP = "nia-backups";

if(!fs.existsSync(BACKUP)){
fs.mkdirSync(BACKUP);
}

function secureSnapshot(){

const id =
"SNAPSHOT-" +
Date.now();

const folder =
`${BACKUP}/${id}`;

fs.mkdirSync(folder);

FILES.forEach(file=>{

if(fs.existsSync(file)){

fs.copyFileSync(
file,
`${folder}/${file}`
);

}

});

const manifest = {
system:"NIA-CAPITAL-OS",
snapshot:id,
checksum:crypto
.createHash("sha256")
.update(JSON.stringify(FILES))
.digest("hex"),
created:new Date().toISOString()
};

fs.writeFileSync(
`${folder}/manifest.json`,
JSON.stringify(manifest,null,2)
);

console.log(
"🔐 NIA SECURITY SNAPSHOT CREATED:",
id
);

}

console.log("🛡️ NIA SECURITY HARDENING ONLINE");

secureSnapshot();

setInterval(secureSnapshot,3600000);
