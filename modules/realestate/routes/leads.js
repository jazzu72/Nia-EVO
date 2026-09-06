const express = require('express');
const router = express.Router();
const fs = require('fs');

const DB = './modules/realestate/data/leads.json';


router.get('/', (req,res)=>{

const leads = JSON.parse(fs.readFileSync(DB));

res.json(leads);

});


router.post('/', (req,res)=>{

let leads = JSON.parse(fs.readFileSync(DB));

const lead = {
    id: Date.now(),
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    status:"new",
    created:new Date().toISOString()
};

leads.push(lead);

fs.writeFileSync(
DB,
JSON.stringify(leads,null,2)
);

res.json({
success:true,
lead
});

});


module.exports = router;
