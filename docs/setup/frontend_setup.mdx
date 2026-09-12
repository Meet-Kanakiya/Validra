---
title: "Frontend Setup Guide"
description: "Step-by-step instructions for setting up, configuring, and running the Validra Next.js frontend."
---

# 🎨 Validra — Frontend Setup Guide

<p align="center">
  <a href="../../README.md">
    <img src="../../Assets/Repo/logo_repo.png" alt="Validra Logo" width="140" />
  </a>
</p>

> **Team VisionMinds — Think. Build. Transform.**  
> **Domain M1:** Frontend & UI/UX

---

## 📋 System Requirements

| Tool | Required Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | 18.0+ (LTS 22+ recommended) | JavaScript/TypeScript Runtime |
| **npm** | 9.0+ | Package Manager |
| **PostgreSQL** | 15+ | Database (for Prisma/Auth) |
| **Git** | 2.40+ | Version Control |

> [!IMPORTANT]
> Complete the [Base Setup Guide](./base_setup.mdx) first if you haven't installed these tools.

---

## 📦 Current Stack Versions

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.3.4 | App Router |
| React | 19.2.8 | Server Components |
| TypeScript | ^5 | Strict mode |
| Tailwind CSS | ^4 | v4 (CSS-first config) |
| Prisma | ^6.19.3 | PostgreSQL ORM for auth & user management |

---

## 🚀 Quick Setup (Automated)

The fastest way to get running:

```bash
cd frontend
npm run setup
```

This runs `scripts/setup.js` which:
1. Checks for `.env` — copies from `.env.example` if missing
2. Installs all npm dependencies

Then start the dev server:

```bash
npm run dev
```

Frontend available at: **http://localhost:3000**

---

## 🛠️ Manual Setup (Step-by-Step)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local values:

```env
# ─── API ───────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development

# ─── Database (Prisma) ─────────────────────────
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/validra"

# ─── NextAuth / Auth.js ────────────────────────
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

# ─── Nodemailer (Email Verification) ───────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="Validra <your-email@gmail.com>"
```

> [!TIP]
> Generate `NEXTAUTH_SECRET` with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> [!TIP]
> For Gmail SMTP, enable 2-Factor Auth and create an [App Password](https://myaccount.google.com/apppasswords).

### 3. Install Dependencies

```bash
npm install
```

### 4. Create the PostgreSQL Database

Open a new terminal and run:

```bash
psql -U postgres
```

Then in the PostgreSQL shell:

```sql
CREATE DATABASE validra;
\q
```

### 5. Set Up Prisma with PostgreSQL (Database ORM)

Prisma is configured as the ORM for Next.js authentication and user management accessing the shared PostgreSQL database.

#### 1. Configure Database URL

Ensure your `frontend/.env` file contains your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/validra"
```

Replace `postgres` (user), `your_password`, and `validra` (database name) with your local credentials.

#### 2. Prisma Schema (`prisma/schema.prisma`)

The Prisma schema is initialized with the PostgreSQL datasource and client generator:

```prisma
// frontend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 3. Prisma Client Singleton (`src/lib/prisma.ts`)

To avoid creating multiple database connections during Next.js hot-reloads in development, use the singleton instance in [`frontend/src/lib/prisma.ts`](../../frontend/src/lib/prisma.ts):

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

#### 4. Validate Schema

Validate the Prisma configuration at any time without touching database tables:

```bash
npx prisma validate
```

> [!CAUTION]
> **DO NOT CREATE TABLES YET**  
> Do **NOT** run `npx prisma migrate dev` or `npx prisma db push` at this stage. Table models (users, sessions, accounts) will be defined and created by the team during the dedicated database schema milestone. Keep the schema at connection-only stage until models are explicitly finalized.

#### 5. Future Step: Creating Tables & Migrations (When Models Are Defined)

Once the team commits the model definitions from the [DB Schema Blueprint](../blueprints/db/prisma/schema-blueprint.md):

```bash
# Generate the Prisma Client types
npx prisma generate

# Create and apply initial migration to PostgreSQL
npx prisma migrate dev --name init
```

### 6. Install shadcn/ui Components

shadcn/ui components are added individually as needed:

```bash
# Initialize shadcn/ui (first time only)
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button card input badge accordion dialog toast skeleton table
```

---

## 🏃 Running the Development Server

```bash
npm run dev
```

| URL | Purpose |
| :--- | :--- |
| `http://localhost:3000` | Frontend application |
| `http://localhost:3000/api/auth` | NextAuth API routes (after auth setup) |

---

## 🧪 Available Scripts

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run setup` | `node scripts/setup.js` | Automated env config + dependency install |
| `npm run dev` | `next dev` | Start dev server with hot reload |
| `npm run build` | `next build` | Create optimized production build |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint static analysis |

---

## 📁 Project Directory Structure

```text
frontend/
├── prisma/
│   ├── schema.prisma          # Database schema (auth tables)
│   ├── migrations/            # Migration history
│   └── seed.ts                # Admin user seed script
├── public/                    # Static assets & fonts
├── scripts/
│   └── setup.js               # Automated setup script
├── src/
│   ├── app/
│   │   ├── (landing)/         # Public/marketing pages (FE-1)
│   │   │   ├── layout.tsx     # Navbar + Footer
│   │   │   ├── page.tsx       # "/" — Landing page
│   │   │   ├── about/
│   │   │   ├── features/
│   │   │   ├── how-it-works/
│   │   │   ├── contact/
│   │   │   └── faq/
│   │   ├── (auth)/            # Auth pages (FE-2)
│   │   │   ├── layout.tsx     # Centered auth card layout
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (inspector)/       # Inspector app (FE-2)
│   │   │   ├── layout.tsx     # InspectorShell (sidebar + header)
│   │   │   ├── dashboard/
│   │   │   ├── scan/
│   │   │   ├── inspections/
│   │   │   ├── reports/
│   │   │   └── profile/
│   │   ├── (admin)/           # Admin portal (FE-3)
│   │   │   ├── layout.tsx     # AdminShell (admin sidebar + header)
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── users/
│   │   │       ├── rules/
│   │   │       ├── legal-documents/
│   │   │       ├── inspections/
│   │   │       ├── audit-logs/
│   │   │       └── settings/
│   │   ├── layout.tsx         # Root layout (html, body, providers)
│   │   ├── globals.css        # Tailwind + design tokens
│   │   └── favicon.ico
│   ├── components/
│   │   ├── landing/           # Landing-only components (FE-1)
│   │   ├── auth/              # Auth-only components (FE-2)
│   │   ├── inspector/         # Inspector-only components (FE-2)
│   │   ├── admin/             # Admin-only components (FE-3)
│   │   └── shared/            # Shared design system (all teams)
│   │       └── ui/            # shadcn/ui primitives
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API service functions
│   ├── lib/                   # Utilities, constants, data
│   └── types/                 # TypeScript type definitions
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 👥 Team Ownership — Who Works Where

The frontend is split into **three isolated route groups** so team members can work independently without code conflicts:

| Team Member | Route Group | Components Folder | Branch Pattern |
|-------------|-------------|-------------------|----------------|
| **FE-1** | `(landing)/` | `components/landing/` | `feature/landing-*` |
| **FE-2** | `(auth)/` + `(inspector)/` | `components/auth/` + `components/inspector/` | `feature/inspector-*` |
| **FE-3** | `(admin)/` | `components/admin/` | `feature/admin-*` |

**Shared across all:** `components/shared/ui/` (shadcn/ui primitives)

> [!IMPORTANT]
> **Never** import components from another team's folder. For example, `components/inspector/` must NOT import from `components/landing/`.

---

## 📖 Blueprints — What to Build

Detailed page specs, functional requirements, and component trees for each module:

| Blueprint | Owner | Location |
|-----------|-------|----------|
| Landing Pages | FE-1 | [docs/blueprints/frontend/landing/](../blueprints/frontend/landing/landing-blueprint.md) |
| Inspector + Auth | FE-2 | [docs/blueprints/frontend/inspector/](../blueprints/frontend/inspector/inspector-blueprint.md) |
| Admin Portal | FE-3 | [docs/blueprints/frontend/admin/](../blueprints/frontend/admin/admin-blueprint.md) |
| Database Schema | All | [docs/blueprints/db/prisma/](../blueprints/db/prisma/schema-blueprint.md) |

---

## 🆘 Troubleshooting

<details>
<summary><strong>"Module not found" errors after cloning</strong></summary>

Run `npm install` to install all dependencies:

```bash
cd frontend
npm install
```

</details>

<details>
<summary><strong>Prisma errors — "Cannot find database"</strong></summary>

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` matches your PostgreSQL credentials
3. Run `npx prisma migrate dev` to apply migrations

</details>

<details>
<summary><strong>Port 3000 already in use</strong></summary>

```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or start on a different port
npm run dev -- -p 3001
```

</details>

<details>
<summary><strong>Tailwind styles not applying</strong></summary>

Tailwind CSS v4 uses a CSS-first configuration. Ensure `postcss.config.mjs` includes `@tailwindcss/postcss` and your `globals.css` has the Tailwind imports.

</details>

---

<div align="center">

<br/>

**🎨 Validra Frontend — Ready to Build!**

*Read your team's blueprint, create your feature branch, and start building.* 🚀

<br/>

[← Back to README](../../README.md) · [Base Setup →](./base_setup.mdx) · [Backend Setup →](./backend_setup.mdx)

</div>
