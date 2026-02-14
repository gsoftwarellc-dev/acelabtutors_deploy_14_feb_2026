# Upload Necessary Files and Update Database (Hostinger)

You already have the site live. This guide tells you **what to upload** and **what to run** so new code and database structure go live without losing data.

**Important:** No one can access your Hostinger or GitHub from here. You (or your team) run these steps. Prefer **GitHub** for code and **SSH** for running commands.

---

## Which access to use

| Method | Use for | Why |
|--------|--------|-----|
| **GitHub** | Pushing code from your PC, then pulling on the server (or Hostinger’s Git deploy) | Same code everywhere, easy to repeat, no manual file pick. |
| **SSH** | Running commands on the server after code is there: `migrate --force`, `deploy-safe.sh` | Required to update database structure and caches. |
| **FTP / File Manager** | Uploading code if you don’t use Git on the server | Works, but easy to forget files or overwrite `.env`. |

**Recommended:** Use **GitHub** to get code onto the server (push from your machine, pull on Hostinger or use their Git deployment). Then use **SSH** to run the backend deploy script or migrate. Don’t overwrite `.env` on the server.

---

## Database: you don’t upload it

- Your **live database** stays on Hostinger. You do **not** upload a database file or replace it with a local dump (that would overwrite live data).
- You only **update the structure** (new tables/columns) by running Laravel migrations **on the server** after uploading new backend code:
  ```bash
  php artisan migrate --force
  ```
- So: upload **code** (backend + frontend); run **migrate** (and deploy script) on the server. No “upload database” step.

---

## 1. Backend (api.acelabtutors.co.uk) – what to upload

Upload or deploy **all Laravel backend files** **except**:

- Do **not** upload a new `.env` from your PC (server already has its own with live DB and URLs). If you upload files, **skip** `.env` or the live site will break.
- You can skip (optional): `node_modules`, `.git` (if you use FTP and don’t need Git on server), and any local SQLite file like `database/database.sqlite` if you use MySQL on production.

**Typical backend layout to have on the server:**

- `app/`
- `bootstrap/`
- `config/`
- `database/` (migrations, seeders – **no** `.sqlite` if you use MySQL)
- `public/`
- `resources/`
- `routes/`
- `storage/` (writable; create if missing)
- `vendor/` (or run `composer install` on server)
- `.env` (only the one **already on the server** – never overwrite with local)
- `composer.json`, `composer.lock`
- `artisan`
- `deploy-safe.sh` (optional but useful)

### Option A – Deploy backend via GitHub

1. Push your latest code to GitHub from your PC (e.g. `git push origin main`).
2. On the server (SSH), go to the backend folder and pull:
   ```bash
   cd /path/to/backend   # your Laravel root on Hostinger
   git pull origin main
   ```
3. **Do not** overwrite `.env`. If Hostinger doesn’t have Git, use Option B.

### Option B – Deploy backend via FTP / File Manager

1. From your PC, zip the backend folder **excluding** `.env` (and optionally `.git`, `node_modules`).
2. Upload and extract into the backend folder on Hostinger. Make sure you don’t replace the server’s `.env`.

### After code is on the server (both options)

In **SSH**, in the backend project root:

```bash
cd /path/to/backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

Or, if you uploaded `deploy-safe.sh`:

```bash
chmod +x deploy-safe.sh
./deploy-safe.sh
```

That updates the **database structure** (new tables/columns only) and caches. Live data stays.

---

## 2. Frontend (acelabtutors.co.uk) – what to upload

- If Hostinger builds from **source**: upload or push the **frontend app source** (e.g. your Next.js app) and set **NEXT_PUBLIC_API_URL=http://api.acelabtutors.co.uk** in the app’s environment. Let Hostinger run `npm install` and `npm run build` (or their Node.js flow).
- If you deploy a **pre-built** app: upload the **build output** (e.g. `.next` and required files, or the static export) and ensure the same env var is set for the live app.

Do **not** upload backend files or `.env` from the backend into the frontend.

---

## 3. Quick checklist

- [ ] Backend: latest code on server (Git pull or FTP), **without** overwriting server’s `.env`.
- [ ] Backend: run `composer install`, `php artisan migrate --force`, then config/route cache (or `./deploy-safe.sh`).
- [ ] Frontend: latest code or build deployed, with `NEXT_PUBLIC_API_URL=http://api.acelabtutors.co.uk`.
- [ ] No `migrate:fresh` or `db:seed` on the server (so you don’t lose data).

---

## Summary

- **Access:** Prefer **GitHub** for code, **SSH** for running migrate and deploy commands. No one can do the upload or run commands for you from here.
- **Files:** Upload backend (except server’s `.env`) and frontend (source or build as per Hostinger).
- **Database:** Don’t upload a DB file. Run **`php artisan migrate --force`** on the server so the live database only gets new structure and keeps all data.

For the full Hostinger flow, see **docs/DEPLOY_HOSTINGER.md**.
