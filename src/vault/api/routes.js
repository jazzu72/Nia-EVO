const express = require('express');
const fs = require('fs');
const path = require('path');
const QuantumVault = require('../core/vault');

const router = express.Router();
const vault = new QuantumVault();

// Health check
router.get('/health', (req, res) => {
  res.json(vault.health());
});

// Store a secret
router.post('/secrets', (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ error: 'Key and value required' });
  }
  try {
    const result = vault.storeSecret(key, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve a secret
router.get('/secrets/:key', (req, res) => {
  const value = vault.retrieveSecret(req.params.key);
  if (value === null) {
    return res.status(404).json({ error: 'Secret not found' });
  }
  res.json({ key: req.params.key, value });
});

// Get audit logs
router.get('/audit', (req, res) => {
  try {
    const logs = fs.readFileSync(vault.auditLog, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read audit logs' });
  }
});

module.exports = router;
