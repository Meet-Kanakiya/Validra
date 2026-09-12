# Validra Backend Environment Setup Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Validra Backend - Setup Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Create .venv if it does not exist
if (-not (Test-Path ".venv")) {
    Write-Host "[+] Creating Python virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create virtual environment. Ensure Python is installed and in PATH."
        exit $LASTEXITCODE
    }
} else {
    Write-Host "[=] Virtual environment (.venv) already exists." -ForegroundColor Green
}

# 2. Copy .env.example to .env if .env does not exist
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "[+] Copying .env.example -> .env..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "[!] Please review and update DATABASE_URL credentials in .env if needed." -ForegroundColor Yellow
    }
} else {
    Write-Host "[=] Environment file (.env) already exists." -ForegroundColor Green
}

# 3. Ensure uploads directory exists
if (-not (Test-Path "uploads")) {
    Write-Host "[+] Creating uploads directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "uploads" | Out-Null
}

# 4. Install dependencies using venv python
Write-Host "[+] Upgrading pip and installing dependencies from requirements.txt..." -ForegroundColor Yellow
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\pip.exe install -r requirements.txt

# 5. Initialize database tables if DB is accessible
Write-Host "[+] Checking database initialization..." -ForegroundColor Yellow
try {
    & .\.venv\Scripts\python.exe -c "import asyncio; from app.db.session import init_db; asyncio.run(init_db())" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Database tables checked/initialized." -ForegroundColor Green
    } else {
        Write-Host "[!] Notice: Database connection check skipped. Ensure PostgreSQL is active before starting the server." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[!] Notice: Could not connect to PostgreSQL. Verify credentials in .env." -ForegroundColor Yellow
}

Write-Host "`n[✓] Backend setup completed successfully!" -ForegroundColor Green
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "  .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -ForegroundColor White
