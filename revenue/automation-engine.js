// NIA Revenue Automation Engine

const fs = require("fs");

const DB = "data/revenue/actions.json";


function load(){

    if(!fs.existsSync(DB)){
        fs.mkdirSync("data/revenue",{recursive:true});
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


// Create revenue action
function createAction(task){

    let actions = load();

    const action = {

        id:"ACTION-"+Date.now(),

        type:task.type || "REVENUE_TASK",

        priority:task.priority || "NORMAL",

        instruction:task.instruction || "Generate revenue",

        status:"pending",

        created:new Date().toISOString()

    };


    actions.push(action);

    save(actions);

    return action;

}


// Queue
function queue(){

    return load();

}


module.exports = {

    createAction,

    queue

};
