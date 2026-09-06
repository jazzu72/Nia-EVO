const express=require("express");
const fs=require("fs");
const router=express.Router();

router.post("/",(req,res)=>{

let data={opportunities:[]};

try{
 data=JSON.parse(fs.readFileSync("./data/opportunities.json","utf8"));
}catch(e){}

const opportunity={
 id:Date.now(),
 name:req.body.name||"Unknown",
 company:req.body.company||"",
 email:req.body.email||"",
 service:req.body.service||"",
 value:Number(req.body.value)||0,
 status:"NEW",
 createdAt:new Date().toISOString()
};

data.opportunities.push(opportunity);

fs.mkdirSync("./data",{recursive:true});

fs.writeFileSync(
 "./data/opportunities.json",
 JSON.stringify(data,null,2)
);

res.json({
 status:"OPPORTUNITY_RECEIVED",
 opportunity
});

});

module.exports=router;
