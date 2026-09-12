---
title: "Backend Setup Guide"
description: "Step-by-step instructions for setting up, configuring, and running the Validra FastAPI backend."
---

# ⚙️ Validra — Backend Setup Guide

<p align="center">
  <a href="../../README.md">
    <img src="../../Assets/Repo/logo_repo.png" alt="Validra Logo" width="140" />
  </a>
</p>

> **Team VisionMinds — Think. Build. Transform.**  
> **Domain M2:** Backend & Infrastructure

---

## 📋 System Requirements

| Tool | Required Version | Purpose |
| :--- | :--- | :--- |
| **Python** | 3.10+ (3.12 recommended) | FastAPI Backend & AI Runtime |
| **pip** | Latest | Python Package Manager |
| **PostgreSQL** | 15+ | Database |
| **Git** | 2.40+ | Version Control |

> [!IMPORTANT]
> Complete the [Base Setup Guide](./base_setup.mdx) first if you haven't installed these tools.

---

## 📦 Current Stack

| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | ≥0.100.0 | Async REST API framework |
| Uvicorn | ≥0.22.0 | ASGI server with hot reload |
| Pydantic | ≥2.0.0 | Request/response schemas |
| pydantic-settings | ≥2.0.0 | Environment-based config |
| python-dotenv | ≥1.0.0 | .env file loading |
| pytest | ≥7.4.0 | Unit testing |
| httpx | ≥0.24.0 | Async HTTP client (for tests) |
| SQLAlchemy[asyncio] | ≥2.0.0 | Async ORM for PostgreSQL |
| asyncpg | ≥0.29.0 | High-performance async PostgreSQL driver |
| pillow | ≥10.0.0 | Image processing, EXIF transposition & evidence crops |
| paddlepaddle | ≥3.0.0 | Deep learning inference runtime for OCR |
| paddleocr | ≥2.8.0 | Text detection, recognition, and layout analysis (PP-OCRv4) |
| opencv-python-headless | ≥4.8.0 | Quality assessment, CLAHE contrast & spatial geometry |

> [!TIP]
> For platform-specific issues (e.g., Windows Smart App Control, oneDNN PIR configuration, or headless Linux container setup), refer to the dedicated **[PaddleOCR Setup & Troubleshooting Guide](./paddleocr_troubleshooting.mdx)**.

**Coming in Next Phase:**

| Package | Purpose |
|---------|---------|
| Alembic | Database migrations |
| python-jose[cryptography] | JWT token verification |
| ReportLab | PDF report generation |

---

## 🚀 Quick Setup (Automated)

### Windows (PowerShell)

```powershell
cd backend
.\setup.ps1
```

### Windows (CMD)

```cmd
cd backend
setup.bat
```

### Linux / macOS

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Create a Python virtual environment (`.venv`)
2. Activate the virtual environment
3. Copy `.env.example` to `.env` (if not present)
4. Install all dependencies from `requirements.txt`

---

## 🛠️ Manual Setup (Step-by-Step)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv .venv
```

### 3. Activate Virtual Environment

| Platform | Command |
|----------|---------|
| **Windows (PowerShell)** | `.venv\Scripts\Activate.ps1` |
| **Windows (CMD)** | `.venv\Scripts\activate.bat` |
| **Linux / macOS** | `source .venv/bin/activate` |

You should see `(.venv)` at the start of your terminal prompt.

> [!TIP]
> If PowerShell blocks the activation script, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
# ─── App ────────────────────────────────────
PROJECT_NAME=Validra Base API
API_V1_STR=/api/v1
ENV=development
HOST=0.0.0.0
PORT=8000

# ─── Database (PostgreSQL via SQLAlchemy async) ───
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/validra

# ─── JWT (add when auth is integrated) ──────
# JWT_SECRET_KEY=same-secret-as-nextauth
# JWT_ALGORITHM=HS256

# ─── Object Storage (add when ready) ────────
# S3_ENDPOINT=http://localhost:9000
# S3_ACCESS_KEY=minioadmin
# S3_SECRET_KEY=minioadmin
# S3_BUCKET=validra-evidence
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Set Up PostgreSQL & SQLAlchemy (Database ORM)

SQLAlchemy 2.0 (async with `asyncpg`) is configured as the backend ORM for FastAPI, handling inspections, rules, violations, audit logs, and compliance records.

#### 1. Create the PostgreSQL Database

If you haven't created the database yet:

```bash
psql -U postgres
```

In the PostgreSQL prompt:

```sql
CREATE DATABASE validra;
\q
```

#### 2. Database Connection Architecture

Validra organizes database management inside `app/db/`:

- **[`app/db/base.py`](../../backend/app/db/base.py)**: Modern SQLAlchemy 2.0 `DeclarativeBase` (`Base`).
- **[`app/db/session.py`](../../backend/app/db/session.py)**: Async engine (`create_async_engine`) and async session factory (`async_sessionmaker`).
- **`get_db()` dependency**: Asynchronous generator yielding database sessions per API request with automatic commit/cleanup:
  ```python
  from fastapi import Depends
  from sqlalchemy.ext.asyncio import AsyncSession
  from app.db.session import get_db

  @router.get("/items")
  async def read_items(db: AsyncSession = Depends(get_db)):
      ...
  ```

#### 3. Test Database Configuration

Verify the database module setup without touching PostgreSQL tables:

```bash
pytest -v tests/test_db.py
```

> [!CAUTION]
> **DO NOT CREATE TABLES YET**  
> Do **NOT** invoke `Base.metadata.create_all()` or run uncoordinated migrations at this stage. Table models (inspections, violations, rules, audit logs) will be created by the team in the dedicated database schema milestone. Keep the database layer at connection-only stage until model schemas are finalized.

#### 4. Future Step: Creating Tables & Migrations (When Models Are Defined)

Once the team defines ORM models in `app/models/`, table creation and migrations will be executed via Alembic:

```bash
# Generate initial Alembic migration
alembic revision --autogenerate -m "initial tables"

# Apply migrations to PostgreSQL
alembic upgrade head
```

---

## 🏃 Running the Backend Server

Start the live-reloading development server:

```bash
uvicorn app.main:app --reload
```

| URL | Purpose |
| :--- | :--- |
| `http://127.0.0.1:8000` | API Base URL |
| `http://127.0.0.1:8000/docs` | Swagger Interactive Docs |
| `http://127.0.0.1:8000/redoc` | ReDoc Interactive Docs |
| `http://127.0.0.1:8000/health` | Health Check Endpoint |

> [!TIP]
> Swagger at `/docs` is the fastest way to test API endpoints during development.

---

## 🧪 Running Tests

```bash
pytest
```

Run with verbose output:

```bash
pytest -v
```

Run a specific test file:

```bash
pytest tests/test_main.py -v
```

---

## 📁 Current Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI entrypoint + CORS + health
│   ├── api/
│   │   ├── __init__.py
│   │   └── router.py          # APIRouter definitions & endpoints
│   └── core/
│       ├── __init__.py
│       └── config.py          # Pydantic BaseSettings
├── tests/
│   ├── conftest.py            # Pytest fixtures
│   └── test_main.py           # API tests
├── .env
├── .env.example
├── .venv/                     # Virtual environment (git-ignored)
├── requirements.txt
├── setup.bat                  # Windows CMD setup
├── setup.ps1                  # Windows PowerShell setup
└── setup.sh                   # Linux/macOS setup
```

### Target Structure (After Blueprint Implementation)

See [Backend Blueprint](../blueprints/backend/backend-blueprint.md) for the full target directory layout including:

```text
backend/app/
├── api/v1/                    # Versioned API routes
│   ├── scans.py               # POST /scans, GET /scans/{id}
│   ├── inspections.py         # Inspection CRUD
│   ├── reports.py             # Report generation
│   ├── dashboard.py           # Dashboard stats
│   └── admin/                 # Admin-only endpoints
├── services/                  # Business logic
│   ├── scan_orchestrator.py   # Pipeline orchestration
│   ├── rule_engine.py         # Compliance evaluation
│   └── rag_service.py         # Legal context retrieval
├── models/                    # SQLAlchemy ORM models
├── schemas/                   # Pydantic request/response
├── reports/                   # PDF generation (ReportLab)
└── utils/                     # Auth, storage, hashing
```

---

## 👥 Module Ownership

| Module | Domain | Owner | Directory |
|--------|--------|-------|-----------|
| M2 | Backend APIs, orchestration | Backend Lead | `backend/app/api/`, `backend/app/services/` |
| M3 | Database, Auth integration | Backend + Auth | `backend/app/models/`, `backend/app/utils/auth.py` |
| M4 | Computer Vision + OCR | CV Lead | `cv/` (separate module, called by backend) |
| M5 | Rule Engine | ML/Rules Lead | `rule-engine/` (separate module, called by backend) |
| M6 | RAG + Legal Intelligence | RAG Lead | `rag/` (separate module, called by backend) |

---

## 📖 Blueprints — What to Build

| Blueprint | Location |
|-----------|----------|
| Backend API Design | [docs/blueprints/backend/](../blueprints/backend/backend-blueprint.md) |
| Full System Blueprint | [docs/blueprint.md](../blueprint.md) |
| Database Schema (Prisma/Auth) | [docs/blueprints/db/prisma/](../blueprints/db/prisma/schema-blueprint.md) |

---

## 🆘 Troubleshooting

<details>
<summary><strong>"python is not recognized"</strong></summary>

- Ensure Python was installed with "Add to PATH" checked
- Try `python3` instead of `python`
- On Windows: Settings → Apps → "App execution aliases" → turn off python.exe entries
- Restart your terminal

</details>

<details>
<summary><strong>Virtual environment won't activate (PowerShell)</strong></summary>

Run this once to allow scripts:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:

```powershell
.venv\Scripts\Activate.ps1
```

</details>

<details>
<summary><strong>Port 8000 already in use</strong></summary>

```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F

# Or start on a different port
uvicorn app.main:app --reload --port 8001
```

</details>

<details>
<summary><strong>PostgreSQL connection refused</strong></summary>

1. Ensure PostgreSQL service is running:
   - Windows: Services → `postgresql-x64-16` → Start
2. Verify port 5432 is open: `psql -U postgres -h localhost -p 5432`
3. Check `DATABASE_URL` in `.env` matches your credentials

</details>

<details>
<summary><strong>pip install fails on Windows</strong></summary>

Some packages require C++ build tools. Install:

```powershell
# Install Microsoft C++ Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

Or download from [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

</details>

---

<div align="center">

<br/>

**⚙️ Validra Backend — Ready to Build!**

*Check the backend blueprint, set up your first API route, and start orchestrating.* 🚀

<br/>

[← Back to README](../../README.md) · [Base Setup →](./base_setup.mdx) · [Frontend Setup →](./frontend_setup.mdx)

</div>
