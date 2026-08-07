const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let triggered=0;

data.contacts.forEach(c=>{

if(
 c.proposalSent &&
 !c.invoiceRequested &&
 c.dealStatus!=="won"
){

c.invoiceRequested=true;
c.nextBestAction="Create invoice and request payment";
c.lastAction="Payment trigger activated";
c.lastUpdated=new Date().toISOString();

triggered++;

}

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`💳 Payment triggers activated: ${triggered}`);

