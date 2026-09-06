// NIA Proposal Generation Engine

const fs = require("fs");

const DB = "data/proposals.json";


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



function createProposal(prospect){

    let proposals = load();


    const proposal = {

        id:"PROP-"+Date.now(),

        company:
            prospect.company || "Unknown",

        contact:
            prospect.contact || "",

        service:
            prospect.service || "Nia AI Automation",

        value:
            prospect.value || 1000,


        status:"draft",


        summary:
        `Nia Capital OS proposes AI automation services 
        designed to reduce operating costs, improve 
        productivity, and increase revenue for ${prospect.company}.`,


        created:
            new Date().toISOString()

    };


    proposals.push(proposal);

    save(proposals);


    return proposal;

}



function list(){

    return load();

}



module.exports={

createProposal,

list

};
