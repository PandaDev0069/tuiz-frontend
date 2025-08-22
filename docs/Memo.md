# ✅ Tomorrow Plan — {date.today().strftime('%Y-%m-%d')}

**Theme:** Ship a minimal, test-backed Auth + Home slice (frontend + backend), PR, then deploy.

---

## Order of Execution (strict)

1. **Branching**
   - `git checkout -b feat/auth-ui-and-routes`

2. **Frontend — Login & Register UI (Task 1)**
   - Pages: `/login`, `/register`
   - Reuse shared auth form components
   - Accessibility: label+id, keyboard nav, visible focus, aria-live for errors
   - States: idle / loading / success / error
   - **Definition of Done**
     - Renders on mobile & desktop breakpoints
     - Form validation messages appear
     - Snapshot & unit tests green

3. **Frontend — Finalize Home UI + Tests (Task 2)**
   - Hero, primary actions (Create, Join, Library, Profile)
   - Show auth-aware header (Sign in/Out button swap)
   - **DoD**
     - Jest/Vitest components covered
     - Critical flows snapshot tested
     - Lighthouse (local) quick check: no obvious a11y regressions

4. **Frontend — `/join` UI only (Task 3)**
   - Input: Game PIN
   - Disabled button until valid PIN pattern
   - Error helper text space reserved (no backend call yet)
   - **DoD:** Component tests + form behavior tests

5. **Backend — Auth Routes (Task 4)**
   - Routes: `POST /auth/register`, `POST /auth/login`
   - Use Supabase Auth admin SDK on server OR proxy to Supabase Auth endpoints (choose one, stay minimal)
   - Return minimal JSON: `{{ ok, message, user? }};` set cookie/JWT as per current backend conventions
   - **DoD:** Validation, 400/401/409 paths handled; logs without secrets

6. **Backend — Tests (Task 5)**
   - Unit: validators, controllers
   - API: Supertest for success/failure
   - **Test Matrix**
     - Register: ok | duplicate email | weak password
     - Login: ok | wrong password | nonexistent user | locked (if applicable)
     - Rate-limit (if present): returns 429

7. **Integration — Wire FE to BE (Task 6)**
   - Frontend env: `VITE_API_URL` (or NEXT*PUBLIC*\*) points to backend
   - Login/Register forms call backend routes; handle JSON and set auth state
   - **DoD:** Happy path works locally end-to-end; all tests green

8. **PR, CI, Deploy (Tasks 7–8)**
   - `git add -A && git commit -m "Auth UI + routes + tests; home finalized"`
   - `git push -u origin feat/auth-ui-and-routes`
   - Open PR: include checklist (below)
   - Merge → Deploy (Vercel frontend, Render backend). Verify health + smoke tests.

---

## Test Checklist (copy-paste into PR)

- [ ] Frontend: Login/Register render & validate
- [ ] Frontend: Home shows correct auth state
- [ ] Frontend: `/join` form logic
- [ ] Backend: `/auth/register` success & error cases
- [ ] Backend: `/auth/login` success & error cases
- [ ] E2E (local): login → redirected to dashboard
- [ ] No console errors; server logs clean
- [ ] Types pass, lints pass, unit tests pass
- [ ] Env vars documented in README

---

## Quick Commands

```bash
# Branch
git checkout -b feat/auth-ui-and-routes

# Frontend (example)
pnpm -F frontend dev
pnpm -F frontend test

# Backend (example)
pnpm -F backend dev
pnpm -F backend test

# Lint & typecheck (adjust to your scripts)
pnpm -r lint && pnpm -r typecheck
Minimal API Contracts (reference)
POST /auth/register

Body: {{ email, password, username? }}

201 → {{ ok:true, user:{{ id,email }} }}

409 → duplicate

400 → validation

POST /auth/login

Body: {{ emailOrName, password }}

200 → {{ ok:true, token|cookie }}

401 → invalid creds

Note: keep responses tiny; never leak why a credential failed.

Definition of Done (overall)
All 6 feature tasks ✅

PR created with checklist ✅

CI green ✅

Merged to main ✅

Deployed FE+BE ✅

Post-deploy smoke test (login flow) ✅

Nice-to-have (only if time remains)
Basic rate limiting on auth routes

Tiny loading skeletons on auth pages

Password visibility toggle + caps-lock warning

Error boundary for auth pages

Mindset: ship small, well-tested pieces. Prefer boring solutions. Leave breadcrumbs (TODOs) where future work is obvious.

```
