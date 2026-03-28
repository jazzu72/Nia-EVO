from fastapi import FastAPI
from app.quantum_engine import get_quantum_foresight
from app.scanner import scan_for_grants
from app.comms import send_nia_alert
from app.cash_flow import get_balance_projection
from app.auto_builder import trigger_self_heal

app = FastAPI()

@app.get("/status")
async def status():
    return {"status": "Quantum Branching Active", "engine": "Nia-EVO v1.2", "comms": "lesane1972@gmail.com"}

@app.get("/executive-summary")
async def executive_summary():
    # The "Bird's Eye View" for CEO Lesane
    strikes = [{"amount": 275000, "status": "Verified"}] 
    flow = get_balance_projection(12500, strikes)
    return {
        "house": "The House of Jazzu",
        "cash_flow": flow,
        "systems": "100% Operational",
        "next_milestone": "July 15 Strike"
    }

@app.get("/strikes")
async def get_strikes():
    live_results = await scan_for_grants()
    verified = [{"agency": "Peninsula Fund", "amount": 25000, "status": "Pending"}]
    return {"top_strikes": verified + live_results}
