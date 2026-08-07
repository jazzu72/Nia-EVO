const fs=require("fs");

const FILE="nia-actions.json";

let actions=fs.existsSync(FILE)
?JSON.parse(fs.readFileSync(FILE))
:[];

const grants=[
{
id:"GRANT-ACTION-001",
action:"VERIFY_GRANT_ELIGIBILITY",
type:"GRANTS",
priority:1,
source:"NSF-SBIR",
status:"READY"
},
{
id:"GRANT-ACTION-002",
action:"BUILD_GRANT_NARRATIVE",
type:"GRANTS",
priority:1,
source:"SBA-SBIR",
status:"READY"
},
{
id:"GRANT-ACTION-003",
action:"GENERATE_APPLICATION_PACKET",
type:"GRANTS",
priority:1,
source:"VIRGINIA-INNOVATION",
status:"READY"
},
{
id:"GRANT-ACTION-004",
action:"TRACK_GRANT_DEADLINES",
type:"GRANTS",
priority:1,
source:"FEDERAL_PROGRAMS",
status:"READY"
}
];

actions=[
...grants,
...actions.filter(a=>a.type!=="GRANTS")
];

fs.writeFileSync(
FILE,
JSON.stringify(actions,null,2)
);

console.log("💰 GRANT ACTIONS INJECTED");
console.log("TOTAL ACTIONS:",actions.length);
