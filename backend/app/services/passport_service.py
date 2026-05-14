import json
import uuid
import qrcode
import io
import os
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

# In a real app, this key would be in .env
# For the hackathon, we'll generate or use a static one
SECRET_KEY = os.getenv("PASSPORT_SECRET_KEY", Fernet.generate_key().decode())
fernet = Fernet(SECRET_KEY.encode())

class PassportService:
    @staticmethod
    def encrypt_data(data: dict) -> str:
        json_data = json.dumps(data)
        return fernet.encrypt(json_data.encode()).decode()

    @staticmethod
    def decrypt_data(encrypted_str: str) -> dict:
        decrypted_data = fernet.decrypt(encrypted_str.encode()).decode()
        return json.loads(decrypted_data)

    @staticmethod
    def create_public_view(data: dict) -> dict:
        """Strip PII and only keep emergency-relevant info."""
        return {
            "initials": "".join([n[0] for n in data.get("name", "User").split()]),
            "blood_type": data.get("blood_type"),
            "allergies": data.get("allergies", []),
            "chronic_conditions": data.get("chronic_conditions", []),
            "current_medications": data.get("current_medications", []),
            "emergency_contacts": data.get("emergency_contacts", []),
            "risk_scores": data.get("risk_scores", {}),
            "organ_donor": data.get("organ_donor", False),
            "is_emergency": True
        }

    @staticmethod
    def generate_qr_base64(passport_id: str) -> str:
        import base64
        url = f"http://localhost:5173/passport/{passport_id}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    @staticmethod
    def generate_pdf_card(passport_id: str, public_data: dict) -> bytes:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=(250, 150)) # Credit card size-ish
        
        # Background
        c.setFillColor(colors.HexColor("#0A0F1E"))
        c.rect(0, 0, 250, 150, fill=1)
        
        # Header
        c.setFillColor(colors.HexColor("#00D4FF"))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(10, 130, "HELIX EMERGENCY PASSPORT")
        
        # Initials & Blood Type
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(10, 100, f"{public_data['initials']} | {public_data['blood_type']}")
        
        # Allergies (Warning)
        if public_data['allergies']:
            c.setFillColor(colors.red)
            c.setFont("Helvetica-Bold", 8)
            c.drawString(10, 85, f"ALLERGIES: {', '.join(public_data['allergies'][:3])}")
        
        # QR Code Placeholder (In a real app, we'd embed the actual QR)
        c.setFillColor(colors.white)
        c.rect(170, 70, 60, 60, fill=1)
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 6)
        c.drawCentredString(200, 75, "SCAN FOR FULL INFO")
        
        # Emergency Contacts
        c.setFillColor(colors.white)
        c.setFont("Helvetica", 7)
        if public_data['emergency_contacts']:
            contact = public_data['emergency_contacts'][0]
            c.drawString(10, 60, f"ICE: {contact['name']} ({contact['phone']})")
        
        c.setFont("Helvetica-Oblique", 6)
        c.drawString(10, 10, "scanned by responder? Call 112.")
        
        c.showPage()
        c.save()
        return buffer.getvalue()
