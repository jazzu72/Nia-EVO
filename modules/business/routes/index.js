const express = require('express');
const router = express.Router();


router.get('/dashboard',(req,res)=>{

res.json({

system:"Nia Small Business OS",

customers:0,
leads:0,
invoices:0,
revenue:0,
tasks:0

});

});


router.post('/lead',(req,res)=>{

res.json({

success:true,
message:"Lead added",
lead:req.body

});

});


module.exports = router;
