const {logActivity}=require('../activity/services/logger');
const {sendDailyTelegramReport}=require('../reports/services/telegram-report');
const {generateActions}=require('../actions/services/action-engine');
const https=require('https');

function sendCEOActions(){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token || !chat) return;

const actions=generateActions();

const text="🏰 NIA CEO DAILY TASKS\n\n"+
actions.actions.map((a,i)=>`${i+1}. ${a}`).join("\n");

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

const {sendReminder}=require('../reminders/daily-reminder');
const {sendCEOReport}=require('../reports/daily-ceo-job');

function startScheduler(){

console.log("⏰ Nia Scheduler Online");
sendDailyTelegramReport();
sendCEOActions();
sendReminder();
sendCEOReport();

setInterval(()=>{

logActivity(
"scheduled_task",
"Hourly system review completed",
{
task:"pipeline_check",
time:new Date().toISOString()
}
);

console.log("✅ Nia hourly review complete");

},3600000);

}

module.exports={startScheduler};
