"""
Indian Railways Dynamic Train ETA Forecasting System - FastAPI Application Entry Point.
Smart India Hackathon (SIH) Real-Time ML Engine.
"""

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.api.routes import router as api_router
from backend.services.simulator import simulator
from backend.services.websocket import ws_manager

background_task = None

async def simulation_loop():
    """Background simulator task pushing kinematic updates every 5 seconds"""
    while True:
        try:
            simulator.step_simulation()
            # Push updates to all connected clients
            payload = {
                "type": "SIMULATION_UPDATE",
                "trains_count": len(simulator.trains),
                "active_disruptions": len(simulator.active_disruptions),
                "trains": [
                    {
                        "train_id": t["train_id"],
                        "train_name": t["train_name"],
                        "current_lat": t.get("current_lat"),
                        "current_lon": t.get("current_lon"),
                        "current_delay_min": t.get("current_delay_min", 0),
                        "status": t.get("status", "ON_TIME"),
                        "current_station": t.get("current_station", ""),
                        "next_station": t.get("next_station", "")
                    }
                    for t in simulator.trains
                ]
            }
            await ws_manager.broadcast(payload)
        except Exception as e:
            print(f"Error in simulation loop: {e}")
        await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(simulation_loop())
    yield
    task.cancel()

app = FastAPI(
    title="RailDrishti AI - Dynamic ETA Prediction System",
    description="Smart India Hackathon Real-Time Coaching Train ETA Prediction Engine for Indian Railways",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send immediate initial state
        initial_payload = {
            "type": "INITIAL_STATE",
            "trains_count": len(simulator.trains),
            "trains": simulator.trains
        }
        await websocket.send_json(initial_payload)
        while True:
            data = await websocket.receive_text()
            # Handle client commands if any
            if data == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailDrishti AI ETA Engine",
        "trains_simulated": len(simulator.trains),
        "active_disruptions": len(simulator.active_disruptions)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
