from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import HealthPassport
from app.services.passport_service import PassportService
from typing import Dict, Any
import uuid
import json

router = APIRouter(prefix="/api/passport", tags=["passport"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create")
async def create_passport(data: Dict[Any, Any], db: Session = Depends(get_db)):
    passport_id = str(uuid.uuid4())
    encrypted = PassportService.encrypt_data(data)
    public_data = PassportService.create_public_view(data)
    
    passport = HealthPassport(
        id=passport_id,
        encrypted_data=encrypted,
        public_view_data=json.dumps(public_data),
        qr_url=f"/api/passport/{passport_id}/qr"
    )
    db.add(passport)
    db.commit()
    db.refresh(passport)
    
    return {
        "passport_id": passport_id,
        "qr_url": passport.qr_url,
        "public_url": f"http://localhost:5173/passport/{passport_id}"
    }

@router.get("/{id}")
async def get_passport_public(id: str, db: Session = Depends(get_db)):
    passport = db.query(HealthPassport).filter(HealthPassport.id == id).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    return json.loads(passport.public_view_data)

@router.get("/{id}/qr")
async def get_passport_qr(id: str, db: Session = Depends(get_db)):
    passport = db.query(HealthPassport).filter(HealthPassport.id == id).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    qr_base64 = PassportService.generate_qr_base64(id)
    # For a real API, we might return the image binary, but base64 is easier for FE demo
    return {"qr_base64": qr_base64}

@router.get("/{id}/pdf")
async def get_passport_pdf(id: str, db: Session = Depends(get_db)):
    passport = db.query(HealthPassport).filter(HealthPassport.id == id).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    public_data = json.loads(passport.public_view_data)
    pdf_bytes = PassportService.generate_pdf_card(id, public_data)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=helix_passport_{id}.pdf"}
    )

@router.put("/{id}")
async def update_passport(id: str, data: Dict[Any, Any], db: Session = Depends(get_db)):
    passport = db.query(HealthPassport).filter(HealthPassport.id == id).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport.encrypted_data = PassportService.encrypt_data(data)
    passport.public_view_data = json.dumps(PassportService.create_public_view(data))
    db.commit()
    return {"status": "updated"}
