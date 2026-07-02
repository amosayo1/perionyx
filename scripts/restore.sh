#!/usr/bin/env bash
set -euo pipefail

# Perionyx Database Restore Script
# Usage: ./scripts/restore.sh <backup-file>
#
# Restores a pg_dump backup created by backup.sh.
# WARNING: This will DROP and recreate the target database.
#
# Requires: psql (PostgreSQL client), DATABASE_URL env var

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file>"
  echo "Example: $0 ./backups/perionyx_20261201_000000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "WARNING: This will REPLACE the current database with the backup."
read -rp "Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Extract database name from DATABASE_URL
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
DB_URL_NO_DB=$(echo "$DATABASE_URL" | sed 's|/[^/]*\?|/postgres?|')

echo "Restoring from: $BACKUP_FILE"
echo "Target database: $DB_NAME"

# Terminate existing connections and drop then recreate
psql "$DB_URL_NO_DB" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true
psql "$DB_URL_NO_DB" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
psql "$DB_URL_NO_DB" -c "CREATE DATABASE \"$DB_NAME\";"

# Restore
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
else
  psql "$DATABASE_URL" < "$BACKUP_FILE"
fi

echo "Restore complete: $DB_NAME"
