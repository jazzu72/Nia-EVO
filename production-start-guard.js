const fs=require("fs");

const required=[
"revenue-api.js",
"data/revenue-pipeline.json"
];

let failed=[];

required.forEach(f=>{
if(!fs.existsSync(f)) failed.push(f);
});

if(failed.length){
console.error("❌ Startup blocked. Missing:",failed);
process.exit(1);
}

console.log("✅ NIA startup guard passed");
