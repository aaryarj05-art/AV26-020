import os
import httpx
from fastapi import APIRouter, File, UploadFile, Form, Body

router = APIRouter(
    prefix="/api/personal/stroke-guard",
    tags=["stroke-guard"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

@router.post("/facial")
async def analyze_facial(file: UploadFile = File(...)):
    async with httpx.AsyncClient() as client:
        try:
            files = {'file': (file.filename, await file.read(), file.content_type)}
            res = await client.post(f"{ML_SERVICE_URL}/api/personal/stroke-guard/facial", files=files)
            return res.json()
        except Exception as e:
            return {"error": "ML Service Unreachable", "details": str(e)}

@router.post("/speech")
async def analyze_speech(text: str = Body(..., embed=True)):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(f"{ML_SERVICE_URL}/api/personal/stroke-guard/speech", json={"text": text})
            return res.json()
        except Exception as e:
            return {"error": "ML Service Unreachable", "details": str(e)}

@router.post("/full")
async def analyze_full(
    health_data: str = Form(...),
    stroke_model_risk: float = Form(...),
    image: UploadFile = File(None),
    speech_text: str = Form(None)
):
    async with httpx.AsyncClient() as client:
        try:
            data = {
                "health_data": health_data,
                "stroke_model_risk": stroke_model_risk
            }
            if speech_text:
                data["speech_text"] = speech_text
                
            files = {}
            if image:
                files['image'] = (image.filename, await image.read(), image.content_type)
                
            # If there are files, we must use multipart/form-data
            if files:
                res = await client.post(f"{ML_SERVICE_URL}/api/personal/stroke-guard/full", data=data, files=files)
            else:
                res = await client.post(f"{ML_SERVICE_URL}/api/personal/stroke-guard/full", data=data)
                
            return res.json()
        except Exception as e:
            return {"error": "ML Service Unreachable", "details": str(e)}
