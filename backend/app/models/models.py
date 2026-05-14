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
