const fs = require("fs");

const DB = "data/revenue/conversions.json";


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



function updateDeal(data){

    const deals = load();


    const deal = {

        id:"DEAL-"+Date.now(),

        company:
            data.company || "Unknown",

        value:
            Number(data.value) || 0,

        stage:
            data.stage || "contacted",

        notes:
            data.notes || "",

        created:
            new Date().toISOString()

    };


    deals.push(deal);


    fs.writeFileSync(
        DB,
        JSON.stringify(
            deals,
            null,
            2
        )
    );


    return deal;

}



function dashboard(){

    const deals = load();


    const won =
        deals.filter(
            d=>d.stage==="won"
        );


    return {

        totalDeals:deals.length,

        wonDeals:won.length,

        revenue:
            won.reduce(
                (sum,d)=>
                sum+d.value,
                0
            ),

        stages:{

            contacted:
                deals.filter(
                    d=>d.stage==="contacted"
                ).length,

            proposal:
                deals.filter(
                    d=>d.stage==="proposal"
                ).length,

            won:
                won.length,

            lost:
                deals.filter(
                    d=>d.stage==="lost"
                ).length
        },

        updated:
            new Date().toISOString()

    };

}



module.exports={
    updateDeal,
    dashboard
};
