// NIA AUTONOMOUS OPERATING LOOP

const router =
require("../router/opportunity-router");

const memory =
require("../memory/nia-memory");


function execute(opportunity){

    console.log(
        "🤖 NIA PROCESSING:",
        opportunity.company
    );


    let decision;


    try {

        decision =
        router.evaluate(opportunity);


        memory.remember({

            type:"decision",

            subject:
            opportunity.company,

            result:
            decision.status === "accepted"
            ?
            "success"
            :
            "review",

            value:
            opportunity.value

        });


        return {

            success:true,

            opportunity,

            decision

        };


    } catch(error){


        memory.remember({

            type:"error",

            subject:
            opportunity.company,

            result:"failed",

            value:0

        });


        return {

            success:false,

            error:error.message

        };

    }

}


module.exports={
    execute
};
