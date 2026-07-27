const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(
__dirname,
"../data/applications"
);


function createApplication(grant){

const application = {

id:
"APP-"+Date.now(),

grantTitle:
grant.title,

organization:
grant.organization || "",

fundingRequest:
grant.amount || 0,


executiveSummary:

`
House of Jazzu is developing AI-powered technology solutions
focused on innovation, education, and economic empowerment.

Our platform combines artificial intelligence, automation,
and emerging technologies to create scalable solutions
for businesses and communities.
`,



problemStatement:

`
Small businesses and underserved communities face challenges
accessing advanced technology, funding opportunities,
and operational automation.
`,



innovation:

`
House of Jazzu addresses these challenges through Nia,
an autonomous AI operating system designed to identify
opportunities, automate business workflows, and improve
decision making.
`,



impact:

`
The project will create economic opportunities,
increase technology access, and support innovation-driven
growth.
`,



budgetJustification:

`
Requested funding will support:

- Software development
- Cloud infrastructure
- AI development
- Testing and deployment
- Business operations
`,



checklist:[

"Verify eligibility",

"Complete application questions",

"Attach company documents",

"Submit before deadline"

],



created:
new Date().toISOString()

};


if(!fs.existsSync(OUTPUT)){
fs.mkdirSync(
OUTPUT,
{recursive:true}
);
}


fs.writeFileSync(

path.join(
OUTPUT,
application.id+".json"
),

JSON.stringify(
application,
null,
2
)

);


return application;

}


module.exports={
createApplication
};

