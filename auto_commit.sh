#!/bin/bash
# ─────────────────────────────────────────────
#  autocommit.sh — Hackathon 30-min auto-commit
#  Usage: bash autocommit.sh
#  Stop:  Ctrl+C  (or kill the background PID)
# ─────────────────────────────────────────────

INTERVAL=1800  # 30 minutes in seconds
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
COUNTER=1

echo "🚀 Auto-commit started on branch: $BRANCH"
echo "   Committing every 30 minutes. Press Ctrl+C to stop."
echo "   PID: $$"
echo ""

commit_and_push() {
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  LABEL="checkpoint-$COUNTER"

  # Only commit if there are actual changes
  if git diff --quiet && git diff --cached --quiet; then
    echo "[$TIMESTAMP] ⏭  No changes — skipping commit #$COUNTER"
    return
  fi

  git add .
  git commit -m "⚡ $LABEL ($TIMESTAMP)"

  if git push origin "$BRANCH" 2>/dev/null; then
    echo "[$TIMESTAMP] ✅ Pushed: $LABEL"
  else
    echo "[$TIMESTAMP] ⚠️  Committed locally but push failed — will retry next cycle"
  fi

  COUNTER=$((COUNTER + 1))
}

# Trap Ctrl+C to do a final commit on exit
trap 'echo ""; echo "🛑 Stopping — doing final commit..."; commit_and_push; echo "Done."; exit 0' INT TERM

# Main loop
while true; do
  sleep "$INTERVAL"
  commit_and_push
done