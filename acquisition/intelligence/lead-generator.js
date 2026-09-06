const fs = require("fs");

const DB = "data/acquisition/leads.json";


function load(){

    if(!fs.existsSync(DB)){
        fs.mkdirSync("data/acquisition",{recursive:true});
        fs.writeFileSync(DB,"[]");
    }

    return JSON.parse(
        fs.readFileSync(DB)
    );
}


function generateLead(data){

    let leads = load();

    const lead = {

        id:
        "LEAD-"+Date.now(),

        company:
        data.company || "Local Business",

        industry:
        data.industry || "Small Business",

        service:
        "AI Automation",

        score:
        Math.floor(Math.random()*40)+60,

        status:
        "new",

        created:
        new Date().toISOString()

    };


    leads.push(lead);


    fs.writeFileSync(
        DB,
        JSON.stringify(leads,null,2)
    );


    return lead;

}


function topLeads(){

    return load()
    .sort((a,b)=>b.score-a.score)
    .slice(0,10);

}


module.exports={
    generateLead,
    topLeads
};
