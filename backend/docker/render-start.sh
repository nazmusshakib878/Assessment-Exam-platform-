#!/bin/sh
set -eu

# Render supplies PORT at runtime. Keep 10000 as a useful Docker default.
: "${PORT:=10000}"

if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY must be configured in the Render service environment." >&2
    exit 1
fi

php artisan optimize:clear
php artisan migrate --force

# Seeding production data is opt-in so deployments never overwrite live data.
if [ "${RUN_DB_SEED:-false}" = "true" ]; then
    php artisan db:seed --force
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php artisan serve --host=0.0.0.0 --port="$PORT"
