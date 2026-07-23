const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, title: 'Senior Engineer', company: 'TechCorp' }]);
});

module.exports = router;
