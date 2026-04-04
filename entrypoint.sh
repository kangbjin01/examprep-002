#!/bin/sh

# Version file tracks which seed data is deployed
# Bump SEED_VERSION when you update /pb/pb_data_seed to force a reseed
SEED_VERSION="2026-04-05-v3"
VERSION_FILE="/pb/pb_data/.seed_version"

CURRENT_VERSION=""
if [ -f "$VERSION_FILE" ]; then
  CURRENT_VERSION=$(cat "$VERSION_FILE")
fi

if [ ! -f /pb/pb_data/data.db ]; then
  echo "First run: seeding PocketBase data (version $SEED_VERSION)..."
  cp -r /pb/pb_data_seed/* /pb/pb_data/ 2>/dev/null || true
  echo "$SEED_VERSION" > "$VERSION_FILE"
  echo "Seed complete."
elif [ "$CURRENT_VERSION" != "$SEED_VERSION" ]; then
  echo "Seed version mismatch: current='$CURRENT_VERSION', new='$SEED_VERSION'"
  echo "Backing up existing data and replacing with new seed..."
  BACKUP_DIR="/pb/pb_data_backup_$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  cp -r /pb/pb_data/* "$BACKUP_DIR/" 2>/dev/null || true
  echo "Backup saved to $BACKUP_DIR"

  # Remove old db files but preserve volume mount
  rm -f /pb/pb_data/data.db /pb/pb_data/data.db-shm /pb/pb_data/data.db-wal
  rm -f /pb/pb_data/auxiliary.db /pb/pb_data/auxiliary.db-shm /pb/pb_data/auxiliary.db-wal
  rm -rf /pb/pb_data/storage

  # Copy fresh seed data
  cp -r /pb/pb_data_seed/* /pb/pb_data/ 2>/dev/null || true
  echo "$SEED_VERSION" > "$VERSION_FILE"
  echo "Reseed complete."
else
  echo "Seed version matches ($SEED_VERSION). Keeping existing data."
fi

exec supervisord -c /etc/supervisord.conf
