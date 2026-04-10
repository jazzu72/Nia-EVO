export const load = async ({ fetch }) => {
  try {
    const response = await fetch('https://nia-evo.onrender.com/strikes', { timeout: 5000 });
    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }
    const data = await response.json();
    return {
      strikes: data.top_strikes || [],
      quantum: {
        branch_taken: data.branch_taken || "Scanning...",
        quantum_score: data.quantum_score || 0
      },
      error: null,
    };
  } catch (error) {
    console.error('Fetch failed:', error);
    return {
      strikes: [{ agency: "Offline Mode", amount: 0, status: "Backend Unavailable" }],
      quantum: {
        branch_taken: "Offline",
        quantum_score: 0
      },
      error: error.message,
    };
  }
};