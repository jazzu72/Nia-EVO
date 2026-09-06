const https=require('https');
const {generateReport}=require('./report-engine');

function sendDailyTelegramReport(){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token || !chat){
console.log("Telegram credentials missing");
return;
}

const report=generateReport();

const text=
`🏰 NIA DAILY REPORT

Status: ${report.status}

📊 Metrics
Deals: ${report.metrics.deals}
Leads: ${report.metrics.leads}
Activities: ${report.metrics.activities}

Priority:
${report.priorities.join("\n")}

${report.summary}`;

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

module.exports={sendDailyTelegramReport};
