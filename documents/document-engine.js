const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts } = require("pdf-lib");


const DB =
path.join(
__dirname,
"../data/documents/documents.json"
);


function load(){

if(!fs.existsSync(DB)){
fs.writeFileSync(
DB,
JSON.stringify([],null,2)
);
}

return JSON.parse(
fs.readFileSync(DB)
);

}


function save(data){

fs.writeFileSync(
DB,
JSON.stringify(data,null,2)
);

}



async function createProposal(data){

const pdf =
await PDFDocument.create();


const page =
pdf.addPage([600,800]);


const font =
await pdf.embedFont(
StandardFonts.Helvetica
);


page.drawText(
`Proposal: ${data.title}`,
{
x:50,
y:740,
size:22,
font
}
);


page.drawText(
`
Organization:
${data.organization}

Amount:
$${data.amount || "TBD"}

Purpose:
${data.description || ""}

Prepared by:
Nia Capital OS
`,
{
x:50,
y:650,
size:14,
font
}
);


const bytes =
await pdf.save();


const filename =
`documents/${Date.now()}-proposal.pdf`;


fs.writeFileSync(
filename,
bytes
);


const docs = load();


docs.push({

id:"DOC-"+Date.now(),

type:"proposal",

file:filename,

created:
new Date().toISOString()

});


save(docs);


return filename;

}



function list(){

return load();

}



module.exports={

createProposal,

list

};

