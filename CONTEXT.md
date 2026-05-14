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

*Last updated: Post-Refactor Completion — 2026-05-15*
