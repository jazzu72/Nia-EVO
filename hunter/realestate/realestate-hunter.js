// NIA REAL ESTATE HUNTER

const fs = require("fs");

const revenueConnector =
require("./revenue-connector");


const DB = "data/prospects/realestate.json";


function load(){

    if(!fs.existsSync(DB)){

        fs.mkdirSync("data/prospects", {
            recursive:true
        });

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



function addBrokerage(data){

    const prospects = load();


    const lead = {

        id:
        "RE-" + Date.now(),

        company:
        data.company,

        contact:
        data.contact || "Owner",

        city:
        data.city || "Virginia",

        website:
        data.website || "",

        agents:
        data.agents || 0,

        service:
        "AI Automation for Real Estate",

        value:
        data.value || 5000,

        status:
        "new",

        created:
        new Date().toISOString()

    };


    prospects.push(lead);

    save(prospects);


    const opportunity =
        revenueConnector.createOpportunity(lead);


    return {

        lead,

        opportunity

    };

}



function list(){

    return load();

}



module.exports = {

    addBrokerage,

    list

};
