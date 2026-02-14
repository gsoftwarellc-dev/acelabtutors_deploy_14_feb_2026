# Smooth Deploy on Hostinger (No Data Loss, No Errors)

Your live setup:
- **Frontend:** https://acelabtutors.co.uk (Hostinger Node.js)
- **Backend:** http://api.acelabtutors.co.uk (Hostinger Laravel/PHP)

Follow this so every deploy is smooth and you **don’t lose data** or hit errors.

**What to upload and how:** See **docs/UPLOAD_AND_DEPLOY.md** for which files to upload, GitHub vs SSH vs FTP, and why you don’t “upload” the database (you only run migrations on the server).

---

## Before every deploy (quick checklist)

- [ ] Backend **`.env`** on the server: **do not change** `DB_*`, `APP_URL`, `FRONTEND_URL`. Same database = data stays.
- [ ] **Never** run `php artisan migrate:fresh` or `db:seed` on production (they can wipe data).
- [ ] If you changed the **API** (new/updated backend routes): deploy **backend first**, then frontend.

---

## 1. Backend (Laravel – api.acelabtutors.co.uk)

Hostinger usually gives you **PHP + MySQL**. Use **one MySQL database** for the Laravel app and keep using it for every deploy.

### 1.1 One-time setup (already done if the site works)

- In Hostinger: create **one MySQL database** and user. In the backend project on the server, set in **`.env`**:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://api.acelabtutors.co.uk

# Same database for every deploy – never change these between deploys
DB_CONNECTION=mysql
DB_HOST=...      # from Hostinger (e.g. localhost or mysql.hostinger.com)
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

# So Laravel knows the frontend URL (CORS, redirects)
FRONTEND_URL=https://acelabtutors.co.uk
```

- Run migrations once (if not already):  
  `php artisan migrate --force`

### 1.2 Every time you deploy new backend code

1. **Upload new code** (FTP/File Manager or Git pull in backend folder).
2. **Do not overwrite or change `.env`** (keep same DB and URLs).
3. In **SSH** (or Hostinger’s “Run script” / terminal), go to the **backend project root** and run:

   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```

   Or use the safe script (after `chmod +x deploy-safe.sh`):

   ```bash
   ./deploy-safe.sh
   ```

4. If Hostinger asks to “restart” PHP or the app, do that.

**Never run:** `migrate:fresh`, `migrate:fresh --seed`, or `db:seed` on this server (they wipe or replace data).

---

## 2. Frontend (Node.js – acelabtutors.co.uk)

You’re using Hostinger’s **Node.js** option for the frontend.

### 2.1 One-time setup (already done if the site works)

- Set **environment variable** for the live API (in Hostinger’s Node.js / app settings):

  ```env
  NEXT_PUBLIC_API_URL=http://api.acelabtutors.co.uk
  ```

  (If you later add **HTTPS** to api.acelabtutors.co.uk, change this to `https://api.acelabtutors.co.uk`.)

### 2.2 Every time you deploy new frontend code

1. Build and deploy the Node/Next.js app (Hostinger’s Node.js deploy flow – e.g. build then restart).
2. **Keep** `NEXT_PUBLIC_API_URL=http://api.acelabtutors.co.uk` (or https if you use SSL on API).
3. No database or PHP commands; the site will keep using the same backend and database.

---

## 3. Deploy order (avoids errors)

| What changed | Deploy order |
|--------------|--------------|
| **Backend only** (bug fix, new API, new migration) | Deploy **backend** (steps in §1.2), then optionally clear browser cache. |
| **Frontend only** (UI, text, frontend-only fix) | Deploy **frontend** only (§2.2). |
| **Both** (new feature using new API) | Deploy **backend first** (§1.2), then deploy **frontend** (§2.2). |

This way the live site never calls an API that doesn’t have the new routes yet.

---

## 4. Why you won’t lose data or get errors

- **One database:** Same `DB_*` in backend `.env` for every deploy → all data (registrations, users, courses, etc.) stays; new deploys only **add** new data and new tables/columns.
- **Safe migrations:** Only `php artisan migrate --force` (or the script). No `migrate:fresh` or destructive seeds → nothing is wiped.
- **Stable env:** `.env` not overwritten on deploy → no wrong DB or URLs, so no “connection” or “404” type errors from wrong config.
- **Deploy order:** Backend before frontend when API changed → no “endpoint not found” or crashes from version mismatch.

---

## 5. If something goes wrong

- **“Site can’t reach API” / CORS / 404**
  - Check `NEXT_PUBLIC_API_URL` is exactly `http://api.acelabtutors.co.uk` (or your HTTPS API URL).
  - Check backend `FRONTEND_URL=https://acelabtutors.co.uk` and that the backend is up (open http://api.acelabtutors.co.uk in browser; you should see something like `{"Laravel":"..."}`).
- **“500” or “DB error” on API**
  - Check backend `.env` `DB_*` (same database as before). Run `php artisan config:clear` then `php artisan config:cache` after any .env fix.
- **“Data missing”**
  - Only happens if someone ran `migrate:fresh` or pointed the app to a different database. Restore from Hostinger’s database backup if available; otherwise avoid those commands and always use the same DB.

---

## 6. One-page “smooth deploy” summary

1. **Backend:** Upload/pull code → **don’t touch `.env`** → run `./deploy-safe.sh` (or the 4 commands in §1.2).
2. **Frontend:** Build & deploy Node app → keep `NEXT_PUBLIC_API_URL=http://api.acelabtutors.co.uk`.
3. **If API changed:** Backend first, then frontend.
4. **Never:** `migrate:fresh` or `db:seed` on production; never change DB_* between deploys.

That’s it. You can deploy new features and fixes often; the site stays up and the live database keeps saving and adding data.

For more detail on safe migrations and data persistence, see **SAFE_CONTINUOUS_DEPLOYMENT.md** and **DEPLOYMENT_DATA_PERSISTENCE.md**.
