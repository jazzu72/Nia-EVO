const express=require('express');
const router=express.Router();
const fs=require('fs');
const {sendInvestorPackage}=require('../../notifications/investor-package-alert');

const DB="./modules/investor-packages/data/packages.json";

function read(){
try{
return JSON.parse(fs.readFileSync(DB,'utf8'));
}catch{
return [];
}
}

function save(data){
fs.writeFileSync(DB,JSON.stringify(data,null,2));
}

router.post('/generate',(req,res)=>{

const packages=read();

const pack={
id:Date.now(),
address:req.body.address||"Unknown",
summary:{
arv:req.body.arv||0,
purchasePrice:req.body.purchasePrice||0,
repairs:req.body.repairs||0,
profit:req.body.profit||0
},
status:"investor_package_ready",
created:new Date().toISOString()
};

packages.push(pack);
sendInvestorPackage(pack);
save(packages);

res.json({
success:true,
package:pack
});

});

router.get('/all',(req,res)=>{
res.json({
system:"Nia Investor Package Engine",
count:read().length,
packages:read()
});
});

module.exports=router;
