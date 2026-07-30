const {getReminders}=require('./services/reminder-engine');
const https=require('https');

function sendReminder(){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token || !chat) return;

const reminders=getReminders();

if(!reminders.length) return;

const text=
"🔔 NIA SELLER FOLLOW-UP\\n\\n"+
reminders.map((r,i)=>
`${i+1}. ${r.address}\\nAction: ${r.action}\\nOffer: $${r.offer}`
).join("\\n\\n");

const data=JSON.stringify({
chat_id:chat,
text
});

const req=https.request(
`https://api.telegram.org/bot${token}/sendMessage`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(data)
}
});

req.write(data);
req.end();

}

module.exports={sendReminder};
