// NIA OPPORTUNITY INTAKE ENGINE

const fs = require("fs");

const DB = "data/opportunities.json";


function load(){

    if(!fs.existsSync(DB)){
        fs.mkdirSync("data",{recursive:true});
        fs.writeFileSync(DB,"[]");
    }

    return JSON.parse(
        fs.readFileSync(DB,"utf8")
    );

}


function save(data){

    fs.writeFileSync(
        DB,
        JSON.stringify(data,null,2)
    );

}



function add(opportunity){

    const list = load();

    const item = {

        id:"OPP-"+Date.now(),

        company:
        opportunity.company || "Unknown",

        source:
        opportunity.source || "manual",

        problem:
        opportunity.problem || "",

        value:
        opportunity.value || 0,

        status:"new",

        created:
        new Date().toISOString()

    };


    list.push(item);

    save(list);


    return item;

}



function getAll(){

    return load();

}



module.exports={
    add,
    getAll
};
