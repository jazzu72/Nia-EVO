// NIA Followup Engine

const fs = require("fs");

const DB = "data/followups.json";


function load(){

    if(!fs.existsSync(DB)){
        fs.mkdirSync("data",{recursive:true});
        fs.writeFileSync(DB,"[]");
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


function create(task){

    const followups = load();

    const item = {

        id:"FOLLOW-"+Date.now(),

        prospect: task.prospect || "Unknown",

        action: task.action || "Contact prospect",

        priority: task.priority || "NORMAL",

        status:"pending",

        created:new Date().toISOString()

    };


    followups.push(item);

    save(followups);


    return item;

}


function queue(){

    return load();

}


module.exports={

    create,

    queue

};
