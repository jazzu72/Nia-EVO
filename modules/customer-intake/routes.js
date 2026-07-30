const express=require("express");
const fs=require("fs");
const router=express.Router();

router.post("/",(req,res)=>{

let customers={customers:[]};

try{
 customers=JSON.parse(
  fs.readFileSync("./data/customer-intake.json","utf8")
 );
}catch(e){}

const customer={
 id:Date.now(),
 name:req.body.name||"Unknown",
 email:req.body.email||"",
 phone:req.body.phone||"",
 service:req.body.service||"",
 source:req.body.source||"WEBHOOK",
 createdAt:new Date().toISOString()
};

customers.customers.push(customer);

fs.mkdirSync("./data",{recursive:true});

fs.writeFileSync(
 "./data/customer-intake.json",
 JSON.stringify(customers,null,2)
);

res.json({
 status:"CUSTOMER_RECEIVED",
 customer
});

});

module.exports=router;
