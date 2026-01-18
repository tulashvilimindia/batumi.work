#!/bin/sh
# Database Restore Script for JobBoard
# Usage: ./restore.sh <backup_file.sql.gz>
# Example: ./restore.sh /backups/daily/jobboard_2026-01-19_030000.sql.gz

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    echo "  Daily:"
    ls -lh /backups/daily/*.sql.gz 2>/dev/null || echo "    (none)"
    echo "  Weekly:"
    ls -lh /backups/weekly/*.sql.gz 2>/dev/null || echo "    (none)"
    echo "  Manual:"
    ls -lh /backups/manual/*.sql.gz 2>/dev/null || echo "    (none)"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "========================================"
echo "  JobBoard Database Restore"
echo "========================================"
echo ""
echo "WARNING: This will OVERWRITE the current database!"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "File size:   $(du -h "$BACKUP_FILE" | cut -f1)"
echo "Target DB:   ${PGDATABASE:-jobboard}"
echo "Target Host: ${PGHOST:-db}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "[$(date)] Starting restore..."

# Drop all existing connections
echo "[$(date)] Terminating existing connections..."
psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d postgres -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '${PGDATABASE:-jobboard}'
    AND pid <> pg_backend_pid();
" 2>/dev/null || true

# Drop and recreate database
echo "[$(date)] Recreating database..."
psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d postgres -c "
    DROP DATABASE IF EXISTS ${PGDATABASE:-jobboard};
    CREATE DATABASE ${PGDATABASE:-jobboard};
"

# Restore from backup
echo "[$(date)] Restoring from backup..."
gunzip -c "$BACKUP_FILE" | psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-jobboard}" -q

# Verify restore
echo "[$(date)] Verifying restore..."
JOB_COUNT=$(psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-jobboard}" -t -c "SELECT COUNT(*) FROM jobs;" 2>/dev/null || echo "0")
CAT_COUNT=$(psql -h "${PGHOST:-db}" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-jobboard}" -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "0")

echo ""
echo "========================================"
echo "  Restore Complete!"
echo "========================================"
echo ""
echo "Database: ${PGDATABASE:-jobboard}"
echo "Jobs:     $JOB_COUNT"
echo "Categories: $CAT_COUNT"
echo ""
echo "[$(date)] Restore finished successfully!"
