const https=require('https');

function sendInvestorAlert(packet){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token||!chat)return;

const text=
"📈 NIA INVESTOR READY DEAL\n\n"+
"🏠 "+packet.address+
"\nARV: $"+packet.arv+
"\nProfit Target: $"+packet.projectedProfit;

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

module.exports={sendInvestorAlert};
