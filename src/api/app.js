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

app.use(
  express.static(
    path.join(__dirname, "../../public")
  )
);


// ===============================
// SYSTEM HEALTH CORE
// ===============================

app.get("/api/health", (req, res) => {

  res.json({

    system: "Nia Capital OS",

    status: "ONLINE",

    timestamp: new Date().toISOString(),

    node: process.version

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
  ["opportunities","opportunities"],
  ["realestate","realestate"],
  ["business","business"],
  ["grants","grants"],
  ["decision","decision"],
  ["memory","memory"],
  ["reports","reports"],
  ["system-health","system-health"]

];


modules.forEach(([name, path]) => {

  try {

    app.use(
      `/api/${name}`,
      require(`../../modules/${path}/routes`)
    );

    console.log(`LOADED: ${name}`);

  } catch(err) {

    console.log(`FAILED: ${name}`, err.message);

  }

});

// ===============================
// ROOT STATUS
// ===============================

app.get("/api/status",(req,res)=>{

  res.json({

    system:"NIA CAPITAL OS",

    status:"ONLINE",

    mode:"EXECUTIVE CORE",

    modules:modules.length

  });

});


// ===============================
// 404 HANDLER
// ===============================

app.use((req,res)=>{

  res.status(404).json({

    error:"Route not found",

    path:req.path

  });

});


// ===============================
// ERROR HANDLER
// ===============================

app.use((err,req,res,next)=>{

  console.error(err);

  res.status(500).json({

    error:"Internal Server Error",

    message:err.message

  });

});


module.exports = app;
