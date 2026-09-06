const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const MEMORY_FILE = path.join(
    process.cwd(),
    "runtime/memory/nia_commands.json"
);

function analyzeCommand(command){

    const text = command.toLowerCase();

    if(text.includes("grant") || text.includes("fund"))
        return "GRANTS_ENGINE";

    if(text.includes("property") || text.includes("real estate"))
        return "REAL_ESTATE_ENGINE";

    if(text.includes("deal") || text.includes("offer"))
        return "DEAL_ENGINE";

    if(text.includes("report") || text.includes("status"))
        return "REPORTING_ENGINE";

    if(text.includes("money") || text.includes("revenue"))
        return "REVENUE_ENGINE";

    return "GENERAL_ASSISTANT";
}


router.post("/",(req,res)=>{

    const command = req.body.command || "";
    const engine = analyzeCommand(command);

    let memory=[];

    if(fs.existsSync(MEMORY_FILE)){
        memory = JSON.parse(fs.readFileSync(MEMORY_FILE));
    }

    memory.push({
        command,
        engine,
        timestamp:new Date().toISOString()
    });

    fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify(memory,null,2)
    );

    res.json({
        received:command,
        routed_to:engine,
        memory_saved:true,
        message:`Nia routed your request to ${engine} and saved the interaction.`
    });

});


router.get("/memory",(req,res)=>{
    if(fs.existsSync(MEMORY_FILE)){
        return res.json(JSON.parse(fs.readFileSync(MEMORY_FILE)));
    }

    res.json([]);
});


module.exports = router;
