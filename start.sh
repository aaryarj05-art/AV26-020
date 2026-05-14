#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Helix — Start All Services
# Backend  :8000  |  ML Service  :8001  |  Frontend  :5173
# ──────────────────────────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🧬 Starting Helix Platform..."
echo ""

# Backend
echo "  → Backend   (http://localhost:8000)"
cd "$ROOT_DIR/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# ML Service
echo "  → ML Service (http://localhost:8001)"
cd "$ROOT_DIR/ml"
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
ML_PID=$!

# Frontend
echo "  → Frontend  (http://localhost:5173)"
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🧬 Helix is running!"
echo "   Press Ctrl+C to stop all services."
echo ""

# Trap Ctrl+C and kill all child processes
trap "echo ''; echo '🛑 Shutting down Helix...'; kill $BACKEND_PID $ML_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for any to exit
wait
