const fs=require("fs");
const {exec}=require("child_process");

const CRM="./data/revenue-pipeline.json";

function send(msg){
 const token=process.env.TELEGRAM_BOT_TOKEN;
 const chat=process.env.TELEGRAM_CHAT_ID;

 if(!token || !chat){
  console.log("⚠️ Telegram not configured");
  return;
 }

 exec(`curl -s -X POST https://api.telegram.org/bot${token}/sendMessage -d "chat_id=${chat}&text=${encodeURIComponent(msg)}"`);
}

function run(){

const data=JSON.parse(fs.readFileSync(CRM,"utf8"));

const leads=data.contacts.filter(c=>c.outreachSent && !c.alertSent);

if(!leads.length){
 console.log("📭 No new outreach alerts");
 return;
}

leads.forEach(c=>{
 send(
 `🤖 NIA OUTREACH\n\nLead: ${c.name}\nScore: ${c.score}\nProbability: ${c.probability}%\n\nMessage prepared and ready.`
 );

 c.alertSent=true;
});

fs.writeFileSync(CRM,JSON.stringify(data,null,2));

console.log(`📲 Sent ${leads.length} outreach alerts`);
}

run();

module.exports={run};
