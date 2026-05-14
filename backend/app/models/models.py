from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class OutbreakRecord(Base):
    __tablename__ = "outbreak_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, index=True)
    region = Column(String, index=True)
    hashed_region = Column(String)
    disease = Column(String, index=True)
    cases = Column(Integer)
    deaths = Column(Integer)
    recovered = Column(Integer)
    population = Column(Integer)
    week_of_year = Column(Integer)
    month = Column(Integer)
    is_monsoon_season = Column(Integer)
    rolling_7day_avg = Column(Float)
    rolling_30day_avg = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)

class EnvironmentalData(Base):
    __tablename__ = "environmental_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, index=True)
    region = Column(String, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    air_quality_index = Column(Integer)

class AlertLog(Base):
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    region = Column(String, index=True)
    disease = Column(String)
    severity = Column(String) # low, medium, high, critical
    message = Column(String)
    is_active = Column(Boolean, default=True)

class UserSymptomReport(Base):
    __tablename__ = "user_symptom_reports"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id_hash = Column(String, index=True)
    region = Column(String)
    symptoms = Column(String) # JSON string of symptoms
    severity = Column(Integer, default=1)
    age_group = Column(String) # children, adult, senior
    reported_disease = Column(String, nullable=True)
    risk_score = Column(Float, nullable=True)

class WearableReading(Base):
    __tablename__ = "wearable_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    heart_rate = Column(Integer)
    spo2 = Column(Float)
    steps = Column(Integer)
    sleep_hours = Column(Float)

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String, index=True) # General Physician, Epidemiologist, Cardiologist, Neurologist, Pulmonologist
    city = Column(String, index=True)
    available_slots = Column(String) # JSON string
    rating = Column(Float, default=4.5)
    consultation_fee = Column(Integer)
    languages = Column(String) # comma separated
    profile_image_url = Column(String)

class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    date = Column(String, index=True) # YYYY-MM-DD
    time_slot = Column(String) # e.g., "10:00 AM"
    is_booked = Column(Boolean, default=False)

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String, unique=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    date = Column(String)
    time_slot = Column(String)
    patient_name = Column(String)
    symptoms = Column(String)
    risk_score = Column(Float)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled
    join_url = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor")

class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_session_id = Column(String, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    mood_score = Column(Integer) # 1-10
    stress_score = Column(Integer) # 0-12
    notes = Column(String, nullable=True)

class HealthPassport(Base):
    __tablename__ = "health_passports"

    id = Column(String, primary_key=True, index=True) # UUID as string
    created_at = Column(DateTime, default=datetime.utcnow)
    encrypted_data = Column(String) # Fernet encrypted full data
    public_view_data = Column(String) # JSON string of emergency essentials
    qr_url = Column(String, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
