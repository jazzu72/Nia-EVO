const fs = require("fs");
const path = require("path");

const DB = path.join(__dirname,"../data/revenue.json");


function load(){

    if(!fs.existsSync(DB)){
        fs.writeFileSync(DB,JSON.stringify([],null,2));
    }

    return JSON.parse(fs.readFileSync(DB));
}


function save(data){
    fs.writeFileSync(DB,JSON.stringify(data,null,2));
}


// Add revenue opportunity

function addRevenue(item){

    const data = load();

    const record = {

        id:"REV-"+Date.now(),

        name:item.name || "Unknown",

        source:item.source || "CRM",

        value:Number(item.value || 0),

        status:"pipeline",

        probability:item.probability || 25,

        created:new Date().toISOString()

    };


    data.push(record);

    save(data);

    return record;
}


// Calculate pipeline value

function pipelineValue(){

    const data = load();

    return data.reduce((total,item)=>{

        return total +
        (item.value * item.probability / 100);

    },0);

}


// CEO summary

function summary(){

    const data = load();

    return {

        opportunities:data.length,

        totalPotential:data.reduce(
            (a,b)=>a+b.value,0
        ),

        weightedPipeline:pipelineValue()

    };

}


module.exports={
    addRevenue,
    summary
};

