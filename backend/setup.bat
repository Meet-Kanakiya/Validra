@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  Validra Backend - Setup Environment
echo ========================================

:: 1. Create virtual environment (.venv) if missing
IF NOT EXIST .venv (
    echo [+] Creating Python virtual environment (.venv)...
    python -m venv .venv
    IF %ERRORLEVEL% NEQ 0 (
        echo [!] Failed to create virtual environment. Please ensure Python 3.10+ is installed and on PATH.
        exit /b %ERRORLEVEL%
    )
) ELSE (
    echo [=] Virtual environment (.venv) already exists.
)

:: 2. Ensure .env exists from .env.example
IF NOT EXIST .env (
    IF EXIST .env.example (
        echo [+] Copying .env.example -^> .env...
        copy .env.example .env
        echo [!] Please review and update DATABASE_URL credentials in .env if needed.
    )
) ELSE (
    echo [=] Environment file (.env) already exists.
)

:: 3. Ensure uploads storage directory exists
IF NOT EXIST uploads (
    echo [+] Creating uploads directory...
    mkdir uploads
)

:: 4. Install dependencies
echo [+] Upgrading pip and installing dependencies from requirements.txt...
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\pip.exe install -r requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Dependency installation failed.
    exit /b %ERRORLEVEL%
)

:: 5. Initialize database tables
echo [+] Initializing database tables...
.\.venv\Scripts\python.exe -c "import asyncio; from app.db.session import init_db; asyncio.run(init_db())" 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo [✓] Database tables checked/initialized.
) ELSE (
    echo [!] Notice: Could not connect to PostgreSQL to initialize tables. Ensure PostgreSQL is running with credentials from .env.
)

echo.
echo ========================================
echo [✓] Backend setup completed successfully!
echo ========================================
echo To start the development server, run:
echo   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
echo.
