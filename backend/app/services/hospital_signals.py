import random
from datetime import datetime, timedelta

class HospitalSignalService:
    @staticmethod
    def generate_bed_occupancy(region, date=None):
        """
        Synthetic hospital occupancy data:
        - Normal: 60-70% occupancy
        - Outbreak period: 85-95% occupancy
        """
        # Mock: check if "Maharashtra" has high risk to simulate outbreak
        is_outbreak = region == "Maharashtra" or random.random() > 0.8
        
        base_occ = 85 if is_outbreak else 60
        gen_occ = base_occ + random.randint(0, 10)
        icu_occ = base_occ + random.randint(5, 10)
        
        return {
            "region": region,
            "general_beds": {
                "total": 1000,
                "occupied": int(1000 * gen_occ / 100),
                "occupancy_pct": gen_occ
            },
            "icu_beds": {
                "total": 200,
                "occupied": int(200 * icu_occ / 100),
                "occupancy_pct": icu_occ
            },
            "surge_alert": gen_occ > 90 or icu_occ > 90
        }

    @staticmethod
    def generate_er_volume(region, days=30):
        """
        ER visit volume + chief complaint breakdown.
        """
        data = []
        start_date = datetime.utcnow() - timedelta(days=days)
        
        for i in range(days):
            date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            # Base volume 100-150, with a spike at the end
            spike = 0
            if i > 25: spike = random.randint(50, 100)
            
            total_visits = 120 + random.randint(-20, 20) + spike
            
            # Complaint breakdown
            fever = int(total_visits * random.uniform(0.3, 0.5))
            respiratory = int(total_visits * random.uniform(0.2, 0.3))
            injury = total_visits - fever - respiratory
            
            data.append({
                "date": date,
                "total_visits": total_visits,
                "complaints": {
                    "fever": fever,
                    "respiratory": respiratory,
                    "injury": injury
                }
            })
        return data

    @staticmethod
    def get_hospital_network(city):
        """
        List of hospitals with current capacity.
        """
        hospitals = [
            {"name": "City General Hospital", "type": "Public", "capacity": "High"},
            {"name": "St. Luke Medical Center", "type": "Private", "capacity": "Medium"},
            {"name": "Apollo Health City", "type": "Private", "capacity": "Full"},
            {"name": "Govt. Medical College", "type": "Public", "capacity": "Critical"},
            {"name": "Fortis Memorial", "type": "Private", "capacity": "Low"}
        ]
        
        for h in hospitals:
            h["occupancy"] = random.randint(50, 98)
            
        return hospitals
