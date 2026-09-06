const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname,"../data/opportunities.json");

function load(){
    if(!fs.existsSync(DB)){
        fs.writeFileSync(DB, JSON.stringify([],null,2));
    }
    return JSON.parse(fs.readFileSync(DB));
}

function save(data){
    fs.writeFileSync(DB,JSON.stringify(data,null,2));
}


function calculateScore(item){

    let score = 0;

    if(item.type==="grant") score += 40;
    if(item.type==="contract") score += 35;
    if(item.type==="investor") score += 45;
    if(item.type==="property") score += 25;
    if(item.type==="job") score += 15;

    if(item.amount){

        if(item.amount >= 1000000)
            score += 40;

        else if(item.amount >= 250000)
            score += 25;

        else if(item.amount >= 50000)
            score += 15;
    }


    if(item.ai)
        score += 15;

    if(item.quantum)
        score += 15;

    if(item.education)
        score += 10;


    return score;
}


function addOpportunity(item){

    const data = load();

    const opportunity = {

        id:
        "OPP-"+Date.now(),

        ...item,

        score:
        calculateScore(item),

        status:
        "discovered",

        created:
        new Date().toISOString()
    };


    data.push(opportunity);

    save(data);

    return opportunity;
}



function topOpportunities(){

    return load()
    .sort((a,b)=>b.score-a.score)
    .slice(0,10);

}



module.exports={
    addOpportunity,
    topOpportunities,
    calculateScore
};



function topOpportunities(){

    return load()
    .sort((a,b)=>b.score-a.score)
    .slice(0,10);

}


module.exports.topOpportunities = topOpportunities;

