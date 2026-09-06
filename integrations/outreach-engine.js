const fs = require("fs");


const FILE =
"data/integrations/outreach.json";


function load(){

if(!fs.existsSync(FILE))
fs.writeFileSync(FILE,"[]");


return JSON.parse(
fs.readFileSync(FILE)
);

}



function sendMessage(data){

const messages=load();


const message={

id:
"MSG-"+Date.now(),

recipient:
data.recipient,

subject:
data.subject,

body:
data.body,

status:
"queued",

created:
new Date().toISOString()

};


messages.push(message);


fs.writeFileSync(
FILE,
JSON.stringify(messages,null,2)
);


return message;

}



module.exports={

sendMessage

};

