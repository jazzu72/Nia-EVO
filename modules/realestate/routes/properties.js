const express = require('express');
const router = express.Router();
const fs = require('fs');

const DB = './modules/realestate/data/properties.json';

router.get('/', (req,res)=>{
  res.json(JSON.parse(fs.readFileSync(DB)));
});

router.post('/', (req,res)=>{
  let properties = JSON.parse(fs.readFileSync(DB));

  const property = {
    id: Date.now(),
    address: req.body.address,
    owner: req.body.owner,
    purchasePrice: Number(req.body.purchasePrice || 0),
    repairs: Number(req.body.repairs || 0),
    arv: Number(req.body.arv || 0),
    status: "new",
    created: new Date().toISOString()
  };

  properties.push(property);

  fs.writeFileSync(DB, JSON.stringify(properties,null,2));

  res.json({success:true,property});
});

module.exports = router;
