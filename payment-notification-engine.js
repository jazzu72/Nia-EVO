const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let sent=0;

data.contacts.forEach(c=>{

if(c.paymentLink && c.paymentStatus==="AWAITING_PAYMENT" && !c.paymentNoticeSent){

c.paymentNoticeSent=true;
c.paymentNoticeAt=new Date().toISOString();
c.lastAction="Payment link sent to client";
c.nextBestAction="Monitor payment confirmation";

console.log("📲 Payment notice queued:",c.name);

sent++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`✅ Payment Notifications: ${sent}`);

