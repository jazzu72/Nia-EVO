const express = require('express');
const path = require('path');
const { spawnSync } = require('child_process');

const router = express.Router();

router.get('/snapshot', (req, res) => {
  try {
    const projectRoot = path.resolve(__dirname, '../..');
    const script = path.join(projectRoot, 'tool', 'quantum_dashboard_snapshot.dart');

    const result = spawnSync(
      'dart',
      ['run', script],
      { cwd: projectRoot, encoding: 'utf8' }
    );

    if (result.error || result.status !== 0) {
      return res.status(503).json({
        ok: false,
        error: 'Quantum dashboard snapshot unavailable',
        detail: result.stderr || result.error?.message || 'Dart process failed',
      });
    }

    res.json(JSON.parse(result.stdout));
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;
