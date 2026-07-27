const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.DASHBOARD_PORT || 5000;


app.use(express.json());

app.use(
express.static(
path.join(__dirname,"public")
)
);


app.get("/health",(req,res)=>{

res.json({

status:"Nia Dashboard Online",

time:new Date().toISOString()

});

});


app.get("/api/status",(req,res)=>{

res.json({

system:"NIA CAPITAL OS",

modules:[

"CEO",
"CRM",
"Finance",
"Growth",
"Memory",
"Evolution"

],

status:"ONLINE"

});

});
const monitor =
require("./api/system-monitor");


app.get("/api/metrics",(req,res)=>{

res.json(
monitor.metrics()
);

});


app.listen(PORT,"0.0.0.0",()=>{

console.log(
"🏰 Nia Command Dashboard running on "+PORT
);

});

