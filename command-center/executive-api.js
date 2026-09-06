const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();


function readJSON(file){

try{

return JSON.parse(
fs.readFileSync(file)
);

}

catch(e){

return [];

}

}


// Executive Overview

router.get("/overview",(req,res)=>{


const opportunities =
readJSON(
path.join(
__dirname,
"../data/opportunities.json"
)
);


const pipeline =
readJSON(
path.join(
__dirname,
"../data/pipeline.json"
)
);


res.json({

system:
"NIA CAPITAL OS",

status:
"ONLINE",


opportunities:
opportunities.length,


pipeline:
pipeline.leads ?
pipeline.leads.length :
0,


timestamp:
new Date().toISOString()


});


});



module.exports = router;

