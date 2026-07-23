const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Interview endpoint ready' });
});

module.exports = router;
