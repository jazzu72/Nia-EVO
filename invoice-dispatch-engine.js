const fs=require("fs");
const crypto=require("crypto");

const FILE="./data/revenue-pipeline.json";
let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let created=0;

data.contacts.forEach(c=>{

if(c.invoiceRequested && !c.invoiceCreated){

c.invoiceId="INV-"+crypto.randomBytes(4).toString("hex").toUpperCase();
c.invoiceAmount=c.amountRequested||2500;
c.invoiceCreated=true;
c.paymentStatus="PENDING";
c.invoiceCreatedAt=new Date().toISOString();
c.nextBestAction="Send payment link and collect revenue";

console.log("💳 Invoice created:",c.name,c.invoiceId);

created++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`✅ Invoice Dispatch Complete: ${created}`);

