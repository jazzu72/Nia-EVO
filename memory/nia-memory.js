// NIA MEMORY ENGINE

const fs = require("fs");

const DB = "data/nia-memory.json";


function load(){

    if(!fs.existsSync(DB)){

        fs.mkdirSync("data",{recursive:true});

        fs.writeFileSync(
            DB,
            "[]"
        );
    }


    return JSON.parse(
        fs.readFileSync(DB,"utf8")
    );

}



function save(memory){

    fs.writeFileSync(
        DB,
        JSON.stringify(memory,null,2)
    );

}



function remember(event){

    const memory = load();


    const item = {

        id:"MEM-"+Date.now(),

        type:event.type || "event",

        subject:event.subject || "",

        result:event.result || "",

        value:event.value || 0,

        created:
        new Date().toISOString()

    };


    memory.push(item);

    save(memory);


    return item;

}



function recall(){

    return load();

}



function score(){

    const memory = load();


    let wins = 0;
    let losses = 0;


    memory.forEach(item=>{

        if(item.result==="success"){
            wins++;
        }

        if(item.result==="failed"){
            losses++;
        }

    });


    return {

        totalEvents:memory.length,

        wins,

        losses,

        successRate:
        memory.length
        ?
        ((wins/memory.length)*100).toFixed(2)+"%"
        :
        "0%"

    };

}



module.exports={

    remember,

    recall,

    score

};
