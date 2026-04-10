export const branch_taken = 'main';
export const quantum_score = 0;

// Fallback for offline mode
const offlineMode = !navigator.onLine;

export const quantumData = {
  branch_taken: offlineMode ? 'offline' : branch_taken,
  quantum_score: offlineMode ? -1 : quantum_score,
};
