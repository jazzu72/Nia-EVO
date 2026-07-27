const express=require('express');
const router=express.Router();
const fs=require('fs');

const base='./modules/realestate/data/';

function load(f){
 return JSON.parse(fs.readFileSync(base+f+'.json'));
}

function save(f,d){
 fs.writeFileSync(base+f+'.json',JSON.stringify(d,null,2));
}

['contractors','lenders','attorneys'].forEach(type=>{
 router.get('/'+type,(req,res)=>res.json(load(type)));

 router.post('/'+type,(req,res)=>{
  let data=load(type);
  data.push({...req.body,id:Date.now()});
  save(type,data);
  res.json({success:true});
 });
});

module.exports=router;
