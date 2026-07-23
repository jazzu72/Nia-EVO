const express = require('express');
const router = express.Router();
const business = require('./business-engine');

router.get('/dashboard', (req, res) => {
  res.json(business.getDashboard());
});

router.get('/invoices', (req, res) => {
  res.json(business.data.invoices);
});

router.post('/invoices', (req, res) => {
  const invoice = business.addInvoice(req.body);
  res.status(201).json(invoice);
});

router.get('/appointments', (req, res) => {
  res.json(business.data.appointments);
});

router.post('/appointments', (req, res) => {
  const appt = business.addAppointment(req.body);
  res.status(201).json(appt);
});

router.get('/leads', (req, res) => {
  res.json(business.data.leads);
});

router.post('/leads', (req, res) => {
  const lead = business.addLead(req.body);
  res.status(201).json(lead);
});

module.exports = router;
