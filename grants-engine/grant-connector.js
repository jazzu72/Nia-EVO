const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname,"qualified-grants.json");

function scanGrants(){

const grants=[
{
name:"NSF America Seed Fund",
amount:"$50,000-$2,000,000",
focus:[
"AI",
"software",
"technology",
"innovation"
],
score:0
},
{
name:"Virginia Innovation Partnership Corporation",
amount:"Varies",
focus:[
"startup",
"technology",
"Virginia"
],
score:0
},
{
name:"SBIR/STTR Programs",
amount:"Up to millions",
focus:[
"research",
"AI",
"technology"
],
score:0
},
{
name:"Economic Development Grants",
amount:"Varies",
focus:[
"small business",
"community impact",
"jobs"
],
score:0
}
];


const companyProfile={
name:"House of Jazzu",
location:"Norfolk Virginia",
industries:[
"AI",
"FinTech",
"education",
"music technology",
"software"
]
};


const qualified=grants.map(g=>{

let score=0;

g.focus.forEach(item=>{

companyProfile.industries.forEach(ind=>{

if(item.toLowerCase().includes(ind.toLowerCase()))
score+=25;

});

});


if(companyProfile.location.includes("Virginia")
&& g.focus.includes("Virginia"))
score+=25;


g.score=score;


return g;

})
.filter(g=>g.score>=25)
.sort((a,b)=>b.score-a.score);


fs.writeFileSync(
FILE,
JSON.stringify(qualified,null,2)
);


return qualified;

}


module.exports={
scanGrants
};
