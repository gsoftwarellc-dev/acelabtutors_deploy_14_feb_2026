#!/bin/bash
# Safe deploy script for production backend.
# - Does NOT wipe data (no migrate:fresh, no destructive seed).
# - Run from backend project root after pulling new code.
# See docs/SAFE_CONTINUOUS_DEPLOYMENT.md

set -e
echo "[deploy-safe] Starting safe deploy steps..."

composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache

echo "[deploy-safe] Done. Restart PHP/webserver if your host requires it."
