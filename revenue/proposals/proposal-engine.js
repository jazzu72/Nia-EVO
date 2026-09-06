const fs = require("fs");

const DB = "data/revenue/proposals.json";


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


function createProposal(data){

    const proposals = load();


    const proposal = {

        id:"PROP-"+Date.now(),

        company:
            data.company || "Unknown",

        service:
            data.service || 
            "AI Automation",

        value:
            Number(data.value) || 5000,

        status:"draft",

        created:
            new Date().toISOString()

    };


    proposals.push(proposal);


    fs.writeFileSync(
        DB,
        JSON.stringify(
            proposals,
            null,
            2
        )
    );


    return proposal;

}


function list(){

    return load();

}


module.exports={
    createProposal,
    list
};
