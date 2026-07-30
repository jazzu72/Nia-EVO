const https=require('https');

const report=require('../realestate/services/report-engine');
const {handleApproval}=require('./approval-handler');
const {generateCEOReport}=require('../reports/ceo-report');
const {log}=require('../audit/logger');
const {generateActions}=require('../actions/services/action-engine');
const {calculateRevenue}=require('../revenue/services/revenue-engine');
const {getReminders}=require('../reminders/services/reminder-engine');
const {executeCommand}=require('./telegram-commands');
const {authorized}=require('./security');

function sendTelegram(chat,text,buttons=null){

const token=process.env.TELEGRAM_BOT_TOKEN;

if(!token) return;

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

async function handleCommand(msg){

const owner=process.env.TELEGRAM_OWNER_ID;

if(owner && String(msg.chat.id)!==String(owner)){
sendTelegram(msg.chat.id,"⛔ Unauthorized access");
return;
}


if(!authorized(msg)){
 sendTelegram(msg.chat.id,'⛔ Unauthorized access');
 return;
}


const chat=msg.chat.id;
log("telegram_command",{chat,text:msg.text||""});
const text=msg.text || "";

if(text.startsWith('/')){
 executeCommand(msg);
 return;
}

const approval=handleApproval(text);
if(approval){sendTelegram(chat,approval);return;}

if(text==="/ceo"){
sendTelegram(chat,generateCEOReport());
return;
}

if(text==="/status"){
sendTelegram(chat,"🏰 Nia Status: ONLINE");
}

else if(text==="/report"){
sendTelegram(chat,JSON.stringify(report(),null,2));
}

else if(text==="/tasks" || text==="/actions"){
const actions=generateActions();
sendTelegram(chat,"📋 Nia CEO Tasks\n\n"+actions.actions.map((a,i)=>`${i+1}. ${a}`).join('\n'));
}

else if(text==="/reminders"){
const reminders=getReminders();

sendTelegram(chat,
"🔔 Nia Seller Reminders\n\n"+
(reminders.length ?
reminders.map((r,i)=>`${i+1}. ${r.address} - ${r.action}`).join("\n")
:
"No pending seller contacts")
);
}

else if(text==="/revenue"){
const revenue=calculateRevenue();
sendTelegram(chat,
"💰 Nia Revenue Report\n\n"+
"Offers: "+revenue.pipeline.offers+"\n"+
"Under Contract: "+revenue.pipeline.underContract+"\n"+
"Projected Revenue: $"+revenue.pipeline.projectedRevenue
);
}

else if(text==="/deals"){
sendTelegram(chat,
"🏠 Deal Engine: Monitoring active opportunities");
}

else{
sendTelegram(chat,
"Commands:\n/status\n/report\n/tasks\n/deals");
}

}

module.exports={handleCommand};
