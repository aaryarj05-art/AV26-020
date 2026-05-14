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
| 2     | Historical Data Pipeline + Privacy Layer     | 🔜 Next     |
| 3–30  | See implementation plan                      | ⏳ Pending  |

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

*Last updated: Phase 1 — 2026-05-14*
