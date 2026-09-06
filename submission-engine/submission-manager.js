const fs = require("fs");
const path = require("path");

const DB = path.join(
__dirname,
"../data/submissions/submissions.json"
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



function createSubmission(grant){

const submissions = load();


const submission = {

id:
"SUB-"+Date.now(),

grant:
grant.title,

organization:
grant.organization || "",

amount:
grant.amount || 0,

deadline:
grant.deadline || "Unknown",

status:
"Draft",


documents:[

{
name:"Business Profile",
complete:false
},

{
name:"Executive Summary",
complete:false
},

{
name:"Budget",
complete:false
},

{
name:"Technical Description",
complete:false
},

{
name:"Founder Information",
complete:false
}

],


created:
new Date().toISOString()

};


submissions.push(submission);

save(submissions);


return submission;

}




function updateDocument(id,documentName){

const submissions = load();


const submission =
submissions.find(
s=>s.id===id
);


if(!submission)
return null;


const doc =
submission.documents.find(
d=>d.name===documentName
);


if(doc)
doc.complete=true;



if(
submission.documents.every(
d=>d.complete
)
){

submission.status=
"READY FOR SUBMISSION";

}
else{

submission.status=
"IN PROGRESS";

}


save(submissions);


return submission;

}



function getSubmissions(){

return load();

}



module.exports={

createSubmission,
updateDocument,
getSubmissions

};

