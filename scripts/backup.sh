#!/usr/bin/env bash
set -euo pipefail

# Perionyx Database Backup Script
# Usage: ./scripts/backup.sh [output-dir]
#
# Creates a timestamped pg_dump with:
#   - Daily:  30-day retention
#   - Weekly: 12-week retention (every Sunday)
#   - Monthly: 12-month retention (1st of month)
#
# Requires: pg_dump (PostgreSQL client), DATABASE_URL env var

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DOW=$(date +%u)          # 1=Mon..7=Sun
DOM=$(date +%d)          # day of month (01-31)
FILENAME="perionyx_${TIMESTAMP}.sql.gz"

mkdir -p "$OUTPUT_DIR"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "Backup: ${OUTPUT_DIR}/${FILENAME}"
pg_dump "${DATABASE_URL}" --no-owner --no-acl | gzip > "${OUTPUT_DIR}/${FILENAME}"

# Daily retention: 30 days
find "$OUTPUT_DIR" -name "perionyx_*.sql.gz" -mtime +30 -delete

# Weekly retention (Sundays only): 12 weeks
if [ "$DOW" = "7" ]; then
  find "$OUTPUT_DIR" -name "perionyx_*.sql.gz" -mtime +84 -delete
fi

# Monthly retention (1st of month only): 12 months
if [ "$DOM" = "01" ]; then
  find "$OUTPUT_DIR" -name "perionyx_*.sql.gz" -mtime +365 -delete
fi

echo "Backup complete: ${OUTPUT_DIR}/${FILENAME}"
