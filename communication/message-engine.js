const fs = require("fs");
const path = require("path");

const DB =
path.join(
__dirname,
"../data/messages/messages.json"
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



function createMessage(message){

const messages = load();


const item = {

id:
"MSG-"+Date.now(),

channel:
message.channel || "internal",

recipient:
message.recipient || "",

subject:
message.subject || "",

body:
message.body || "",

status:
"queued",

created:
new Date().toISOString()

};


messages.push(item);

save(messages);


return item;

}



function queueFollowUp(lead){

return createMessage({

channel:"email",

recipient:
lead.contact,

subject:
"Following up on opportunity",

body:
`
Hello,

We are following up regarding ${lead.title}.

We would like to discuss next steps.

Thank you.

Nia Capital OS
`

});

}



function getQueue(){

return load()
.filter(
m=>m.status==="queued"
);

}



module.exports={

createMessage,

queueFollowUp,

getQueue

};

