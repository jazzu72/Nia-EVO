const express = require("express");
const db = require("./prospect-db");

const router = express.Router();


// Top prospects
router.get("/top", (req,res)=>{
    res.json({
        status:"online",
        prospects: db.getTop ? db.getTop() : [],
        timestamp:new Date().toISOString()
    });
});


// Add prospect
router.post("/", (req,res)=>{

    const prospect = {
        id: Date.now(),
        name:req.body.name || "Unknown",
        company:req.body.company || "",
        value:req.body.value || 0,
        status:"new",
        created:new Date().toISOString()
    };

    if(db.add){
        db.add(prospect);
    }

    res.json({
        success:true,
        prospect
    });

});


module.exports = router;
