const fs=require("fs");
const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let updated=0;

data.contacts.forEach(c=>{

if(c.invoiceCreated && !c.paymentLink){

c.paymentLink=`https://pay.nia-capital-os.com/${c.invoiceId}`;
c.paymentStatus="AWAITING_PAYMENT";
c.nextBestAction="Send payment link to client";

console.log("🔗 Payment link created:",c.name,c.paymentLink);

updated++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`✅ Payment Links Generated: ${updated}`);

