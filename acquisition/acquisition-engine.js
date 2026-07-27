const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname,"../data/acquisition.json");


function load(){

    if(!fs.existsSync(DB)){
        fs.writeFileSync(DB, JSON.stringify([],null,2));
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


function createTarget(target){

    const data = load();

    const item = {

        id:
        "TARGET-"+Date.now(),

        company:
        target.company || "",

        contact:
        target.contact || "",

        email:
        target.email || "",

        opportunity:
        target.opportunity || "",

        value:
        target.value || 0,

        source:
        target.source || "unknown",

        status:
        "identified",

        created:
        new Date().toISOString()

    };


    data.push(item);

    save(data);

    return item;

}



function getTargets(){

    return load();

}



function qualify(target){

    let score = 0;


    if(target.value >= 1000000)
        score += 50;

    else if(target.value >= 250000)
        score += 30;

    else if(target.value >= 50000)
        score += 20;


    if(target.opportunity
        .toLowerCase()
        .includes("grant"))
        score += 25;


    if(target.opportunity
        .toLowerCase()
        .includes("ai"))
        score += 20;


    return score;

}



module.exports={
    createTarget,
    getTargets,
    qualify
};

