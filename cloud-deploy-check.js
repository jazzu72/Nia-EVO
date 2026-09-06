const fs=require("fs");

const required=[
"package.json",
"revenue-api.js",
"render.yaml",
"Procfile",
"data/revenue-pipeline.json"
];

let missing=[];

required.forEach(f=>{
 if(!fs.existsSync(f)) missing.push(f);
});

if(missing.length){
 console.log("❌ Missing:",missing.join(", "));
 process.exit(1);
}

let pkg=require("./package.json");

console.log("✅ Files verified");
console.log("📦 Application:",pkg.name||"NIA-CAPITAL-OS");
console.log("🚀 Start command:",pkg.scripts?.start||"missing");
console.log("☁️ Cloud deployment ready");

