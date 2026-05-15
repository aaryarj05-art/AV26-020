# 🧬 CONTEXT.md — Helix (REFACTORED)

> **PLATFORM STATUS: REFACTORED | FOCUS: OUTBREAK INTELLIGENCE**
> This platform has been strictly pruned and redesigned to focus exclusively on predictive disease surveillance and public health response.

---

## Project Summary
- **Name**: Helix
- **Tagline**: Predictive Biomedical & Public Health Intelligence Platform
- **Problem Statement**: "Design a predictive analytics platform using AI/ML techniques that analyzes historical health data, environmental factors, and real-time inputs to forecast potential disease outbreaks, enabling early warning and proactive public health response."

---

## Core Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Recharts + Leaflet + Lucide
- **Backend Core**: FastAPI + SQLAlchemy + SQLite
- **ML Intelligence**: FastAPI + scikit-learn + TensorFlow + Prophet + ARIMA

---

## Refactored Architecture
The platform has been streamlined into 7 core modules, removing all personal health, wearable, and secondary services to ensure 100% alignment with the outbreak surveillance mission.

### Available Pages (The Core 7)
1. **Dashboard**: Central KPIs (Active Cases, Risk Regions, Model Accuracy) and Data Fusion status.
2. **Outbreak Map**: Interactive geospatial risk heatmap with forecast mode and regional drill-down.
3. **Predictions**: 30-day pathogen trajectory forecasting with confidence intervals and feature importance.
4. **Alerts**: Severity-ranked early warning system with recommended public health actions.
5. **Symptom Reports**: Crowdsourced symptom reporting for real-time cluster detection and trend analysis.
6. **Simulation**: SEIR compartmental modeling for testing non-pharmaceutical interventions (Lockdowns, Masking).
7. **Reports**: Authority-grade PDF briefing generator for health officials and resource planning summaries.

---

## Design System
- **Background**: `#0C1220` (Deep Dark)
- **Accent**: `#3B82F6` (Electric Blue)
- **Cards**: `#111827` (Rich Surface)
- **Borders**: `#1E2D40` (Slate Border)
- **Typography**: Inter (Geometric Sans)
- **Aesthetic**: Minimalist, card-based, high-fidelity dark mode.

---

## Launch Command
```powershell
# 1. Start backend and ML services (from root)
./start.sh
```

---
## Phase 24: WHO Integration & Symptom Clustering (2026-05-15)

### New Services
- **`backend/app/services/who_service.py`**: Fetches and normalises WHO Disease Outbreak News.
  - Extracts disease, region, timestamp, severity (keyword-based), and summary (≤300 chars).
  - **15-minute in-memory cache** (`_cache` dict). Falls back to 5 hardcoded mock entries on any network error.
  - `get_cached()` is the primary public entry point for API routes.
- **`ml/services/cluster_symptoms.py`**: `SymptomClusteringService`
  - `build_feature_matrix()` — binary feature vectors (one column per known symptom).
  - `run_kmeans()` — sklearn KMeans (up to 5 clusters).
  - `detect_spikes()` — Z-score per region/date (spike threshold: Z > 2.0).
  - `get_cluster_summary()` — combines user reports + WHO keywords; returns cluster list with `who_corroboration` flag.

### New API Endpoints
| Endpoint | Service | Description |
|---|---|---|
| `GET /api/who/live-outbreaks` | Backend | Returns cached WHO feed + metadata |
| `GET /api/who/cluster-summary` | Backend → ML | Proxies to ML cluster engine |
| `GET /api/cluster/summary` | ML (port 8001) | KMeans cluster + spike detection |

### Data Architecture Notes
- WHO feed is **supplementary** — existing symptom reporting (`/api/symptoms/report`, `/api/symptoms/summary`) is **unchanged**.
- SQLite is used for symptom reports (via `UserSymptomReport` model).
- WHO cache lives in-process; a restart clears it (first request repopulates within 10s).

### Frontend
- **`SymptomReports.tsx`** restructured: 40/60 split top, full-width trend chart bottom.
  - Left: original submit form (unchanged).
  - Right: WHO Live Feed card (polled every 15 min) + AI Cluster Detection card (polled every 5 min).
  - Bottom: `ComposedChart` — User Reports line (blue) + WHO Reports dashed line (yellow) + Spike bars (red, 30% opacity).

---

*Last updated: Phase 24 — WHO Integration — 2026-05-15*
