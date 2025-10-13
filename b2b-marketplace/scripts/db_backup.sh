#!/bin/sh
# Simple DB backup script for Docker/CI
# Usage: db_backup.sh --once --keep 7

set -e

KEEP=7
ONCE=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --keep)
      KEEP="$2"; shift 2;;
    --once)
      ONCE=1; shift;;
    *) shift;;
  esac
done

BACKUP_DIR="/backups/db"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="db_backup_${TIMESTAMP}.sql.gz"

# Environment variables expected: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
PGHOST=${PGHOST:-db}
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres}
PGDATABASE=${PGDATABASE:-marketplace}
PGPORT=${PGPORT:-5432}

export PGPASSWORD

# Run pg_dump
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" | gzip > "$BACKUP_DIR/$FILENAME"

# Cleanup older backups
ls -1t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | tail -n +$(expr $KEEP + 1) | xargs -r rm -f

echo "Backup created: $BACKUP_DIR/$FILENAME"

if [ "$ONCE" -eq 1 ]; then
  exit 0
fi

# For a simple cron-style loop (not used in docker-compose), sleep and repeat
while true; do
  sleep 86400
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  FILENAME="db_backup_${TIMESTAMP}.sql.gz"
  pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE" | gzip > "$BACKUP_DIR/$FILENAME"
  ls -1t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | tail -n +$(expr $KEEP + 1) | xargs -r rm -f
done
