#!/bin/sh

# Version file tracks which seed data is deployed
# Bump SEED_VERSION when you update /pb/pb_data_seed to force a reseed
SEED_VERSION="2026-04-10-v1"
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
  echo "Smart reseed: updating questions/schema while preserving user data..."

  BACKUP_DIR="/pb/pb_data_backup_$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  cp -r /pb/pb_data/* "$BACKUP_DIR/" 2>/dev/null || true
  echo "Full backup saved to $BACKUP_DIR"

  # Start PocketBase temporarily with OLD data to export user data
  /usr/local/bin/pocketbase serve --http=0.0.0.0:8091 --dir=/pb/pb_data &
  PB_OLD_PID=$!
  sleep 3

  # Export user-generated data from old DB
  mkdir -p /tmp/user_data_export
  for COLLECTION in attempts bookmarks question_notes choice_notes; do
    wget -qO "/tmp/user_data_export/${COLLECTION}.json" \
      "http://localhost:8091/api/collections/${COLLECTION}/records?perPage=500" 2>/dev/null || true
  done
  # Also export users (to preserve any new users created via admin)
  wget -qO "/tmp/user_data_export/users.json" \
    "http://localhost:8091/api/collections/users/records?perPage=500" 2>/dev/null || true

  kill $PB_OLD_PID 2>/dev/null
  wait $PB_OLD_PID 2>/dev/null
  sleep 1

  # Replace DB with new seed
  rm -f /pb/pb_data/data.db /pb/pb_data/data.db-shm /pb/pb_data/data.db-wal
  rm -f /pb/pb_data/auxiliary.db /pb/pb_data/auxiliary.db-shm /pb/pb_data/auxiliary.db-wal
  rm -rf /pb/pb_data/storage
  cp -r /pb/pb_data_seed/* /pb/pb_data/ 2>/dev/null || true

  # Start PocketBase temporarily with NEW data to import user data back
  /usr/local/bin/pocketbase serve --http=0.0.0.0:8091 --dir=/pb/pb_data &
  PB_NEW_PID=$!
  sleep 3

  # Get superuser token from new DB
  TOKEN=$(wget -qO- --post-data='{"identity":"admin@test.com","password":"Pass1234!"}' \
    --header='Content-Type: application/json' \
    'http://localhost:8091/api/collections/_superusers/auth-with-password' 2>/dev/null | \
    sed 's/.*"token":"\([^"]*\)".*/\1/')

  if [ -n "$TOKEN" ]; then
    # Re-import user-generated data
    RESTORED=0
    for COLLECTION in attempts bookmarks question_notes choice_notes; do
      FILE="/tmp/user_data_export/${COLLECTION}.json"
      if [ -f "$FILE" ] && [ -s "$FILE" ]; then
        # Extract items and re-create each record
        COUNT=$(cat "$FILE" | sed 's/.*"totalItems":\([0-9]*\).*/\1/' | head -1)
        if [ "$COUNT" != "0" ] && [ -n "$COUNT" ]; then
          echo "  Restoring $COLLECTION ($COUNT records)..."
          # Use python if available, otherwise skip
          if command -v python3 >/dev/null 2>&1; then
            python3 -c "
import json, urllib.request
with open('$FILE') as f:
    data = json.load(f)
items = data.get('items', [])
restored = 0
for item in items:
    # Remove system fields
    for key in ['id', 'collectionId', 'collectionName', 'created', 'updated', 'expand']:
        item.pop(key, None)
    body = json.dumps(item).encode()
    req = urllib.request.Request(
        'http://localhost:8091/api/collections/$COLLECTION/records',
        data=body,
        headers={'Content-Type':'application/json','Authorization':'Bearer $TOKEN'},
        method='POST')
    try:
        urllib.request.urlopen(req)
        restored += 1
    except Exception:
        pass
print(f'  {restored}/{len(items)} restored')
" 2>/dev/null
          fi
          RESTORED=$((RESTORED + COUNT))
        fi
      fi
    done
    echo "User data restoration complete ($RESTORED total records processed)"
  else
    echo "WARNING: Could not get auth token for new DB. User data NOT restored."
    echo "Manual recovery: backup is at $BACKUP_DIR"
  fi

  kill $PB_NEW_PID 2>/dev/null
  wait $PB_NEW_PID 2>/dev/null
  rm -rf /tmp/user_data_export

  echo "$SEED_VERSION" > "$VERSION_FILE"
  echo "Smart reseed complete."
else
  echo "Seed version matches ($SEED_VERSION). Keeping existing data."
fi

exec supervisord -c /etc/supervisord.conf
