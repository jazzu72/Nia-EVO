const fs=require("fs");


function buildPackage(name,data){

const folder =
`funding/packages/${name}`;


fs.mkdirSync(
folder,
{recursive:true}
);


fs.writeFileSync(
`${folder}/executive-summary.md`,
`
# ${data.organization}

## Mission

${data.mission}

## Funding Request

$${data.amount}

## Use of Funds

${data.use}

`
);


fs.writeFileSync(
`${folder}/pitch-notes.md`,
`
# Investor / Grant Pitch

Problem:
${data.problem}

Solution:
${data.solution}

Technology:
${data.technology}

`
);


return folder;

}



module.exports={
buildPackage
};

