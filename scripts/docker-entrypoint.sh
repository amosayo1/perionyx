#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database..."
  until pg_isready -d "$DATABASE_URL" -q 2>/dev/null; do
    sleep 2
  done
  echo "Database is ready."
fi

if [ -n "$REDIS_URL" ]; then
  REDIS_HOST=$(echo "$REDIS_URL" | sed -n 's/.*redis:\/\/\([^:]*\).*/\1/p')
  REDIS_PORT=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  if [ -z "$REDIS_HOST" ]; then REDIS_HOST="redis"; fi
  if [ -z "$REDIS_PORT" ]; then REDIS_PORT="6379"; fi
  echo "Waiting for Redis..."
  until redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null | grep -q PONG; do
    sleep 2
  done
  echo "Redis is ready."
fi

if [ "${SKIP_MIGRATIONS}" != "true" ] && [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy 2>/dev/null || echo "Migration skipped or not applicable."
  npx prisma generate 2>/dev/null || true
fi

echo "Starting Perionyx..."
exec "$@"
