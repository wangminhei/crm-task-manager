#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker first."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is not available. Install/enable docker compose plugin."
  exit 1
fi

if [ ! -f ".env.production" ]; then
  cat > .env.production <<'EOF'
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me_db_password
POSTGRES_DB=nhat_ky_cong_viec

JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES=7d

FRONTEND_URL=http://YOUR_SERVER_IP:3000
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001

BACKEND_PORT=3001
FRONTEND_PORT=3000
EOF
  echo "Created .env.production. Please edit it, then run: bash deploy.sh"
  exit 1
fi

set -a
source .env.production
set +a

if [ "${JWT_SECRET}" = "change_me_to_a_long_random_secret" ] || [ "${POSTGRES_PASSWORD}" = "change_me_db_password" ]; then
  echo "Please update JWT_SECRET and POSTGRES_PASSWORD in .env.production first."
  exit 1
fi

docker compose --env-file .env.production down
docker compose --env-file .env.production up -d --build

echo "Deploy done."
echo "Frontend: http://$(hostname -I | awk '{print $1}'):${FRONTEND_PORT}"
echo "Backend : http://$(hostname -I | awk '{print $1}'):${BACKEND_PORT}"
echo "Containers are configured with restart: unless-stopped (auto start after reboot)."
