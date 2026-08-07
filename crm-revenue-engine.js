const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

function load(){
 return JSON.parse(fs.readFileSync(FILE,"utf8"));
}

function save(data){
 fs.writeFileSync(FILE,JSON.stringify(data,null,2));
}

function update(contactId,field,value){
 const data=load();
 const c=data.contacts.find(x=>x.id===contactId);

 if(!c) return null;

 c[field]=value;
 c.lastUpdated=new Date().toISOString();

 if(field==="dealStatus" && value==="won"){
   c.closedAt=new Date().toISOString();
   data.closedDeals=data.closedDeals||[];
   data.closedDeals.push(c.id);
   data.revenue=(data.revenue||0)+2500;
 }

 save(data);
 return c;
}

module.exports={
 update
};

// ─── Deposit tracking ────────────────────────────────────────
function recordDeposit(contactId, amount) {
  const data = load();
  const contact = data.contacts.find(c => c.id === contactId);
  if (!contact) return null;

  if (!data.deposits) data.deposits = [];
  data.deposits.push({
    contactId,
    amount,
    date: new Date().toISOString(),
    source: 'Bluevine'
  });
  save(data);
  return { success: true, amount };
}

// ─── Override the update function to auto‑record deposits ────
const originalUpdate = update;
update = function(contactId, field, value) {
  const result = originalUpdate(contactId, field, value);
  if (field === 'dealStatus' && value === 'won') {
    const data = load();
    const contact = data.contacts.find(c => c.id === contactId);
    if (contact) {
      recordDeposit(contactId, contact.revenueAmount || 2500);
      // Notify via Telegram
      const msg = `💰 Deposit logged for ${contact.name}: $${(contact.revenueAmount || 2500).toLocaleString()}\nPlease transfer to Bluevine:\nAccount: 875108033064\nRouting: 125109019`;
      const token = process.env.TELEGRAM_BOT_TOKEN || '8845481308:AAE-K1YHbvdHTOkGbtbnGCbwKnmxW-GjH-Q';
      const chatId = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID';
      require('child_process').exec(`curl -s -X POST https://api.telegram.org/bot${token}/sendMessage -d "chat_id=${chatId}&text=${encodeURIComponent(msg)}"`);
    }
  }
  return result;
};
