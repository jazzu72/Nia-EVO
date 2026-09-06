const fs=require("fs");

const FILE="./data/revenue-pipeline.json";

function report(){

const data=JSON.parse(fs.readFileSync(FILE,"utf8"));

const contacts=data.contacts||[];

const pipeline=contacts
.filter(c=>c.dealStatus!=="won")
.reduce((sum,c)=>sum+((c.probability||0)/100)*2500,0);

const report={
 timestamp:new Date().toISOString(),
 totalLeads:contacts.length,
 hotLeads:contacts.filter(c=>c.probability>=70).length,
 proposals:contacts.filter(c=>c.proposalSent).length,
 closedDeals:(data.closedDeals||[]).length,
 revenue:data.revenue||0,
 estimatedPipeline:Math.round(pipeline)
};

console.log(JSON.stringify(report,null,2));

return report;
}

report();

module.exports={report};
