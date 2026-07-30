const https=require('https');

function sendInvestorPackage(pack){

const token=process.env.TELEGRAM_BOT_TOKEN;
const chat=process.env.TELEGRAM_CHAT_ID;

if(!token||!chat)return;

const text=
`📦 NIA INVESTOR PACKAGE READY

🏠 ${pack.address}

ARV: $${pack.summary.arv}
Purchase: $${pack.summary.purchasePrice}
Repairs: $${pack.summary.repairs}
Projected Profit: $${pack.summary.profit}

Status: ${pack.status}`;

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

module.exports={sendInvestorPackage};
