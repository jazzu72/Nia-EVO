const express = require('express');

const router = express.Router();

router.get('/snapshot', (_req, res) => {
  res.json({
    playerId: 'dashboard',
    currentNodeId: 'start-001',
    sparkCoins: 20,
    xp: 0,
    completedMissions: [],
    missions: [{
      mission: {
        missionId: 'mission-bike-savings',
        startNodeId: 'start-001',
        title: 'start-001',
        learningObjective: 'SAVING'
      },
      status: 'available'
    }],
    currentMission: {
      mission: {
        missionId: 'mission-bike-savings',
        startNodeId: 'start-001',
        title: 'start-001',
        learningObjective: 'SAVING'
      },
      status: 'available'
    }
  });
});

module.exports = router;
