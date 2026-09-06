const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  const file = path.join(__dirname, 'data', 'revenue-pipeline.json');
  let d = { contacts: [], appointments: [], proposals: [], closedDeals: [], revenue: 0 };
  if (fs.existsSync(file)) {
    try {
      d = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      return res.status(500).json({ error: 'Corrupt pipeline file', details: e.message });
    }
  }
  res.json({
    contacts: d.contacts?.length || 0,
    appointments: d.appointments?.length || 0,
    proposals: d.proposals?.length || 0,
    closedDeals: d.closedDeals?.length || 0,
    revenue: d.revenue || 0
  });
});

module.exports = router;
