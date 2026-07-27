const express=require('express');
const router=express.Router();
const fs=require('fs');

const calculateProfit=require('../services/profit-engine');

const DB='./modules/realestate/data/financials.json';

router.get('/',(req,res)=>{
 res.json(JSON.parse(fs.readFileSync(DB)));
});

router.post('/',(req,res)=>{

let records=JSON.parse(fs.readFileSync(DB));

const result=calculateProfit(req.body);

result.id=Date.now();
result.created=new Date().toISOString();

records.push(result);

fs.writeFileSync(DB,JSON.stringify(records,null,2));

res.json(result);

});

module.exports=router;
