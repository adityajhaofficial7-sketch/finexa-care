# Email Reminders — Full Setup

Recipients = each signed-in user (everyone gets reminders for their own clients).

## 1. Authentication
- Add email/password + Google sign-in
- New `/auth` route (sign in / sign up)
- Move all app routes under `_authenticated/` so only signed-in users see them
- Add sign-out + "signed in as …" in the header

## 2. Database (persist clients + compliances)
Currently `src/data/clients.ts` is static and the app state is in-memory. We'll create:

- `profiles` — id (= auth user id), email, full_name, firm_name
- `clients` — id, user_id, name, pan, type, contact_email, contact_phone, notes
- `compliances` — id, user_id, client_id, title, type (GST/TDS/ITR/ROC/…), due_date, status (pending/filed/overdue), notes
- `notification_preferences` — user_id, email_enabled, days_before (default 7), daily_digest_enabled

All tables: RLS scoped to `auth.uid() = user_id`, full GRANTs, updated_at trigger.

## 3. Replace in-memory store with DB
- Refactor `useClients` / wherever client + compliance state lives to use TanStack Query + Supabase
- Seed each new user with a couple of sample clients on first login (optional, easy to remove)
- Existing pages (Clients, Client detail, Compliance, Calendar) start reading/writing the DB

## 4. Email infrastructure
- Set up sender domain (you'll do this via the dialog above — required before sending)
- Set up Lovable email infrastructure (queues, send log, suppression, unsubscribe)
- Create one branded template: **Deadline reminder** — lists client, compliance, due date, days remaining
- Optionally a **Daily digest** template (off by default; controlled in Settings)

## 5. Daily cron job
A scheduled route runs every day at 09:00 IST and, for every user with `email_enabled = true`:
- Finds compliances where `due_date = today + days_before` AND `status = 'pending'`
- Sends one reminder email per compliance (idempotency key prevents duplicates)
- If `daily_digest_enabled`, also sends a daily summary of all upcoming + overdue items

## 6. Settings page wiring
The toggles already shown in Settings get wired to `notification_preferences` (real persistence, not just UI).

---

## Technical notes (for reference)
- TanStack Start `createServerFn` for app-internal DB reads/writes
- Server route under `/api/public/hooks/send-reminders` called by `pg_cron` + `pg_net` (apikey header)
- `supabaseAdmin` inside the cron handler to iterate users (after verifying the apikey)
- `idempotency_key` = `${user_id}:${compliance_id}:${due_date}` so re-runs are safe
- Existing demo client list (`src/data/clients.ts`) becomes seed-only

## What you need to do
1. Click **Set up email domain** above and complete it
2. Approve the database migration when I create it
3. After publish, the cron starts firing daily

Want me to proceed with this full plan, or trim anything (e.g. skip Google sign-in, skip digest)?
