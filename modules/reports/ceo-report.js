const fs=require('fs');

function read(file){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch{
return [];
}
}

function generateCEOReport(){

const deals=read("./modules/crm/data/deals.json");
const offers=read("./modules/offers/data/offers.json");
const leads=read("./modules/leads/data/leads.json");

return `
🏰 NIA CAPITAL OS - CEO REPORT

📥 Leads: ${leads.length}

🏠 Offers:
${offers.length}

🤝 Closing Pipeline:
${deals.length}

${deals.map((d,i)=>
`${i+1}. ${d.address}
Stage: ${d.stage}
Next: ${d.nextStep}`
).join("\n\n") || "No active deals"}

Generated:
${new Date().toISOString()}
`;
}

module.exports={generateCEOReport};
