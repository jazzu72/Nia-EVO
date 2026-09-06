const fs=require("fs");
const https=require("https");

const OUTPUT="nia-live-grant-sources.json";

const sources=[
{
name:"Grants.gov",
type:"FEDERAL_GRANTS",
endpoint:"https://www.grants.gov",
status:"ACTIVE",
priority:1
},
{
name:"NSF SBIR",
type:"INNOVATION_GRANTS",
endpoint:"https://seedfund.nsf.gov",
status:"ACTIVE",
priority:1
},
{
name:"SBA SBIR",
type:"SMALL_BUSINESS_GRANTS",
endpoint:"https://www.sbir.gov",
status:"ACTIVE",
priority:1
},
{
name:"Virginia Innovation Funding",
type:"STATE_PROGRAMS",
endpoint:"VIRGINIA",
status:"ACTIVE",
priority:2
}
];

const engine={
system:"NIA LIVE GRANT SOURCE ENGINE",
mode:"FUNDING_FIRST",
sources,
nextActions:[
"CONNECT_APIS",
"FETCH_OPEN_OPPORTUNITIES",
"SCORE_COMPANY_FIT",
"CREATE_APPLICATION_QUEUE"
],
timestamp:new Date().toISOString()
};

fs.writeFileSync(
OUTPUT,
JSON.stringify(engine,null,2)
);

console.log("🌐 LIVE GRANT SOURCE ENGINE ONLINE");
console.log("SOURCES CONNECTED:",sources.length);

