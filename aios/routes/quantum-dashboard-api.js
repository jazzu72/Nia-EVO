const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const missionsDir = path.join(__dirname, '../../lib/features/quantum/data/missions');

const state = {
  playerId: 'dashboard',
  currentNodeId: 'start-001',
  sparkCoins: 20,
  xp: 0,
  completedMissions: [],
  history: []
};

function loadNode(nodeId) {
  const file = path.join(missionsDir, `${nodeId}.json`);
  if (!fs.existsSync(file)) throw new Error(`Quantum node not found: ${nodeId}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function snapshot() {
  const missions = [{
    mission: {
      missionId: 'mission-bike-savings',
      startNodeId: 'start-001',
      title: 'start-001',
      learningObjective: 'SAVING'
    },
    status: state.completedMissions.includes('mission-bike-savings')
      ? 'completed'
      : state.currentNodeId === 'start-001' ? 'available' : 'inProgress'
  }];
  const mission = missions[0];
  return {
    ...state,
    missions,
    currentMission: mission,
    history: state.history
  };
}

router.get('/snapshot', (_req, res) => {
  try { res.json(snapshot()); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

router.post('/choose', (req, res) => {
  try {
    const choiceId = req.body?.choiceId;
    if (!choiceId) return res.status(400).json({ ok: false, error: 'choiceId is required' });

    const node = loadNode(state.currentNodeId);
    const choice = (node.choices || []).find(c => c.id === choiceId);
    if (!choice) return res.status(400).json({ ok: false, error: `Choice not found: ${choiceId}` });

    const outcomeId = choice.outcomeId || choice.outcome;
    const outcome = (node.outcomes || []).find(o => o.id === outcomeId);
    if (!outcome) return res.status(400).json({ ok: false, error: `Outcome not found: ${outcomeId}` });

    const delta = Number(outcome.sparkCoinDelta || 0);
    state.sparkCoins += delta;
    state.xp += Number(outcome.xpDelta || 0);

    const nextNodeId = outcome.nextNodeId || 'mission-complete';
    state.history.push({
      nodeId: state.currentNodeId,
      choiceId,
      outcomeId,
      sparkCoinDelta: delta,
      nextNodeId
    });

    state.currentNodeId = nextNodeId;

    if (nextNodeId === 'mission-complete') {
      state.xp += 50;
      if (!state.completedMissions.includes('mission-bike-savings')) {
        state.completedMissions.push('mission-bike-savings');
      }
    }

    res.json({ ok: true, result: state.history.at(-1), snapshot: snapshot() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.post('/reset', (_req, res) => {
  state.currentNodeId = 'start-001';
  state.sparkCoins = 20;
  state.xp = 0;
  state.completedMissions = [];
  state.history = [];
  res.json({ ok: true, snapshot: snapshot() });
});

module.exports = router;
