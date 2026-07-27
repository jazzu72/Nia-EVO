// NIA LEAD ACQUISITION ENGINE

const sales =
require("../sales/nia-sales-engine");


function generateTargets(){

    return [

        {
            company:"Norfolk Restaurant",
            industry:"Food Service",
            problem:"Needs customer automation",
            employees:20,
            value:5000
        },

        {
            company:"Hampton Roads Contractor",
            industry:"Construction",
            problem:"Needs workflow automation",
            employees:15,
            value:7500
        },

        {
            company:"Local Medical Practice",
            industry:"Healthcare",
            problem:"Needs appointment automation",
            employees:10,
            value:5000
        }

    ];

}



function acquire(){

    const targets =
    generateTargets();


    const scored =
    targets.map(target=>{

        return sales.analyzeLead(target);

    });


    return {

        discovered:
        targets.length,

        qualified:
        scored.filter(
            x=>x.priority==="HIGH"
        ).length,

        leads:
        scored,

        timestamp:
        new Date().toISOString()

    };

}



module.exports={
    acquire
};
