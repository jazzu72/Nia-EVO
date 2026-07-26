const fs = require("fs");

const DB = "data/revenue/followups.json";


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


function addFollowup(data){

    let tasks = load();


    const task = {

        id:"FOLLOW-"+Date.now(),

        prospect:data.prospect || "Unknown",

        action:data.action || "Contact prospect",

        priority:data.priority || "MEDIUM",

        status:"pending",

        created:new Date().toISOString()

    };


    tasks.push(task);


    fs.writeFileSync(
        DB,
        JSON.stringify(tasks,null,2)
    );


    return task;

}



function queue(){

    return load()
        .sort((a,b)=>{

            const priority={
                HIGH:3,
                MEDIUM:2,
                LOW:1
            };

            return priority[b.priority] -
                   priority[a.priority];

        });

}



module.exports={
    addFollowup,
    queue
};
