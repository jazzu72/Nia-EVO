from fastapi import FastAPI
from app.quantum_engine import get_quantum_foresight
from app.scanner import scan_for_grants

app = FastAPI()

@app.get("/status")
async def status():
    return {"status": "Quantum Branching Active", "engine": "Nia-EVO v1.2"}

@app.get("/quantum-strike")
async def quantum_strike(signal: float = 0.5):
    score, action = get_quantum_foresight(signal)
    return {
        "signal_input": signal,
        "quantum_score": round(score, 4),
        "branch_taken": action,
        "house": "The House of Jazzu"
    }

@app.get("/strikes")
async def get_strikes():
    live_results = await scan_for_grants()
    verified = [{"agency": "Peninsula Fund", "amount": 25000, "status": "Pending"}]
    return {"top_strikes": verified + live_results}
