const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let updated=0;

data.contacts.forEach(c=>{

if(c.paymentNoticeSent && c.simulatePaid===true && c.paymentStatus!=="PAID"){

c.paymentStatus="PAID";
c.dealStatus="won";
c.closedAt=new Date().toISOString();
c.revenueCollected=c.invoiceAmount||2500;
c.lastAction="Payment received and deal closed";
c.nextBestAction="Request testimonial and referral";

data.closedDeals=(data.closedDeals||0)+1;
data.revenue=(data.revenue||0)+c.revenueCollected;

console.log("💰 Payment confirmed:",c.name);

updated++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`✅ Payments Processed: ${updated}`);

