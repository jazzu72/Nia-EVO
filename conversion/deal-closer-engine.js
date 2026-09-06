// NIA DEAL CLOSER ENGINE

const fs = require("fs");

const DB =
"data/deals.json";


function load(){

    if(!fs.existsSync(DB)){

        fs.mkdirSync(
            "data",
            {recursive:true}
        );

        fs.writeFileSync(
            DB,
            "[]"
        );
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



function createDeal(input){

    const deals =
    load();


    const deal = {

        id:
        "DEAL-"+Date.now(),

        company:
        input.company,

        contact:
        input.contact || "Owner",

        value:
        input.value || 2500,

        stage:
        "PROSPECT",

        nextAction:
        "Contact lead",

        created:
        new Date().toISOString()

    };


    deals.push(deal);

    save(deals);


    return deal;

}



function updateStage(id,stage){

    const deals =
    load();


    const deal =
    deals.find(
        d=>d.id===id
    );


    if(!deal)
        return null;


    deal.stage=stage;


    if(stage==="PROPOSAL"){

        deal.nextAction=
        "Schedule follow-up";

    }


    if(stage==="CLOSED"){

        deal.nextAction=
        "Collect payment";

    }


    save(deals);


    return deal;

}



function pipeline(){

    return load();

}



module.exports={

    createDeal,

    updateStage,

    pipeline

};
