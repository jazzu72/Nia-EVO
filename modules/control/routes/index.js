const express=require('express');
const router=express.Router();

const fs=require('fs');

function read(file,fallback){
try{
return JSON.parse(fs.readFileSync(file,'utf8'));
}catch(e){
return fallback;
}
}

router.get('/center',(req,res)=>{

const deals=read('./modules/realestate/data/deals.json',[]);
const business=read('./modules/business/data/business.json',{
customers:[],
leads:[],
invoices:[]
});

res.json({

system:"Nia Executive Control Center",
status:"online",

modules:{
realestate:{
deals:deals.length,
closed:deals.filter(d=>d.status==="closed").length
},

business:{
customers:business.customers.length,
leads:business.leads.length,
invoices:business.invoices.length
},

telegram:"connected",
ai:"active"
},

actions:[
"Review new leads",
"Analyze property opportunities",
"Follow up sellers",
"Monitor revenue pipeline"
],

timestamp:new Date().toISOString()

});

});

module.exports=router;
