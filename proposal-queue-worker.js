const fs=require("fs");
const path=require("path");

const FILE="./data/revenue-pipeline.json";
const DIR="./data/proposals";

function run(){

if(!fs.existsSync(DIR)) fs.mkdirSync(DIR,{recursive:true});

let data=JSON.parse(fs.readFileSync(FILE,"utf8"));

let queued=data.contacts.filter(c=>
 c.triggerProposal &&
 !c.proposalSent &&
 c.dealStatus!=="won"
);

if(!queued.length){
 console.log("📭 No proposals queued");
 return;
}

queued.forEach(c=>{

let file=`${DIR}/proposal-${c.id}.txt`;

let proposal=
`NIA-CAPITAL-OS AI AUTOMATION PROPOSAL

Client: ${c.company||c.name}

We help businesses automate operations using AI systems.

Recommended Solution:
- AI workflow automation
- Customer follow-up systems
- Revenue optimization

Estimated Investment:
$2,500

Prepared by:
NIA-CAPITAL-OS

Generated:
${new Date().toISOString()}
`;

fs.writeFileSync(file,proposal);

c.proposalSent=true;
c.proposalFile=file;
c.lastAction="AI proposal generated";
c.lastUpdated=new Date().toISOString();

});

fs.writeFileSync(FILE,JSON.stringify(data,null,2));

console.log(`📄 Generated ${queued.length} proposals`);

}

run();
