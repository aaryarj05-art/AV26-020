import os
import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.models import OutbreakRecord
from datetime import datetime

def seed_db():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if we already have data
        if db.query(OutbreakRecord).first():
            print("Database already seeded.")
            return

        # Path to processed data
        processed_file = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'data', 'processed', 'clean_outbreak_data.parquet')
        
        if not os.path.exists(processed_file):
            print(f"Processed data not found at {processed_file}. Please run the ML pipeline first.")
            return
            
        print(f"Loading data from {processed_file}...")
        df = pd.read_parquet(processed_file)
        
        print(f"Seeding {len(df)} records into the database...")
        
        records = []
        for _, row in df.iterrows():
            record = OutbreakRecord(
                date=pd.to_datetime(row['date']),
                region=row['region'],
                hashed_region=row['hashed_region'],
                disease=row['disease'],
                cases=int(row['cases']),
                deaths=int(row['deaths']),
                recovered=int(row['recovered']),
                population=int(row['population']),
                week_of_year=int(row['week_of_year']),
                month=int(row['month']),
                is_monsoon_season=int(row['is_monsoon_season']),
                rolling_7day_avg=float(row['rolling_7day_avg']),
                rolling_30day_avg=float(row['rolling_30day_avg']),
                last_updated=datetime.utcnow()
            )
            records.append(record)
            
            # Bulk insert in chunks to avoid memory issues
            if len(records) >= 1000:
                db.bulk_save_objects(records)
                db.commit()
                records = []
                
        if records:
            db.bulk_save_objects(records)
            db.commit()
            
        print("Database successfully initialized and seeded.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
