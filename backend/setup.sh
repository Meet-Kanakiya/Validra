#!/usr/bin/env bash
# Validra Backend Environment Setup Script (Bash)

set -e

echo "========================================"
echo " Validra Backend - Setup Environment"
echo "========================================"

# 1. Create .venv if it does not exist
if [ ! -d ".venv" ]; then
    echo "[+] Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
else
    echo "[=] Virtual environment (.venv) already exists."
fi

# 2. Copy .env.example to .env if .env does not exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "[+] Copying .env.example -> .env..."
        cp .env.example .env
        echo "[!] Please review and update DATABASE_URL credentials in .env if needed."
    fi
else
    echo "[=] Environment file (.env) already exists."
fi

# 3. Ensure uploads storage directory exists
if [ ! -d "uploads" ]; then
    echo "[+] Creating uploads directory..."
    mkdir -p uploads
fi

# 4. Activate .venv & Install requirements
echo "[+] Installing dependencies from requirements.txt..."
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Initialize database tables
echo "[+] Checking database initialization..."
python -c "import asyncio; from app.db.session import init_db; asyncio.run(init_db())" 2>/dev/null || echo "[!] Notice: Database connection check skipped. Ensure PostgreSQL is running."

echo ""
echo "========================================"
echo "[✓] Backend setup completed successfully!"
echo "========================================"
echo "To start the development server, run:"
echo "  source .venv/bin/activate"
echo "  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
echo ""
