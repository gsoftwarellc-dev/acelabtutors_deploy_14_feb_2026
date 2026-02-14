# Safe Continuous Deployment

**Hostinger users:** For a step-by-step guide for **acelabtutors.co.uk** (Node.js) and **api.acelabtutors.co.uk** (Laravel), see **docs/DEPLOY_HOSTINGER.md**.

Use this so you can **deploy new features and fixes** often while:
- The **live site stays up** (no crash)
- The **live database keeps all data** and only gains new data
- New code goes live without wiping or breaking existing data

---

## Golden rules

| Do | Never do on production |
|----|-------------------------|
| Use **one persistent database** for all deploys | Create a new DB per deploy or use SQLite that gets recreated |
| Run **`php artisan migrate --force`** to add new tables/columns | Run **`migrate:fresh`** or **`migrate:fresh --seed`** (wipes all data) |
| Run **safe seeds** only if they only insert missing data | Run **`db:seed`** if it truncates or replaces tables |
| Deploy **backend first** when API changed, then frontend | Deploy frontend before backend when API changed (causes errors) |
| Keep **same `.env`** DB_* and APP_URL/FRONTEND_URL on server | Change DB_* to a new database on deploy |

---

## 1. Production database (same forever)

- Use **MySQL** or **PostgreSQL** on your host.
- In backend **`.env`** on the server, set **DB_CONNECTION**, **DB_HOST**, **DB_DATABASE**, **DB_USERNAME**, **DB_PASSWORD**.
- **Do not** change these between deploys. Every deploy must use the **same** database so:
  - Student registrations, users, courses, payments, etc. stay.
  - New deploys only **add** new rows (and new tables/columns via migrations).

See **docs/DEPLOYMENT_DATA_PERSISTENCE.md** for details.

---

## 2. Safe deploy steps (every time you push new features/fixes)

### Backend (Laravel on your server)

1. **Pull new code** (e.g. `git pull` or upload new files).
2. **Keep `.env` unchanged** (same DB_*, APP_URL, FRONTEND_URL, Stripe keys, etc.).
3. **Install dependencies** (if needed):
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
4. **Run only safe migrations** (adds new tables/columns, does not drop data):
   ```bash
   php artisan migrate --force
   ```
5. **Refresh caches** (optional, keeps config/routes up to date):
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```
6. Restart PHP/webserver if required by your host.

**Never run on production:**  
`migrate:fresh`, `migrate:fresh --seed`, `db:seed` (unless the seed is explicitly “add missing data only”).

### Frontend (Next.js, e.g. Vercel or your host)

1. Deploy new build (e.g. push to Git or trigger build).
2. Keep **NEXT_PUBLIC_API_URL** set to your **live API** (e.g. `https://api.acelabtutors.co.uk`).
3. No database or server commands needed; the site will use the same backend and DB.

### Order when you change the API

- If **backend API** changed (new/updated routes or responses): deploy **backend first**, then deploy **frontend**.
- That way the live site never talks to an old backend that’s missing new endpoints.

---

## 3. Migrations: keep them additive

So the site never crashes and data is never lost:

- **Prefer:** New migrations that **add** tables or **add** columns (with nullable or default).
- **Avoid:** Migrations that **drop** columns or tables used by the running app until the new code is live and you’re sure nothing uses them.
- **Never:** A migration that drops the whole database or runs `migrate:fresh` in production.

Laravel’s `migrate --force` only runs **pending** migrations; it does not re-run or wipe existing tables if you don’t use `fresh`.

---

## 4. Optional: quick “safe deploy” script (backend)

You can run this on the server after pulling new code (e.g. `bash deploy-safe.sh`). It runs only **safe** commands and does **not** wipe data.

```bash
#!/bin/bash
# deploy-safe.sh - Run from backend project root on production.
# Keeps live site and database safe; only adds new code and migrations.

set -e
echo "Running safe deploy steps..."

composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache

echo "Safe deploy done. Restart PHP/webserver if your host requires it."
```

Save as **backend/deploy-safe.sh**, then:

```bash
chmod +x deploy-safe.sh
./deploy-safe.sh
```

---

## 5. If something goes wrong

- **Site errors after deploy:** Check backend `.env` (DB_*, APP_URL, FRONTEND_URL) and that `migrate --force` ran. Fix env or run migrations, then clear config cache: `php artisan config:clear`.
- **Data missing:** Only happens if you ran `migrate:fresh` or pointed to a different database. Restore from backup if you have one; otherwise avoid those commands and always use the same DB.
- **Frontend can’t reach API:** Ensure **NEXT_PUBLIC_API_URL** on the frontend points to the live backend URL and that the backend is up.

---

## Summary

- **One live database** for all deploys; never replace it.
- **Only** run **`php artisan migrate --force`** (and optional cache commands) on production.
- **Never** run **migrate:fresh** or destructive seeds on production.
- Deploy **backend first** when the API changed, then frontend.
- Keep migrations **additive** so new features and fixes add new data and new structure without dropping existing data.

Following this, you can continuously deploy new features and fixes while the website stays up and the live database keeps saving and adding data.
