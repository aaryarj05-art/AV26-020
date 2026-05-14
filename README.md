# 🧬 Helix

**Predictive Biomedical & Public Health Intelligence Platform**

Helix is a full-stack AI-powered platform for real-time disease surveillance, outbreak prediction, personal health risk scoring, and public health decision support.

---

## 🏗️ Architecture

| Layer      | Technology                  | Port   |
| ---------- | --------------------------- | ------ |
| Frontend   | React + Vite + Tailwind CSS | :5173  |
| Backend    | FastAPI + SQLAlchemy         | :8000  |
| ML Service | FastAPI + scikit-learn / TF  | :8001  |
| Database   | SQLite (hackathon)          | —      |

## 📁 Project Structure

```
helix/
├── backend/           # FastAPI core API
│   ├── main.py
│   └── app/
│       ├── api/       # Route handlers
│       ├── models/    # SQLAlchemy models
│       └── services/  # Business logic
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       └── components/
├── ml/                # ML prediction service
│   ├── main.py
│   ├── models/        # Trained model artifacts
│   ├── data/          # Datasets
│   └── services/      # ML pipelines
├── start.sh           # Launch all services
├── CONTEXT.md         # Living project context
└── README.md          # ← You are here
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

### Run All Services

```bash
# 1. Install backend deps
cd backend && pip install -r requirements.txt && cd ..

# 2. Install ML deps
cd ml && pip install -r requirements.txt && cd ..

# 3. Install frontend deps
cd frontend && npm install && cd ..

# 4. Launch everything
bash start.sh
```

Or run individually:

```bash
# Backend
cd backend && uvicorn main:app --reload --port 8000

# ML Service
cd ml && uvicorn main:app --reload --port 8001

# Frontend
cd frontend && npm run dev
```

## 🧪 Health Checks

```bash
curl http://localhost:8000/health   # Backend
curl http://localhost:8001/health   # ML Service
```

## 👥 Team

- **Team AV26-020**

## 📄 License

Hackathon project — all rights reserved.
