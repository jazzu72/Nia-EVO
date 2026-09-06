const fs = require("fs");

const DB = "data/revenue/outreach.json";


function load(){

    if(!fs.existsSync(DB)){
        fs.mkdirSync(
            "data/revenue",
            {recursive:true}
        );

        fs.writeFileSync(DB,"[]");
    }

    return JSON.parse(
        fs.readFileSync(DB)
    );

}



function createMessage(data){

    const messages = load();


    const message = {

        id:"MSG-"+Date.now(),

        company:
            data.company || "Unknown",

        channel:
            data.channel || "email",

        subject:
            data.subject ||
            "AI Automation Opportunity",

        message:
            data.message ||
            "We can help automate your business operations.",

        status:"ready",

        created:
            new Date().toISOString()

    };


    messages.push(message);


    fs.writeFileSync(
        DB,
        JSON.stringify(messages,null,2)
    );


    return message;

}



function queue(){

    return load();

}



module.exports = {
    createMessage,
    queue
};
