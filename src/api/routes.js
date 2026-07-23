/**
 * Route Configuration
 * Landing page + Dashboard + API
 */

const express = require('express');
const router = express.Router();

// Landing page (served from public/index.html)
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../../public/index.html');
});

// Dashboard
router.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/../../public/dashboard/elite.html');
});

// PWA
router.get('/manifest.json', (req, res) => {
  res.sendFile(__dirname + '/../../public/manifest.json');
});

router.get('/sw.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(__dirname + '/../../public/sw.js');
});

module.exports = router;
