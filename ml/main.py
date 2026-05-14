"""
Helix ML Service — FastAPI Application
Machine Learning models for disease prediction, outbreak forecasting, and health analytics
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Helix ML Service",
    description="Machine Learning service for predictive biomedical analytics",
    version="0.1.0",
)

# CORS — allow all origins for hackathon development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "helix-ml"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
