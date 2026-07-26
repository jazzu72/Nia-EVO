// NIA REVENUE ENGINE

const fs = require("fs");

const DB = "data/revenue/deals.json";


function load(){

    if(!fs.existsSync(DB)){

        fs.mkdirSync(
            "data/revenue",
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



function addDeal(deal){

    const deals = load();


    const item = {

        id:
        "DEAL-"+Date.now(),

        company:
        deal.company || "Unknown",

        contact:
        deal.contact || "Owner",

        service:
        deal.service || "AI Automation",

        value:
        Number(deal.value || 0),

        stage:
        "new",

        created:
        new Date().toISOString()

    };


    deals.push(item);

    save(deals);


    return item;

}



function pipeline(){

    return load();

}



function dashboard(){

    const deals = load();


    return {

        totalDeals:
        deals.length,


        pipelineValue:
        deals.reduce(
            (sum,d)=>
            sum + Number(d.value || 0),
            0
        ),


        stages:{

            new:
            deals.filter(
                d=>d.stage==="new"
            ).length,


            contacted:
            deals.filter(
                d=>d.stage==="contacted"
            ).length,


            closed:
            deals.filter(
                d=>d.stage==="closed"
            ).length

        },


        updated:
        new Date().toISOString()

    };

}



module.exports={

    addDeal,

    pipeline,

    dashboard

};
