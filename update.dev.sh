#!/bin/bash
# ==============================================================================
# Development Update Script — Project Management System
# Usage:
#   ./update.dev.sh          — full update (git pull + rebuild + restart)
#   ./update.dev.sh backend  — backend only (rebuild + restart)
#   ./update.dev.sh db       — database only (rebuild + restart)
#   ./update.dev.sh db-reset — DB volume sil + sifirdan olustur
#   ./update.dev.sh logs     — backend loglarini takip et (Ctrl+C ile cik)
# ==============================================================================

set -e

COMPOSE="docker compose -f docker-compose.yml"
SERVICE=${1:-all}

DEV_BRANCH="${DEV_BRANCH:-master}"
DEPLOY_KEY="${DEPLOY_KEY:-$HOME/.ssh/project_deploy}"

echo "==> [$(date '+%Y-%m-%d %H:%M:%S')] Project Management DEV update — hedef: $SERVICE"

# ── Git pull (db-reset ve logs haric) ────────────────────────────────────────
if [[ "$SERVICE" != "db-reset" && "$SERVICE" != "logs" ]]; then
  echo "==> Git pull (branch: $DEV_BRANCH)..."
  GIT_SSH_COMMAND="ssh -i $DEPLOY_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
    git pull origin "$DEV_BRANCH"
fi

# ── Service-specific update ──────────────────────────────────────────────────
case "$SERVICE" in

  backend)
    echo "==> Backend image yeniden derleniyor..."
    $COMPOSE build --no-cache backend
    echo "==> Backend yeniden baslatiliyor..."
    $COMPOSE up -d --no-deps backend
    echo "==> Backend loglari (son 30 satir):"
    $COMPOSE logs --tail=30 backend
    ;;

  db)
    echo "==> DB image yeniden derleniyor..."
    $COMPOSE build --no-cache db
    echo "==> DB yeniden baslatiliyor..."
    $COMPOSE up -d --no-deps db
    echo "==> DB loglari (son 30 satir):"
    $COMPOSE logs --tail=30 db
    ;;

  db-reset)
    echo ""
    echo "!!! DIKKAT: Bu islem mevcut gelistirme veritabanindaki TUM verileri silecek !!!"
    echo ""
    read -p "Devam etmek istiyor musunuz? (evet/hayir): " confirm
    if [[ "$confirm" != "evet" ]]; then
      echo "==> Islem iptal edildi."
      exit 0
    fi

    PROJECT_NAME=$($COMPOSE config --format json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('name',''))" 2>/dev/null || echo "")
    if [[ -z "$PROJECT_NAME" ]]; then
      PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    fi

    echo "==> Backend ve DB durduruluyor..."
    $COMPOSE rm -sf backend db

    echo "==> DB volume'lari siliniyor..."
    DB_VOLUMES=(
      "${PROJECT_NAME}_db_data"
    )
    for vol in "${DB_VOLUMES[@]}"; do
      if docker volume inspect "$vol" > /dev/null 2>&1; then
        docker volume rm "$vol"
        echo "    Silindi: $vol"
      else
        echo "    Bulunamadi (atlaniyor): $vol"
      fi
    done

    echo "==> DB sifirdan baslatiliyor..."
    $COMPOSE build --no-cache db
    $COMPOSE up -d db

    echo "==> DB hazir olana kadar bekleniyor..."
    until $COMPOSE exec db pg_isready -U postgres > /dev/null 2>&1; do
      sleep 2
    done

    echo "==> Backend yeniden baslatiliyor..."
    $COMPOSE up -d backend

    echo "==> DB loglari:"
    $COMPOSE logs --tail=50 db
    ;;

  logs)
    echo "==> Backend loglari canli izleniyor (Ctrl+C ile cik)..."
    $COMPOSE logs -f backend
    ;;

  all|*)
    echo "==> Tum imajlar yeniden derleniyor..."
    $COMPOSE build --no-cache

    echo "==> Servisler yeniden baslatiliyor..."
    $COMPOSE up -d

    echo "==> Eski imajlar temizleniyor..."
    docker image prune -f

    echo "==> Servis durumu:"
    $COMPOSE ps

    echo "==> Backend loglari (son 50 satir):"
    $COMPOSE logs --tail=50 backend
    ;;

esac

echo "==> [$(date '+%Y-%m-%d %H:%M:%S')] Dev update tamamlandi."
