import json
from app.database import SessionLocal, engine, Base
from app.models.models import Doctor, DoctorAvailability
from datetime import datetime, timedelta

def seed_doctors():
    db = SessionLocal()
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # Check if doctors already exist
    if db.query(Doctor).count() > 0:
        print("Doctors already seeded.")
        db.close()
        return

    doctors_data = [
        # General Physicians
        {"name": "Dr. Sarah Ahmed", "specialization": "General Physician", "city": "Bangalore", "fee": 500, "languages": "English, Hindi, Kannada", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"},
        {"name": "Dr. Rajesh Kumar", "specialization": "General Physician", "city": "Delhi", "fee": 600, "languages": "Hindi, English", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"},
        {"name": "Dr. Priya Sharma", "specialization": "General Physician", "city": "Mumbai", "fee": 800, "languages": "English, Marathi, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"},
        {"name": "Dr. Amit Varma", "specialization": "General Physician", "city": "Chennai", "fee": 550, "languages": "English, Tamil", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit"},
        
        # Epidemiologists
        {"name": "Dr. Vikram Seth", "specialization": "Epidemiologist", "city": "Hyderabad", "fee": 1200, "languages": "English, Telugu, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram"},
        {"name": "Dr. Anjali Rao", "specialization": "Epidemiologist", "city": "Bangalore", "fee": 1500, "languages": "English, Kannada, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali"},
        {"name": "Dr. Sneha Patil", "specialization": "Epidemiologist", "city": "Pune", "fee": 1000, "languages": "English, Marathi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"},
        {"name": "Dr. Rahul Gupta", "specialization": "Epidemiologist", "city": "Kolkata", "fee": 900, "languages": "English, Bengali, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"},
        
        # Cardiologists
        {"name": "Dr. Sanjay Dutt", "specialization": "Cardiologist", "city": "Mumbai", "fee": 2000, "languages": "English, Hindi, Marathi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay"},
        {"name": "Dr. Meera Nair", "specialization": "Cardiologist", "city": "Kochi", "fee": 1800, "languages": "English, Malayalam", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera"},
        {"name": "Dr. Arjun Reddy", "specialization": "Cardiologist", "city": "Hyderabad", "fee": 2200, "languages": "English, Telugu", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"},
        {"name": "Dr. Kavita Singh", "specialization": "Cardiologist", "city": "Delhi", "fee": 2500, "languages": "English, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita"},
        
        # Neurologists
        {"name": "Dr. Aditya Birla", "specialization": "Neurologist", "city": "Bangalore", "fee": 2500, "languages": "English, Hindi, Kannada", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya"},
        {"name": "Dr. Pooja Hegde", "specialization": "Neurologist", "city": "Chennai", "fee": 2000, "languages": "English, Tamil", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja"},
        {"name": "Dr. Rohan Mehra", "specialization": "Neurologist", "city": "Ahmedabad", "fee": 1800, "languages": "English, Gujarati, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan"},
        {"name": "Dr. Swati Kapoor", "specialization": "Neurologist", "city": "Delhi", "fee": 3000, "languages": "English, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Swati"},
        
        # Pulmonologists
        {"name": "Dr. Kiran Mazumdar", "specialization": "Pulmonologist", "city": "Bangalore", "fee": 1500, "languages": "English, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiran"},
        {"name": "Dr. Farhan Akhtar", "specialization": "Pulmonologist", "city": "Mumbai", "fee": 1700, "languages": "English, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Farhan"},
        {"name": "Dr. Neha Dhupia", "specialization": "Pulmonologist", "city": "Delhi", "fee": 2000, "languages": "English, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha"},
        {"name": "Dr. Manoj Bajpayee", "specialization": "Pulmonologist", "city": "Patna", "fee": 1200, "languages": "English, Hindi", "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Manoj"},
    ]

    time_slots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]

    for d in doctors_data:
        doctor = Doctor(
            name=d["name"],
            specialization=d["specialization"],
            city=d["city"],
            consultation_fee=d["fee"],
            languages=d["languages"],
            profile_image_url=d["img"],
            rating=round(4.0 + (d["fee"] % 10) / 10, 1),
            available_slots=json.dumps(time_slots)
        )
        db.add(doctor)
        db.flush() # Get ID

        # Seed availability for next 7 days
        today = datetime.now()
        for i in range(7):
            date_str = (today + timedelta(days=i)).strftime("%Y-%m-%d")
            for slot in time_slots:
                avail = DoctorAvailability(
                    doctor_id=doctor.id,
                    date=date_str,
                    time_slot=slot,
                    is_booked=False
                )
                db.add(avail)

    db.commit()
    print("Seeded 20 doctors and their availability.")
    db.close()

if __name__ == "__main__":
    seed_doctors()
