# ALMS — Automated Lead Management System

Ruby on Rails (API) + React (Vite) + MySQL. Built for support agents to log and
track gold-loan leads.

## Stack
- **backend/** — Rails 7 API-only app, MySQL, JWT auth (bcrypt + `jwt` gem)
- **frontend/** — React (Vite), React Router, Axios

## Data model
- **clusters**: `name`, `location`
- **employees**: `name`, `employee_id` (unique login), `email`, `password_digest`, `role` (support_agent/admin/user), `cluster_id`
- **leads**: `customer_name`, `phone_number`, `gold_quantity`, `amount`, `lead_source` (online_call / customer_referral / walk_in), `lead_type` (new_lead / follow_up / take_over), `status` (new / follow_up / pending_verification / accepted / rejected), `employee_id`

There used to be a `lead_type: gl` ("Genuine Lead") bucket beyond the 3
named types, added because the dashboard mock showed a "GL" row/tab. It's
since been removed (see `db/migrate/20260101000005_reassign_gl_lead_type.rb`,
which reassigns any existing `gl` leads to `take_over` before the enum
value disappears).

`genuine_lead_percent` and `lead_quality_score` on the dashboard are
placeholder formulas (see comment in `app/controllers/api/v1/dashboard_controller.rb`)
until you define the real business rules.

## Setup

### 1. MySQL
Have a local MySQL server running. Default config expects `root` with no
password on `127.0.0.1:3306` — override with env vars if yours differs:
`ALMS_DB_USERNAME`, `ALMS_DB_PASSWORD`, `ALMS_DB_HOST`, `ALMS_DB_PORT`.

### 2. Backend
```
cd backend
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server -p 3000
```
This app was hand-scaffolded (not via `rails new`) because this environment
had no network access to rubygems.org — `bundle install` on your machine
will fetch every gem normally. Seeded login: **employee_id `EMP-2201`**,
**password `password123`**.

### 3. Frontend
```
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if backend isn't on :3000
npm run dev
```
Visit http://localhost:5173 — sign up a new support agent or sign in with
the seeded account above.

## What's implemented
- Sign up (name, email, cluster, employee ID, password) → creates a
  `support_agent` employee, returns a JWT
- Sign in with employee ID + password → JWT
- Dashboard: stat cards, tab bar (New Lead / Follow-up / Take Over / My
  Leads / Lead Performance), "Add Lead" modal, recent-activity table with
  masked phone numbers
- Leads scoped per signed-in agent (an agent only sees their own leads)

## Not implemented yet (flagged, not silently skipped)
- Admin and User (customer) roles have DB columns/enum values but no
  UI/endpoints — only the support-agent flow was in scope for this pass
- The "Locked · Authority access only" row style from your mock (row-level
  permission beyond the owning agent) isn't built
- "Lead Performance" tab currently just lists the agent's own leads; no
  separate analytics view yet
