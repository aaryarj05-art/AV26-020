from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import Doctor, DoctorAvailability, Appointment
from app.services.matching_service import match_doctor
import uuid
import json

router = APIRouter(
    prefix="/api/teleconsult",
    tags=["teleconsult"]
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/doctors")
def get_doctors(
    city: str = None, 
    specialization: str = None,
    risk_profile: str = Query(None), # JSON string
    symptoms: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Doctor)
    
    if city:
        query = query.filter(Doctor.city == city)
    if specialization:
        query = query.filter(Doctor.specialization == specialization)
        
    doctors = query.all()
    
    # AI Matching
    recommendations = []
    if risk_profile or symptoms:
        risk_data = json.loads(risk_profile) if risk_profile else {}
        recommendations = match_doctor(risk_data, symptoms)
        
    return {
        "doctors": doctors,
        "recommendations": recommendations
    }

@router.get("/doctors/{doctor_id}/slots")
def get_slots(doctor_id: int, date: str, db: Session = Depends(get_db)):
    slots = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.date == date,
        DoctorAvailability.is_booked == False
    ).all()
    return slots

@router.post("/appointments/book")
def book_appointment(data: dict, db: Session = Depends(get_db)):
    doctor_id = data.get("doctor_id")
    date = data.get("date")
    time_slot = data.get("time_slot")
    
    # Check availability
    avail = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.date == date,
        DoctorAvailability.time_slot == time_slot,
        DoctorAvailability.is_booked == False
    ).first()
    
    if not avail:
        raise HTTPException(status_code=400, detail="Slot not available")
        
    # Mark as booked
    avail.is_booked = True
    
    booking_id = f"HLX-{uuid.uuid4().hex[:8].upper()}"
    
    appointment = Appointment(
        booking_id=booking_id,
        doctor_id=doctor_id,
        date=date,
        time_slot=time_slot,
        patient_name=data.get("patient_name", "Anonymous User"),
        symptoms=data.get("symptoms", ""),
        risk_score=data.get("risk_score", 0.0),
        join_url=f"https://meet.jit.si/helix-{booking_id}"
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return appointment

@router.get("/appointments/{booking_id}")
def get_appointment(booking_id: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.booking_id == booking_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.post("/appointments/{booking_id}/join")
def join_appointment(booking_id: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.booking_id == booking_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"join_url": appointment.join_url}

@router.get("/my-appointments")
def get_my_appointments(db: Session = Depends(get_db)):
    # In a real app, filter by user_id. Here we return all for demo.
    return db.query(Appointment).order_by(Appointment.timestamp.desc()).all()
