# Keeping Data After Deploy (Student Registrations & All DB Data)

Student registration form data (free and paid) is stored in the **database**. To keep all submissions and other data when you deploy:

## 1. Use a persistent database in production

- **Do not** rely on SQLite or a database that gets recreated on each deploy.
- Use **MySQL** or **PostgreSQL** on your hosting (e.g. Hostinger MySQL, or a managed DB).
- On the **backend** server, set in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Use the **same** database and credentials for every deploy so data is never lost.

## 2. Run migrations on deploy (do not wipe data)

- After deploying backend code, run:
  ```bash
  php artisan migrate --force
  ```
- **Do not** run on production:
  - `php artisan migrate:fresh` (drops all tables and data)
  - `php artisan db:seed` (unless you have a safe seed that only adds missing data)

This ensures the `student_registrations` table (and others) exist and keeps existing data.

## 3. Point frontend to the production API

- On the **frontend** (e.g. Vercel or your host), set:
  ```env
  NEXT_PUBLIC_API_URL=https://api.acelabtutors.co.uk
  ```
  (or your real backend URL, no trailing slash)

Then both **free** and **paid** student registration forms will submit to this API and data will be stored in the same database.

## 4. Summary

| What | Action |
|------|--------|
| Database | Use one persistent MySQL/Postgres; set `DB_*` in backend `.env` |
| Migrations | Run `php artisan migrate --force` on deploy only |
| Frontend | Set `NEXT_PUBLIC_API_URL` to production API URL |
| Data | Student registrations and all other DB data will remain across deploys |

No code changes are required; the app is already built to persist registration data in the database. Keeping the same production database and running only `migrate --force` keeps the features you have now.

---

**Continuous deploys:** For a full guide on deploying new features and fixes without crashing the site or losing data, see **docs/SAFE_CONTINUOUS_DEPLOYMENT.md**. Use **backend/deploy-safe.sh** on the server to run only safe deploy steps.
