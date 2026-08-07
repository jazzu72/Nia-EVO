const fs=require("fs");

const INPUT="nia-owner-approval-queue.json";
const OUTPUT="nia-verified-grant-queue.json";

if(!fs.existsSync(INPUT)){
 console.log("❌ Owner queue missing");
 process.exit(1);
}

const data=JSON.parse(fs.readFileSync(INPUT));

const keywords=[
"SBIR",
"STTR",
"grant",
"funding opportunity",
"proposal",
"solicitation",
"award",
"research"
];

const filtered=(data.queue||[]).filter(item=>{
 const text=(item.title+" "+item.grant).toLowerCase();
 return keywords.some(k=>text.includes(k.toLowerCase()));
});

fs.writeFileSync(
OUTPUT,
JSON.stringify({
 system:"NIA VERIFIED GRANT QUEUE",
 count:filtered.length,
 queue:filtered,
 updated:new Date().toISOString()
},null,2)
);

console.log("🧠 GRANT QUALITY FILTER ONLINE");
console.log("VERIFIED GRANTS:",filtered.length);
