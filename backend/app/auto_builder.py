import httpx
import os

RENDER_API_KEY = os.getenv("RENDER_API_KEY")

async def trigger_self_heal(service_id):
    """
    Nia-EVO: Auto-Builder. 
    Triggers a clean redeploy if the Ghost-Mirror detects a sync issue.
    """
    url = f"https://api.render.com/v1/services/{service_id}/deploys"
    headers = {"Authorization": f"Bearer {RENDER_API_KEY}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers)
        return response.status_code == 201
