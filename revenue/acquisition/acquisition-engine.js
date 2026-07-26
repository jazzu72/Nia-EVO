const fs = require("fs");

const PROSPECT_DB = "data/revenue/prospects.json";


function load(){

    if(!fs.existsSync(PROSPECT_DB)){
        fs.mkdirSync(
            "data/revenue",
            {recursive:true}
        );

        fs.writeFileSync(
            PROSPECT_DB,
            "[]"
        );
    }

    return JSON.parse(
        fs.readFileSync(PROSPECT_DB)
    );

}


function addProspect(data){

    const prospects = load();


    const prospect = {

        id:"PROS-"+Date.now(),

        company:data.company || "Unknown",

        contact:data.contact || "",

        industry:data.industry || "Unknown",

        estimatedValue:
            Number(data.value) || 1000,

        status:"new",

        score:calculateScore(data),

        created:new Date().toISOString()

    };


    prospects.push(prospect);


    fs.writeFileSync(
        PROSPECT_DB,
        JSON.stringify(
            prospects,
            null,
            2
        )
    );


    return prospect;

}



function calculateScore(data){

    let score = 0;


    if(data.value >= 5000)
        score += 40;

    else if(data.value >= 1000)
        score += 20;


    if(data.industry)
        score += 20;


    if(data.contact)
        score += 20;


    return score;

}



function topProspects(){

    return load()
        .sort(
            (a,b)=>b.score-a.score
        )
        .slice(0,10);

}



module.exports = {

    addProspect,

    topProspects

};
