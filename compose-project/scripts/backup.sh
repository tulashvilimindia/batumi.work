#!/bin/sh
set -e

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="/backups/daily/jobboard_${TIMESTAMP}.sql.gz"
LATEST_LINK="/backups/latest.sql.gz"

echo "[$(date)] Starting backup..."

# Create directories if not exist
mkdir -p /backups/daily /backups/weekly /backups/manual

# Full database dump with compression
pg_dump -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --verbose \
  2>/backups/backup.log | gzip > "$BACKUP_FILE"

# Verify backup
if [ -s "$BACKUP_FILE" ]; then
  echo "[$(date)] Backup completed: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

  # Update latest symlink
  ln -sf "$BACKUP_FILE" "$LATEST_LINK"

  # Weekly backup (every Sunday)
  if [ "$(date +%u)" = "7" ]; then
    WEEK_NUM=$(date +%V)
    YEAR=$(date +%Y)
    cp "$BACKUP_FILE" "/backups/weekly/jobboard_week_${WEEK_NUM}_${YEAR}.sql.gz"
    echo "[$(date)] Weekly backup created"
  fi

  # Cleanup old daily backups
  find /backups/daily -name "*.sql.gz" -mtime +${BACKUP_RETENTION_DAYS:-7} -delete
  echo "[$(date)] Cleaned up backups older than ${BACKUP_RETENTION_DAYS:-7} days"

  # Cleanup old weekly backups (keep 4 weeks)
  find /backups/weekly -name "*.sql.gz" -mtime +28 -delete

else
  echo "[$(date)] ERROR: Backup failed or empty!"
  exit 1
fi
