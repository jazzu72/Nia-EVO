const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Applications endpoint ready' });
});

module.exports = router;
