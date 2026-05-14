from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.models import OutbreakRecord
from ..schemas.data import OutbreakRecord as OutbreakRecordSchema, DataStatus

router = APIRouter(
    prefix="/api/data",
    tags=["data"]
)

@router.get("/outbreaks", response_model=List[OutbreakRecordSchema])
def get_outbreaks(
    disease: Optional[str] = None,
    region: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(OutbreakRecord)
    
    if disease:
        query = query.filter(OutbreakRecord.disease == disease)
    if region:
        query = query.filter(OutbreakRecord.region == region)
    if start_date:
        query = query.filter(OutbreakRecord.date >= start_date)
    if end_date:
        query = query.filter(OutbreakRecord.date <= end_date)
        
    return query.all()

@router.get("/diseases", response_model=List[str])
def get_diseases(db: Session = Depends(get_db)):
    diseases = db.query(OutbreakRecord.disease).distinct().all()
    return [d[0] for d in diseases]

@router.get("/regions", response_model=List[str])
def get_regions(db: Session = Depends(get_db)):
    regions = db.query(OutbreakRecord.region).distinct().all()
    return [r[0] for r in regions]

@router.get("/status", response_model=DataStatus)
def get_data_status(db: Session = Depends(get_db)):
    count = db.query(OutbreakRecord).count()
    last_record = db.query(OutbreakRecord).order_by(OutbreakRecord.last_updated.desc()).first()
    
    return {
        "record_count": count,
        "last_updated": last_record.last_updated if last_record else datetime.utcnow()
    }
