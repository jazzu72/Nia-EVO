const fs = require("fs");
const path = require("path");


const DB =
path.join(
__dirname,
"../data/communications/messages.json"
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



function createMessage(input){

const messages = load();


let template = "";


if(input.type==="grant"){

template =
`
Subject: Funding Opportunity Inquiry - House of Jazzu

Hello ${input.recipient || "Team"},

I am reaching out on behalf of House of Jazzu,
an AI technology company developing innovative
solutions through our Nia platform.

We are interested in learning more about your
funding opportunities and alignment with our mission.

We would appreciate the opportunity to discuss
eligibility and next steps.

Thank you.

Jason Lesane
House of Jazzu
`;

}



else if(input.type==="investor"){

template =
`
Subject: Partnership Opportunity - House of Jazzu

Hello ${input.recipient || "Investor"},

House of Jazzu is building an AI-powered technology
ecosystem designed to create scalable solutions.

We would like to explore strategic investment
and partnership opportunities.

We look forward to connecting.

Jason Lesane
`;

}



else {

template =
`
Subject: Business Inquiry

Hello ${input.recipient || "Team"},

I would like to discuss a potential opportunity
with House of Jazzu.

Thank you.

Jason Lesane
`;

}



const message={

id:
"MSG-"+Date.now(),

type:
input.type || "general",

recipient:
input.recipient || "",

subject:
input.subject || "Opportunity",

body:
template,

status:
"draft",

created:
new Date().toISOString()

};


messages.push(message);

save(messages);


return message;

}



function getMessages(){

return load();

}


module.exports={

createMessage,

getMessages

};

