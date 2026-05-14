# 🧬 Helix

### Predictive Biomedical & Public Health Intelligence Platform

Helix is a state-of-the-art intelligence suite built for the 2026 Global Health Tech Hackathon. It fuses epidemiological modeling, personalized digital health twins, and operational resource planning into a single cinematic platform.

---

## 🚀 Quick Start (Demo Ready)

1. **Clone & Install**:
   ```bash
   # Clone the repository
   git clone https://github.com/aaryarj05-art/AV26-020.git
   cd AV26-020
   
   # Install dependencies
   cd backend && pip install -r requirements.txt && cd ..
   cd ml      && pip install -r requirements.txt && cd ..
   cd frontend && npm install && cd ..
   ```

2. **Seed the Demo**:
   ```bash
   # Populates high-fidelity data for judges
   python backend/seed_final_demo.py
   ```

3. **Launch Platform**:
   ```bash
   bash start.sh
   ```
   *Dashboard available at http://localhost:5173*

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Recharts, Leaflet.
- **Backend Core**: FastAPI, SQLAlchemy (SQLite), Pydantic.
- **ML Intelligence**: FastAPI, scikit-learn, TensorFlow, Prophet, ARIMA, SHAP.
- **Security**: Fernet Symmetric Encryption (Health Passports), Anonymization Layer.

---

## ✨ Core Features (Phase 1-30)

### 📊 Public Health Intelligence
- **Hybrid Outbreak Forecasting**: Ensemble (ARIMA + Prophet + LSTM) predicting cases across 50 regions.
- **Bio-Spatial Map**: Interactive dark-theme heatmap with 30-day historical replay.
- **SEIR Simulation**: Pathogen spread modeling with interactive intervention controls.
- **Predictive Resource Planner**: Automated bed/med/staff allocation based on forecast demand.

### 👤 Personalized Biomedical Core
- **Digital Health Twin**: Longitudinal 5-year wellness projections and what-if simulations.
- **Stroke Guard™**: Multimodal CV+NLP neural engine for acute stroke risk detection.
- **AI Symptom Checker**: Privacy-first triage mapping crowdsourced data to outbreak clusters.
- **Emergency Health Passport**: Encrypted, scannable QR medical summaries for first responders.

### 🏥 Operational & Financial Resilience
- **Teleconsultation Suite**: AI-matched specialist booking with integrated video consults.
- **Insurance Analytics**: Risk-based premium modeling and regional liability forecasting.
- **Hospital Signals**: Real-time bed occupancy telemetry and surge detection.
- **Drug Discovery Simulation**: Virtual treatment protocol modeling and population impact analysis.

### ⚙️ Self-Improving Intelligence
- **Continuous Learning Loop**: Automated drift detection (PSI) and Champion-vs-Challenger retraining.
- **Explainable AI (XAI)**: SHAP-driven narratives explaining "Why This Prediction" for all models.

---

## 👥 The Team (AV26-020)
- **Aarya R Joshi**
- **Amruth G R**
- **Gagan M**
- **Karthik Kumar Biradar**

---

*Built with ❤️ for a healthier future.*
