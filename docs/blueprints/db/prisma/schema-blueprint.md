# Validra — Database Schema Blueprint (Prisma)

> **Owner:** FE Team (M1) for frontend/auth tables + Backend Team (M2) for API tables
> **ORM:** Prisma (used by Next.js for auth and user management)
> **Database:** PostgreSQL

---

## 1. Overview

Validra uses **two ORMs** accessing the **same PostgreSQL database**:

| ORM | Used By | Purpose |
|---|---|---|
| **Prisma** | Next.js (Frontend/Auth) | User accounts, sessions, email verification, auth tokens |
| **SQLAlchemy** | FastAPI (Backend) | Inspections, OCR results, compliance, reports, audit logs |

This document defines the **Prisma schema** for the frontend/auth layer. For backend tables (inspections, rules, violations, etc.), see [blueprint.md](../../blueprint.md) Section 7.

---

## 2. Prisma Schema File Structure

```
frontend/
├── prisma/
│   ├── schema.prisma              ← Main schema file
│   ├── migrations/                ← Auto-generated migration history
│   └── seed.ts                    ← Seed data (admin creation script)
```

---

## 3. Full Prisma Schema

```prisma
// frontend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// 1. USER ACCOUNTS
// ============================================================

model User {
  id              String    @id @default(uuid()) @db.Uuid
  name            String
  email           String    @unique
  emailVerified   DateTime? @map("email_verified")
  passwordHash    String    @map("password_hash")
  image           String?
  role            UserRole  @default(INSPECTOR)
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  lastLoginAt     DateTime? @map("last_login_at")

  // Relations
  accounts         Account[]
  sessions         Session[]
  verificationTokens VerificationToken[]
  passwordResetTokens PasswordResetToken[]

  @@map("users")
}

enum UserRole {
  INSPECTOR
  ADMIN
  SUPERVISOR
}

// ============================================================
// 2. NEXTAUTH / AUTH.JS ACCOUNTS
//    (Required for OAuth providers, optional for credentials)
// ============================================================

model Account {
  id                String  @id @default(uuid()) @db.Uuid
  userId            String  @map("user_id") @db.Uuid
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// ============================================================
// 3. SESSIONS
// ============================================================

model Session {
  id           String   @id @default(uuid()) @db.Uuid
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id") @db.Uuid
  expires      DateTime
  createdAt    DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ============================================================
// 4. EMAIL VERIFICATION TOKENS
//    (Used by Nodemailer for email verification)
// ============================================================

model VerificationToken {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  token      String   @unique
  type       TokenType @default(EMAIL_VERIFICATION)
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  usedAt     DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("verification_tokens")
}

enum TokenType {
  EMAIL_VERIFICATION
  EMAIL_CHANGE
}

// ============================================================
// 5. PASSWORD RESET TOKENS
// ============================================================

model PasswordResetToken {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  token      String   @unique
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  usedAt     DateTime? @map("used_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("password_reset_tokens")
}

// ============================================================
// 6. EMAIL LOG
//    (Track all emails sent by Nodemailer)
// ============================================================

model EmailLog {
  id          String      @id @default(uuid()) @db.Uuid
  recipientEmail String   @map("recipient_email")
  emailType   EmailType   @map("email_type")
  subject     String
  status      EmailStatus @default(PENDING)
  sentAt      DateTime?   @map("sent_at")
  failedAt    DateTime?   @map("failed_at")
  errorMessage String?    @map("error_message")
  metadata    Json?
  createdAt   DateTime    @default(now()) @map("created_at")

  @@index([recipientEmail])
  @@index([emailType])
  @@index([status])
  @@map("email_logs")
}

enum EmailType {
  VERIFICATION
  PASSWORD_RESET
  WELCOME
  INSPECTOR_INVITE
  INSPECTION_COMPLETE
  WEEKLY_REPORT
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
  BOUNCED
}

// ============================================================
// 7. INVITE TOKENS
//    (Admin invites new inspectors via email)
// ============================================================

model InviteToken {
  id           String   @id @default(uuid()) @db.Uuid
  email        String
  role         UserRole @default(INSPECTOR)
  token        String   @unique
  invitedBy    String   @map("invited_by")
  expiresAt    DateTime @map("expires_at")
  acceptedAt   DateTime? @map("accepted_at")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([token])
  @@index([email])
  @@map("invite_tokens")
}
```

---

## 4. Table Details

### 4.1 `users` — Core User Account

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK, auto-generated | Unique user identifier |
| `name` | String | NOT NULL | Full name |
| `email` | String | UNIQUE, NOT NULL | Login identifier |
| `email_verified` | DateTime? | Nullable | Timestamp when email was verified |
| `password_hash` | String | NOT NULL | bcrypt/argon2 hashed password |
| `image` | String? | Nullable | Profile image URL |
| `role` | Enum | DEFAULT: INSPECTOR | INSPECTOR / ADMIN / SUPERVISOR |
| `is_active` | Boolean | DEFAULT: true | Account active/deactivated |
| `created_at` | DateTime | DEFAULT: now() | Registration timestamp |
| `updated_at` | DateTime | Auto-updated | Last modification |
| `last_login_at` | DateTime? | Nullable | Last successful login |

**Used by:** Login, Register, Profile, Admin User Management, JWT token generation.

### 4.2 `accounts` — OAuth Provider Accounts (NextAuth)

Standard NextAuth adapter table for OAuth providers. For Validra MVP, credentials-based auth is primary. This table supports future OAuth integration (Google, GitHub).

### 4.3 `sessions` — Active Sessions

| Column | Type | Purpose |
|---|---|---|
| `session_token` | String (UNIQUE) | Session identifier |
| `user_id` | UUID (FK → users) | Session owner |
| `expires` | DateTime | Session expiry |

**Used by:** NextAuth session management, JWT token issuance.

### 4.4 `verification_tokens` — Email Verification

| Column | Type | Purpose |
|---|---|---|
| `token` | String (UNIQUE) | Verification token sent via email |
| `user_id` | UUID (FK → users) | Token owner |
| `type` | Enum | EMAIL_VERIFICATION or EMAIL_CHANGE |
| `expires_at` | DateTime | Token expiry (24 hours) |
| `used_at` | DateTime? | When token was used (null = unused) |

**Flow:**
```
1. User registers → token generated → stored in DB
2. Nodemailer sends email with: /verify-email?token=<token>
3. User clicks link → frontend sends token to API
4. API validates: token exists, not expired, not used
5. On valid: set users.email_verified = now(), set used_at = now()
6. Redirect to /login
```

### 4.5 `password_reset_tokens` — Password Reset

| Column | Type | Purpose |
|---|---|---|
| `token` | String (UNIQUE) | Reset token sent via email |
| `user_id` | UUID (FK → users) | Token owner |
| `expires_at` | DateTime | Token expiry (1 hour) |
| `used_at` | DateTime? | When token was used |

**Flow:**
```
1. User submits email on /forgot-password
2. If email exists: generate token, store in DB, send email
3. Email contains: /reset-password?token=<token>
4. User enters new password + confirms
5. API validates token: exists, not expired, not used
6. On valid: update users.password_hash, set used_at = now()
7. Redirect to /login
```

### 4.6 `email_logs` — Email Audit Trail

Tracks every email sent by the system:

| Column | Type | Purpose |
|---|---|---|
| `recipient_email` | String | Who received the email |
| `email_type` | Enum | VERIFICATION / PASSWORD_RESET / WELCOME / INVITE / etc. |
| `subject` | String | Email subject line |
| `status` | Enum | PENDING / SENT / FAILED / BOUNCED |
| `sent_at` | DateTime? | When successfully sent |
| `failed_at` | DateTime? | When failed |
| `error_message` | String? | Error details if failed |
| `metadata` | JSON? | Additional data (template vars, etc.) |

**Used by:** Email sending service, admin audit, debugging failed emails.

### 4.7 `invite_tokens` — Inspector Invitations

| Column | Type | Purpose |
|---|---|---|
| `email` | String | Invited email address |
| `role` | Enum | Role to assign (default: INSPECTOR) |
| `token` | String (UNIQUE) | Invitation token |
| `invited_by` | String | Admin user ID who sent invite |
| `expires_at` | DateTime | Token expiry (7 days) |
| `accepted_at` | DateTime? | When invite was accepted |

**Flow:**
```
1. Admin clicks "Invite Inspector" → enters email
2. Generate invite token, store in DB
3. Send invitation email with: /register?invite=<token>
4. Inspector clicks link → registration form pre-filled with email
5. On registration: validate invite token, create user, set accepted_at
```

---

## 5. Email Templates

The following email templates are sent via Nodemailer:

| Template | Trigger | Content |
|---|---|---|
| `verification` | User registers | "Verify your email" + verification link |
| `password-reset` | User requests reset | "Reset your password" + reset link |
| `welcome` | Email verified | "Welcome to Validra" |
| `inspector-invite` | Admin invites user | "You've been invited to Validra" + registration link |
| `inspection-complete` | Scan finishes | "Your inspection is ready for review" (optional) |

---

## 6. Token Security Rules

| Token Type | Expiry | One-Time Use | Rate Limit |
|---|---|---|---|
| Email Verification | 24 hours | Yes (set `used_at`) | 1 resend per 60 seconds |
| Password Reset | 1 hour | Yes (set `used_at`) | 1 request per 60 seconds |
| Invite | 7 days | Yes (set `accepted_at`) | Admin-controlled |
| Session | Configurable (7 days default) | No (reusable until expiry) | N/A |

---

## 7. Admin Creation Script

```
frontend/prisma/seed.ts
```

Since admin accounts are NOT created via the registration page, use a seed/CLI script:

```ts
// frontend/prisma/seed.ts (or scripts/create-admin.ts)
// Usage: npx ts-node scripts/create-admin.ts

import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

async function createAdmin() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  const name = await question(rl, 'Admin name: ');
  const email = await question(rl, 'Admin email: ');
  const password = await question(rl, 'Admin password: ');
  
  const passwordHash = await hash(password, 12);
  
  const admin = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),  // Admin email is pre-verified
      isActive: true,
    },
  });
  
  console.log(`Admin created: ${admin.email} (${admin.id})`);
  rl.close();
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 8. Relationship to Backend Tables

The Prisma schema handles **auth and user management only**. The following tables are managed by SQLAlchemy in the FastAPI backend and share the same PostgreSQL database:

| SQLAlchemy Table | Purpose | FK to Prisma |
|---|---|---|
| `products` | Product metadata | — |
| `inspections` | Inspection records | `inspector_id` → `users.id` |
| `images` | Product/evidence images | — |
| `ocr_runs` | OCR processing results | — |
| `ocr_text_regions` | Individual text detections | — |
| `extracted_fields` | Extracted compliance fields | — |
| `rules` | Legal compliance rules | — |
| `compliance_results` | Overall compliance status | — |
| `violations` | Individual violations | — |
| `reports` | Generated PDF reports | — |
| `audit_logs` | System audit trail | `user_id` → `users.id` |

**Important:** Both Prisma and SQLAlchemy access the same `users` table. Prisma owns the schema (migrations), and SQLAlchemy reads from it. Do NOT create duplicate user models in SQLAlchemy — use raw SQL queries or a read-only mapped model.

---

## 9. Migration Commands

```bash
# Generate migration after schema changes
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Seed admin user
npx prisma db seed

# Reset database (DEV ONLY)
npx prisma migrate reset
```

---

## 10. Environment Variables

```env
# frontend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/validra"
NEXTAUTH_SECRET="<random-32-char-secret>"
NEXTAUTH_URL="http://localhost:3000"

# Nodemailer SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="validra.noreply@gmail.com"
SMTP_PASSWORD="<app-password>"
SMTP_FROM="Validra <validra.noreply@gmail.com>"
```
