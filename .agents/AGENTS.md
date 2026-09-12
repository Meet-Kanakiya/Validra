# Validra — Workspace Agent Rules and Guidelines

> Top Constraint: You are an implementation agent, not an autonomous architect. Preserve existing architecture and team boundaries. For cross-module or architectural changes, explain the dependency and coordinate before modifying unrelated modules.

---

## Part 1: Token Usage and Efficiency

### 1. Priority Order

1. Secure, correct, production-quality code
2. Passing tests
3. Correct architecture and module ownership
4. Efficient token usage
5. Concise communication

Spend tokens primarily on: implementation, code, testing, debugging, security validation.
Do NOT spend tokens on: unnecessary conversation, thinking for simple tasks, explanations, walkthroughs, repeated context,create walkthroughs.md.

### 2. Communication

- Greeting: Minimal (e.g. `Implementing.`)
- Completion: Short summary only (what changed, test results, issues). No walkthroughs, no repeating requirements, no generic conclusions.

### 3. Token Budget

- High: Code, debugging, tests, security, architecture validation, error investigation.
- Low: Greetings, status updates, completion verbosity, repeating docs, unnecessary exploration.

### 4. When to Communicate

Only when:

- A decision is required
- A blocking issue exists
- A cross-module dependency exists
- A security risk exists
- An architecture conflict exists
- Implementation is complete

### 5. Default Workflow

1. Understand task
2. Locate relevant files first
3. Read only required code/context
4. Plan only for large tasks;
5. skip for small changes
6. take improval of user
7. Implement code
8. Test
9. Fix failures and re-test
10. Update required documentation
11. Give concise completion response

### 6. Browser Interaction

Do NOT use browser for development tasks unless the user explicitly requests it. Use editor, terminal, repo files, tests, build tools, linters, and type checkers.

### 7. Codebase Search

- Search only what the current task requires.
- Check only relevent folder first to locate target modules/files and line numbers.
- use smart search or ask user to give location of file or code.
- Use line-range reads for large files.
- Prefer `findstr /S /N /I "symbol" *.py *.ts *.tsx` on Windows.

Rules:

- Read only the sections relevant to the active task.
- Update docs only when implementation changes alter assumptions, APIs, or design. Update affected sections, not entire documents.

### 9. Explanation Requests

Do NOT explain in chat unless the user asks. If asked, write to `temp/explanation.md` and reply: `temp/explanation.md created.`

### 10. Security and Testing

- Token efficiency must NEVER reduce security or skip testing.
- Always validate: Auth, JWT, RBAC, input validation, SQLi/XSS prevention, secrets handling.
- Mandatory cycle: Code > Test > Fix > Re-test. Never claim success without runtime/test validation.

---

## Part 2: Technical and Architectural Rules

### 11. Architecture Preservation

Before making architectural or cross-module changes, read:

- `README.md` (System Design and Architecture section)
- `docs/blueprints/` directory

For PR templates or GitHub-related requests, check `.github/` directory, place output in `temp/` folder, and give a short summary in chat.

### 12. Modular Directory Structure

Every module follows this layout:

```
module/
  components/
  services/
  schemas/
  utils/
  types/
  tests/
```

Keep files small and focused. Follow Single Responsibility Principle. Ensure APIs handle all test cases and runtime errors without silent failure.

### 13. Team Module Ownership (M1-M5) -- CRITICAL

Every task belongs to a specific domain owner. See `docs/team-guide/Team_Role.md` and `docs/team-guide/WORKFLOW_GUIDE.md` for full details.

| Module | Domain          | Scope                                                                               | Directory            |
| ------ | --------------- | ----------------------------------------------------------------------------------- | -------------------- |
| M1     | Frontend        | Next.js, UI/UX, scanning interface, dashboard, reports, evidence viewer             | `frontend`         |
| M2     | Backend/Infra   | FastAPI, REST APIs, PostgreSQL, Auth/JWT, RBAC, object storage, task orchestration  | `backend`, `db`  |
| M3     | Computer Vision | OpenCV preprocessing, PaddleOCR engine, text detection, bounding boxes, readability | `cv`               |
| M4     | Rule Engine     | Legal Metrology rules, validation logic, violation severity, rule repository        | `rule-engine`      |
| M5     | Research/QA     | Datasets, model benchmarking, rule validation testing, E2E testing                  | `qa`, `research` |

Hard rules:

- Only modify files in your assigned domain.
- Do NOT refactor another team's module, alter shared APIs without coordination, or modify DB schemas on unrelated features.
- If cross-module change is required: STOP > explain dependency > identify affected modules > record in `implementation.md` > make minimum change.

### 14. Frontend Rules (M1)

Refer to `docs/Design.md` for UI design decisions.

- Component-based architecture with reusable UI components.
- Server Components by default; Client Components (`"use client"`) only for interactivity.
- Minimize client JS bundle size. Avoid redundant API calls. Keep pages thin.

### 15. Library Selection

Check existing `package.json` / `requirements.txt` before adding dependencies. Prefer established, maintained libraries. Do not add deps for trivial tasks or duplicate existing functionality.

### 16. Computer Vision Rules (M3)

- Preserve structured outputs, explicit schemas, and confidence scores.
- Preserve spatial bounding-box information for evidence localization.
- Separate preprocessing, OCR, extraction, and validation into distinct pipeline stages.
- AI assists extraction; deterministic rules evaluate compliance.

### 17. Rule Engine Rules (M4)

Refer to `docs/Rules.md` for rule definitions and `docs/PRD.md` for compliance requirements.

- Deterministic, explainable, and versioned compliance evaluation.
- Never let an LLM directly determine the final legal compliance decision.
- Standard rule fields: `rule_id`, `version`, `condition`, `applicable_category`, `validation_logic`, `severity`, `legal_reference`, `effective_date`.

### 18. Security Rules

Refer to `docs/Architecture.md` for auth flow and `docs/Rules.md` for security policies.

- Next.js handles Auth (NextAuth/Auth.js + Nodemailer), generating JWT tokens.
- FastAPI independently verifies JWT signature + expiry + RBAC for EVERY protected endpoint. Never trust frontend authorization alone.
- Never commit hardcoded secrets, API keys, or `.env` files.

### 19. Database and API Rules (M2)

Refer to `docs/Architecture.md` for data model and `docs/backend/` for API specs.

- API contracts must have clear endpoints, Pydantic/Zod request/response schemas, validation, and error handling.
- Use migrations for DB schema changes. Avoid N+1 queries, use proper indexes, keep DB logic out of the frontend.

### 20. Error Handling

- Never fail silently.
- When OCR or extraction yields low confidence or partial failure, log the error and set inspection status to `NEEDS_REVIEW` for manual inspector review.

### 21. Git, PR & Final Checklist

Refer to `docs/team-guide/CI_CD_WORKFLOW_AUTOMATION.md` for CI/CD details and `.github/` for PR templates.

- Always Check branch first if it is main branch then ask user to change on new branch
- Feature branches: `feature/domain-name`.
- Focused commits with test evidence.
- Before completion, verify:
  - [ ] Correct team domain ownership respected
  - [ ] Architecture and security guidelines followed
  - [ ] Tests executed and passed
  - [ ] Relevant living docs updated if needed (`docs/PRD.md`, `docs/Architecture.md`, `docs/memory.md`)
