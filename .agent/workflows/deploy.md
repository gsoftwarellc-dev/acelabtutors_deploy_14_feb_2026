---
description: Deploy local changes to Hostinger production server (acelabtutors.co.uk)
---

# Deploy to Hostinger Production

## Prerequisites
- Local code is tested and working in the browser
- SSH credentials: host `45.93.101.65`, port `65002`, user `u977979652`
- Server paths:
  - Backend: `domains/api.acelabtutors.co.uk/public_html/`
  - Frontend: `domains/acelabtutors.co.uk/public_html/`

## Step 1: Commit and push to GitHub
// turbo
```bash
cd /Users/riyadulislamriyadh/Desktop/acelabtutors && git add -A && git status
```
Then commit with a descriptive message:
```bash
git commit -m "description of changes" && git push origin main
```

## Step 2: Deploy Backend (if backend changed)
// turbo
```bash
cd /Users/riyadulislamriyadh/Desktop/acelabtutors && ./deploy_backend_upload.exp
```
This script:
1. Rsyncs `backend/` files to `domains/api.acelabtutors.co.uk/public_html/` (excluding `.env`, `vendor/`, `storage/`)
2. Runs `composer install --no-dev` on server
3. Runs `php artisan migrate --force`
4. Clears config/route/view caches
5. Fixes storage permissions

## Step 3: Deploy Frontend (if frontend changed)
Build locally first:
// turbo
```bash
cd /Users/riyadulislamriyadh/Desktop/acelabtutors/frontend && NEXT_PUBLIC_API_URL=https://api.acelabtutors.co.uk npm run build
```
Package and upload:
// turbo
```bash
cd /Users/riyadulislamriyadh/Desktop/acelabtutors && cp -R frontend/public frontend/.next/standalone/public && cp -R frontend/.next/static frontend/.next/standalone/.next/static && rm -f frontend/.next/standalone/.env && tar -czf deploy.tar.gz -C frontend/.next/standalone . && ./deploy_upload.exp
```
This script:
1. Uploads `deploy.tar.gz` via scp
2. Extracts on server at `domains/acelabtutors.co.uk/public_html/`
3. Restarts the Node.js app

## Step 4: Verify
// turbo
```bash
cd /Users/riyadulislamriyadh/Desktop/acelabtutors && ./verify_all.exp
```
Or manually check:
- Frontend: https://acelabtutors.co.uk
- Backend API: https://api.acelabtutors.co.uk

## Quick Reference: What changed → What to deploy

| What you changed | Deploy Step |
|---|---|
| Only backend PHP files | Step 2 only |
| Only frontend React/Next.js files | Step 3 only |
| Both backend and frontend | Step 2, then Step 3 |
| Database migrations (new tables/columns) | Step 2 (handles migrations automatically) |
| New data needed in production DB | Use `export_data.py` + `import_data.exp` |

## Important Notes
- **Never edit files directly on the server** — always change locally, test, then deploy
- **The `.env` on the server is separate** — rsync excludes it so production credentials are preserved
- **Database**: Production uses MySQL, local uses SQLite. Schema migrations work on both, but data must be exported/imported separately
- **CORS**: If you add a new frontend domain, update `backend/config/cors.php`
