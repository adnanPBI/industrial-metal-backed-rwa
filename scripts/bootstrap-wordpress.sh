#!/usr/bin/env sh
set -eu
python3 scripts/generate_site_data.py >/dev/null
if [ ! -f .env ]; then
  echo "Copy .env.example to .env and set development-only credentials first."
  exit 1
fi
set -a
. ./.env
set +a
docker compose up -d db wordpress mailpit
sleep 5
if ! docker compose run --rm wpcli core is-installed >/dev/null 2>&1; then
  docker compose run --rm wpcli core install --url="$WP_URL" --title="$WP_TITLE" --admin_user="$WP_ADMIN_USER" --admin_password="$WP_ADMIN_PASSWORD" --admin_email="$WP_ADMIN_EMAIL" --skip-email
fi
docker compose run --rm wpcli plugin activate reservechain-core
docker compose run --rm wpcli theme activate reservechain
docker compose run --rm wpcli rewrite structure '/%postname%/' --hard
echo "ReserveChain WordPress: $WP_URL"
echo "Development email inbox: http://localhost:${MAILPIT_UI_PORT:-8025}"
