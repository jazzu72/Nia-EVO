const https=require('https');

function sendAlert(message){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token || !chat){
console.log("Telegram credentials missing");
return;
}

const data=JSON.stringify({
chat_id:chat,
text:message
});

const req=https.request(
`https://api.telegram.org/bot${token}/sendMessage`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(data)
}
}
);

req.write(data);
req.end();

}

function dealAlert(result){

if(result.decision==="BUY"){
sendAlert(
`🏰 NIA BUY ALERT\n\n`+
`Decision: ${result.decision}\n`+
`Estimated Profit: $${result.estimatedProfit}\n`+
`Reason: ${result.reason}`
);
}

}

module.exports={dealAlert};
