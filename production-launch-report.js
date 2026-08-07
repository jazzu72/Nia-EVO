const fs=require("fs");

let data=JSON.parse(fs.readFileSync("./data/revenue-pipeline.json","utf8"));

let report={
system:"NIA-CAPITAL-OS",
time:new Date().toISOString(),
deals:data.contacts.length,
proposals:data.contacts.filter(c=>c.proposalSent).length,
invoices:data.contacts.filter(c=>c.invoiceCreated).length,
closedDeals:data.contacts.filter(c=>c.dealStatus==="won").length,
revenue:data.revenue||0,
pipelineValue:data.pipelineValue||0,
status:"READY_FOR_CLOUD_DEPLOYMENT"
};

fs.writeFileSync("./production-launch-report.json",JSON.stringify(report,null,2));

console.log(report);
