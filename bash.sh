#!/bin/bash

echo "🧹 Starting SCWM cleanup..."

# Backend cleanup
echo "🔻 Removing old backend files..."

rm -rf backend/venv

rm -f backend/init_db.py
rm -f backend/createdb.py
rm -f backend/seed_bengaluru.py
rm -f backend/seed_centers_final.py
rm -f backend/append_bengaluru.py

# Optional: remove python cache if present
rm -rf backend/__pycache__

echo "✅ Cleanup completed successfully."

echo "📌 Kept files:"
echo "  - backend/main.py"
echo "  - backend/supabase-client.py"
echo "  - backend/gemini_service.py (if used)"
echo "  - backend/requirements.txt"
echo "  - backend/.env (ignored by git)"
echo "  - backend/best.pt (ignored by git)"

echo "🚀 You are ready to commit and push to GitHub!"
