import asyncio
import time
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import EventSourceResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/demo", tags=["demo"])

# In-memory queue to hold SSE events for the simulation
event_queue = asyncio.Queue()

# Global state for the demo
demo_state = {
    "is_active": False,
    "city": None,
    "risk_score": 40,
    "status": "baseline"
}

class TriggerRequest(BaseModel):
    city: str

async def _simulate_outbreak(city: str):
    demo_state["is_active"] = True
    demo_state["city"] = city
    demo_state["risk_score"] = 40
    demo_state["status"] = "started"
    
    def log(msg: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        # put_nowait so it doesn't block
        event_queue.put_nowait(f"[{timestamp}] {msg}")

    # Step 1: Initial detection
    log(f"🟢 Monitoring baseline for {city}. Risk: 40%")
    await asyncio.sleep(2)
    
    # Step 2: Anomaly
    log(f"🔴 50 symptom reports detected in {city} via HealthAPI.")
    await asyncio.sleep(2)
    
    # Step 3: Risk bump
    demo_state["risk_score"] = 65
    log(f"📊 ML Engine processing data... Risk score rising: 40 → 65")
    await asyncio.sleep(2)
    
    # Step 4: Medium Alert
    log(f"⚠️ MEDIUM alert generated internally.")
    await asyncio.sleep(2)
    
    # Step 5: Environmental fusion
    log(f"🌧️ Fusion Engine: Heavy rainfall correlation detected (+20% risk).")
    await asyncio.sleep(2)
    
    # Step 6: High Alert
    demo_state["risk_score"] = 85
    demo_state["status"] = "HIGH"
    log(f"📊 Risk score updated: 65 → 85")
    await asyncio.sleep(1)
    log(f"🚨 HIGH alert triggered for {city}.")
    await asyncio.sleep(2)
    
    # Step 7: Notification dispatch
    log(f"📧 Notification dispatched to {city} Health Authority.")
    await asyncio.sleep(2)
    
    # Step 8: Critical escalation warning
    log(f"🔴 CRITICAL threshold approaching... Awaiting manual review.")
    
    demo_state["status"] = "completed"
    demo_state["is_active"] = False


@router.post("/trigger-outbreak")
async def trigger_outbreak(req: TriggerRequest):
    if demo_state["is_active"]:
        return {"status": "error", "message": "Demo already running"}
    
    # Start the simulation background task
    asyncio.create_task(_simulate_outbreak(req.city))
    return {"status": "success", "message": "Simulation started"}

@router.post("/reset")
async def reset_demo():
    demo_state["is_active"] = False
    demo_state["city"] = None
    demo_state["risk_score"] = 40
    demo_state["status"] = "baseline"
    
    # Clear the queue
    while not event_queue.empty():
        event_queue.get_nowait()
        
    return {"status": "success"}

@router.get("/status")
async def get_status():
    return demo_state

@router.get("/stream")
async def sse_stream(request: Request):
    """
    SSE stream endpoint. Keeps connection open and yields events.
    """
    async def event_generator():
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break
                
            try:
                # Wait for an event with a timeout so we can check disconnects
                message = await asyncio.wait_for(event_queue.get(), timeout=1.0)
                yield {
                    "event": "log",
                    "data": message
                }
            except asyncio.TimeoutError:
                # Send a ping to keep connection alive
                yield {
                    "event": "ping",
                    "data": "keep-alive"
                }

    return EventSourceResponse(event_generator())
