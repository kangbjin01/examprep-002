#!/bin/sh

# If pb_data volume is empty (first run), copy seed data
if [ ! -f /pb/pb_data/data.db ]; then
  echo "First run: seeding PocketBase data..."
  cp -r /pb/pb_data_seed/* /pb/pb_data/ 2>/dev/null || true
  echo "Seed complete."
fi

exec supervisord -c /etc/supervisord.conf
