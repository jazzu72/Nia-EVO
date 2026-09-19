(() => {
  const panel = document.getElementById('quantum-dashboard');
  if (!panel) return;

  async function loadQuantum() {
    try {
      const res = await fetch('/api/quantum/dashboard/snapshot', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const mission = data.currentMission?.mission;
      const status = data.currentMission?.status || 'unknown';

      panel.innerHTML = `
        <div class="quantum-head">
          <div>
            <div class="quantum-eyebrow">QUANTUM BRANCHING ENGINE</div>
            <h2>${mission?.title || 'Quantum Mission'}</h2>
            <p>${mission?.learningObjective || 'Adaptive learning mission'}</p>
          </div>
          <div class="quantum-status">${status.toUpperCase()}</div>
        </div>

        <div class="quantum-metrics">
          <div><span>SPARK COINS</span><strong>${data.sparkCoins ?? 0}</strong></div>
          <div><span>XP</span><strong>${data.xp ?? 0}</strong></div>
          <div><span>CURRENT NODE</span><strong>${data.currentNodeId || 'idle'}</strong></div>
          <div><span>MISSIONS</span><strong>${data.missions?.length ?? 0}</strong></div>
        </div>

        <div class="quantum-footer">
          <span>PLAYER: ${data.playerId || 'dashboard'}</span>
          <span>MISSION: ${mission?.missionId || 'none'}</span>
        </div>
      `;
    } catch (error) {
      panel.innerHTML = `<div class="quantum-error">Quantum telemetry unavailable: ${error.message}</div>`;
    }
  }

  loadQuantum();
  setInterval(loadQuantum, 10000);
})();
