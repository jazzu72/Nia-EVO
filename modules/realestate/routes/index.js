const express = require('express');
const router = express.Router();

const analyzeDeal = require('../services/deal-analyzer');
const calculateOffer = require('../services/offer-engine');
const leads = require('./leads');
const deals = require('./deals');
const messages = require('./messages');
const tasks = require('./tasks');
const followups = require('./followups');
const offers = require('./offers');
const acquisition = require('./acquisition');
const commandCenter = require('./command-center');
const finance = require('./finance');
const pipeline = require('./pipeline');
const status = require('./status');
const scoring = require('./scoring');
const reports = require('./reports');
const network = require('./network');
const dashboard = require('./dashboard');
const properties = require('./properties');

router.use('/leads', leads);
router.use('/deals', deals);
router.use('/messages', messages);
router.use('/tasks', tasks);
router.use('/followups', followups);
router.use('/offers', offers);
router.use('/acquisition', acquisition);
router.use('/command-center', commandCenter);
router.use('/finance', finance);
router.use('/pipeline', pipeline);
router.use('/status', status);
router.use('/scoring', scoring);
router.use('/reports', reports);
router.use('/network', network);
router.use('/dashboard', dashboard);
router.use('/properties', properties);


router.get('/dashboard',(req,res)=>{
    res.json({
        system:"Nia Real Estate Engine",
        status:"online",
        leads:0,
        offers:0,
        closed:0
    });
});


router.post('/analyze',(req,res)=>{
    const result = analyzeDeal(req.body);
    res.json(result);
});


router.post('/offer',(req,res)=>{
    const result = calculateOffer(req.body);
    res.json(result);
});


module.exports = router;
