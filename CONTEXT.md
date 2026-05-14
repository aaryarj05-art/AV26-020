# 🧬 CONTEXT.md — Helix

> **Living document.** This file is the single source of truth for the Helix project context.  
> Every phase must read this first and update it last.

---

## Project

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| **Name**       | Helix                                                        |
| **Tagline**    | Predictive Biomedical & Public Health Intelligence Platform   |
| **Repo**       | https://github.com/aaryarj05-art/AV26-020                   |
| **Team**       | AV26-020                                                     |

---

## Tech Stack

| Layer        | Technology                         | Port   |
| ------------ | ---------------------------------- | ------ |
| Frontend     | React 19 + Vite + Tailwind CSS v4  | :5173  |
| Backend API  | FastAPI + SQLAlchemy + Pydantic    | :8000  |
| ML Service   | FastAPI + scikit-learn + TensorFlow | :8001  |
| Database     | SQLite (hackathon)                 | —      |
| Language     | TypeScript (FE), Python 3.10+ (BE) | —      |

---

## Project Structure

```
helix/
├── backend/                # FastAPI core API
│   ├── main.py             # App entrypoint, CORS, /health
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── api/            # Route handlers
│       ├── models/         # SQLAlchemy models
│       └── services/       # Business logic
├── frontend/               # React + Vite + Tailwind
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx          # Router: Landing → Layout shell
│       ├── index.css        # Tailwind + Helix design system
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   └── Layout.tsx
│       └── pages/
│           ├── Landing.tsx  # Splash + "Launch Dashboard" CTA
│           └── Dashboard.tsx
├── ml/                     # ML prediction service
│   ├── main.py             # App entrypoint, /health
│   ├── requirements.txt
│   ├── models/             # Trained model artifacts
│   ├── data/               # Datasets
│   └── services/           # ML pipelines
├── start.sh                # Launch all 3 services
├── CONTEXT.md              # ← You are here
└── README.md
```

---

## Key Decisions

| #  | Decision                                    | Rationale                                      |
| -- | ------------------------------------------- | ---------------------------------------------- |
| 1  | **No Docker** — run with `start.sh`         | Hackathon speed; minimal setup friction         |
| 2  | **Dark theme:** `#0A0F1E` bg, `#00D4FF` accent | Premium biomedical aesthetic; high contrast  |
| 3  | **Tailwind CSS v4** (Vite plugin, `@theme`) | Latest CSS-first config; no `tailwind.config`   |
| 4  | **SQLite** for database                      | Zero-config for hackathon; swap to PG later    |
| 5  | **Separate ML service** on `:8001`          | Isolate heavy ML deps from core API            |
| 6  | **Inter font** from Google Fonts            | Clean, modern, highly readable                 |
| 7  | **Parquet storage** for processed ML data     | Efficient storage/retrieval for analytics      |
| 8  | **Anonymization Layer** (hash + ±2% noise)  | Privacy-preserving biomedical intelligence     |
| 9  | **Synthetic Fallback Data** (7.8k records)   | Ensures development consistency without API    |
| 10 | **ARIMA & Prophet Ensemble**                 | Hybrid forecasting for robust outbreak trends  |
| 11 | **Backend Prediction Proxy**                 | Transparent communication between FE and ML    |
| 12 | **Weighted Ensemble** (30/30/40)             | Optimized weighting: ARIMA, Prophet, LSTM      |
| 13 | **LSTM Deep Learning Layer**                 | Captures complex temporal dependencies         |
| 14 | **Environmental Regressors**                 | Weather drivers (Rain, Humid) in Prophet       |
| 15 | **Weather Risk Multiplier**                  | 0.5-2.0 dynamic risk modifier based on climate |
| 16 | **Anonymized Symptom Reporting**             | Privacy-first crowdsourced data collection     |
| 17 | **DBSCAN Clustering**                        | Detects abnormal groups of similar symptoms    |
| 18 | **Z-Score Spike Detection**                  | Real-time alerts for symptom volume anomalies  |
| 19 | **Bio-Spatial Map** (Leaflet)                | Interactive dark-theme risk heatmap            |
| 20 | **Central Intelligence Dashboard**           | Real-time KPIs with 30s auto-sync              |
| 21 | **Autonomous Alert Engine**                  | Multi-modal trigger logic (Risk/Spikes/Cases)  |
| 22 | **Notification Bridge**                      | In-app alerts + mock email delivery system     |
| 23 | **Background Surveillance Task**             | 5-min interval scanning across all regions     |
| 24 | **Chronic Risk Classifiers**                 | Diabetes (LR), Heart (RF), Stroke (GBM) models |
| 25 | **Clinical Triage Engine**                   | Rule-based urgency scoring (Critical-SelfCare) |
| 26 | **Health Twin Simulator**                    | Longitudinal what-if modeling & projections    |
| 27 | **Stroke Guard Neural Engine**               | Multimodal risk synthesis (Bio+CV+NLP)         |
| 28 | **Wearable Telemetry Pipeline**              | Real-time ingest for HeartRate/SpO2/Steps      |
| 29 | **Full Core Integration Suite**              | Comprehensive test_integration.py validation   |

---

## Design Tokens

```
Background:      #0A0F1E
Surface:         #111827
Surface Light:   #1F2937
Accent:          #00D4FF
Accent Dim:      #00A3CC
Text:            #FFFFFF
Text Muted:      #9CA3AF
Border:          #1F2937
Danger:          #EF4444
Warning:         #F59E0B
Success:         #10B981
Font:            Inter (300–900)
```

---

## Phases

| Phase | Description                                  | Status      |
| ----- | -------------------------------------------- | ----------- |
| 1     | Monorepo scaffold + dark UI shell            | ✅ Complete |
| 2     | Historical Data Pipeline + Privacy Layer     | ✅ Complete |
| 3     | ARIMA & Prophet Forecasting Models           | ✅ Complete |
| 4     | LSTM Model & Deep Learning Pipeline          | ✅ Complete |
| 5     | Environmental Correlation Engine             | ✅ Complete |
| 6     | Symptom Input + Clustering Engine            | ✅ Complete |
| 7     | Geo-Spatial Heatmaps + Dashboard             | ✅ Complete |
| 8     | Early Warning Alert System                   | ✅ Complete |
| 9     | Personal Risk Prediction + AI Symptom Checker| ✅ Complete |
| 10    | Digital Health Twin + Wearable Integration   | ✅ Complete |
| 11    | XAI Model Explainability (SHAP/LIME)         | 🔜 Next     |
| 12–30 | See implementation plan                      | ⏳ Pending  |

---

## How to Run

```bash
# Install all dependencies
cd backend && pip install -r requirements.txt && cd ..
cd ml && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# Start everything
bash start.sh

# Or individually:
cd backend  && uvicorn main:app --reload --port 8000
cd ml       && uvicorn main:app --reload --port 8001
cd frontend && npm run dev
```

---

## Data Pipeline Summary
- **Datasets**: WHO Global Health Observatory (Indicators), Synthetic Outbreak Data (7,800 records).
- **Schema**: SQLite DB with `outbreak_records`, `environmental_data`, `alert_logs`, `user_symptom_reports`.
- **Pipeline**: Raw CSV → Normalization → Anonymization (Hashing/Noise) → Feature Engineering (Rolling Avgs) → Parquet.

## ML Architecture (Phase 3)
- **ARIMA**: Auto-selected (p,d,q) using `pmdarima`, seasonal m=52 (weekly).
- **Prophet**: Additive model with Indian holiday integration and uncertainty intervals.
- **Ensemble**: Weighted average (ARIMA: 30%, Prophet: 30%, LSTM: 40%) with combined risk scoring.

## Deep Learning Pipeline (Phase 4)
- **LSTM Architecture**: 2-layer stacked LSTM (64, 32 units) with 20% Dropout.
- **Sequence Length**: 12 weeks of historical context per prediction.
- **Features**: `cases`, `rolling_avg`, `week_of_year`, `is_monsoon_season`.
- **Training**: `train_all.py` orchestrator for automated cross-validation and model persistence.

## Environmental Correlation Engine (Phase 5)
- **Integration**: OpenWeatherMap API (Current) + Synthetic Seasonal Fallback (Historical).
- **Correlations**: Pearson/Spearman analysis with 0-4 week lags for early warning.
- **Rules Engine**: Disease-specific weather risk logic (e.g., Dengue ~ Rainfall/Humidity).
- **Prophet Regressors**: Added `rainfall` and `humidity` as external indicators.

## Symptom Intelligence (Phase 6)
- **Input System**: Multi-step symptom checker with region-specific risk assessment.
- **Anonymization**: Zero-PII storage (only region, timestamp, symptoms, severity, age group).
- **Clustering**: DBSCAN engine to identify spatial clusters of similar symptom profiles.
- **Anomalies**: Z-score spike detection (>2.0σ) for early outbreak warnings.
- **Classification**: Rule-based engine mapping symptoms (Fever, Rash, etc.) to likely diseases.

## Geo-Spatial Intelligence (Phase 7)
- **Interactive Mapping**: Leaflet-based Outbreak Map with CartoDB Dark Matter tiles.
- **Risk Visualization**: Pulsing CircleMarkers with radius scaled to case volume and colors mapped to risk scores.
- **Real-Time Dash**: High-fidelity dashboard with auto-refreshing KPIs (Active Cases, High-Risk Zones, Accuracy).
- **Matrix Views**: Regional risk matrix allowing comparison of multiple diseases across cities.

## Early Warning Alert System (Phase 8)
- **Engine Logic**: 4-tier severity levels (Critical, High, Medium, Low) based on hybrid triggers.
- **Triggers**: Triggered by Risk Score (>85%), Case Counts (>500), or Symptom Spikes (Z-Score > 3).
- **Background Monitor**: Async scanner running every 5 minutes across 50 region-pathogen pairs.
- **Notifications**: Integrated notification bell with pulsing unread indicators and mock email logging.
- **Workflow**: Structured recommended actions (e.g., "Activate Emergency Protocol") for each severity.

## Digital Twin & Wearable Core (Phase 10) - SET 1 COMPLETE
- **Digital Health Twin**: Personalized longitudinal simulation model with a 5-year projection window.
- **What-If Simulator**: Interactive interface for modeling the impact of weight loss, exercise, and smoking cessation.
- **Stroke Guard™**: Neural engine synthesizing multi-source data for acute neurological event prevention.
- **Wearable Ingest**: Real-time telemetry pipeline for live vitals monitoring (HR, SpO2, Steps) with sparkline visualizations.
- **Verification**: `test_integration.py` validates all core API surfaces across Backend and ML services.

*Last updated: Phase 10 — 2026-05-14*
