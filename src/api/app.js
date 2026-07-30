const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


// ===============================
// CORE MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

app.use(express.static(
path.join(__dirname,"../../public")
));


// ===============================
// SYSTEM HEALTH
// ===============================

app.get("/api/health",(req,res)=>{

res.json({

system:"Nia Capital OS",

status:"ONLINE",

timestamp:new Date().toISOString(),

node:process.version

});

});


// ===============================
// MODULE LOADER
// ===============================


const modules = [

["customer-intake","customer-intake"],
["live-events","live-events"],
["revenue-leads","revenue-leads"],
["revenue-engine","revenue-engine"],
["revenue-dashboard","revenue-dashboard"],
["leads","leads"],
["realestate","realestate"],
["business","business"],
["grants","grants"],
["decision","decision"],
["memory","memory"],
["reports","reports"]

];


modules.forEach(([route,name])=>{

try{

app.use(
`/api/${route}`,
require(`../../modules/${name}/routes`)
);

console.log(
"LOADED:",
route
);

}

catch(err){

console.log(
"SKIPPED:",
route,
err.message
);

}

});



// ===============================
// 404
// ===============================

app.use((req,res)=>{

res.status(404).json({

error:"Route not found",

path:req.path

});

});


// ===============================
// ERROR CONTROL
// ===============================

app.use((err,req,res,next)=>{

console.error(err);

res.status(500).json({

error:"Nia Core Error"

});

});


module.exports = app;
