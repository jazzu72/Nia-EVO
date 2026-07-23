const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Resume endpoint ready' });
});

module.exports = router;
