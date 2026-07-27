const fs = require("fs");
const path = require("path");


const OUTPUT =
path.join(
__dirname,
"../grant-packages"
);



function ensure(){

if(!fs.existsSync(OUTPUT)){
fs.mkdirSync(
OUTPUT,
{recursive:true}
);
}

}



function generatePackage(grant, founder){

ensure();


const folder =
path.join(
OUTPUT,
grant.id || "package-"+Date.now()
);


fs.mkdirSync(
folder,
{recursive:true}
);



const executive = `

HOUSE OF JAZZU

Executive Summary

Company:
${founder.company || ""}

Mission:
${founder.mission || ""}

Technology:
${founder.technology || ""}

Funding Request:
$${grant.amount || 0}

Purpose:
Support development, deployment,
and scaling of innovative technology solutions.

`;



const founderProfile = `

Founder Profile

Company:
${founder.company}

Location:
${founder.location}

Industry:
Technology Innovation

`;



const technical = `

Technical Proposal

Project:
${grant.title}

Organization:
${grant.organization}

House of Jazzu will utilize
AI automation, software systems,
and emerging technologies
to create scalable solutions.

`;



const budget = `

Budget Justification

Requested Amount:
$${grant.amount || 0}

Allocation:

Software Development
AI Infrastructure
Cloud Services
Testing
Operations

`;



fs.writeFileSync(
path.join(folder,"Executive_Summary.txt"),
executive
);


fs.writeFileSync(
path.join(folder,"Founder_Profile.txt"),
founderProfile
);


fs.writeFileSync(
path.join(folder,"Technical_Proposal.txt"),
technical
);


fs.writeFileSync(
path.join(folder,"Budget.txt"),
budget
);



fs.writeFileSync(
path.join(folder,"Submission_Checklist.json"),
JSON.stringify({

documents:[

"Executive Summary",
"Founder Profile",
"Technical Proposal",
"Budget"

],

status:"READY FOR REVIEW"

},null,2)
);



return folder;

}



module.exports={
generatePackage
};

