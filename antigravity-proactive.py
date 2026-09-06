import requests
import time
import json
from antigravity import Agent

NIA_API = "http://localhost:3000/api"

class ProactiveNiaAgent(Agent):
    def __init__(self):
        super().__init__()
        self.add_skill("scan_leads", self.scan_leads)
        self.add_skill("score_lead", self.score_lead)
        self.add_skill("send_sms", self.send_sms)

    def scan_leads(self):
        response = requests.get(f"{NIA_API}/leads")
        return response.json()

    def score_lead(self, lead):
        score = 0
        if lead.get("status") == "new":
            score += 10
        if lead.get("phone"):
            score += 20
        if lead.get("notes") and "interested" in lead["notes"].lower():
            score += 30
        return score

    def send_sms(self, to, message):
        response = requests.post(
            f"{NIA_API}/sms/send",
            json={"to": to, "message": message}
        )
        return response.json()

# ─── Proactive loop ───────────────────────────────────────────
agent = ProactiveNiaAgent()

while True:
    leads = agent.scan_leads()
    for lead in leads:
        score = agent.score_lead(lead)
        if score >= 30:
            agent.send_sms(
                lead["phone"],
                "Hi! I have a cash buyer for your property. Interested?"
            )
            print(f"📱 Sent SMS to {lead['phone']} (score: {score})")
    time.sleep(3600)  # Run every hour
