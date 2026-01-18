# Database Backup & Restore Guide

This guide explains how to backup and restore the JobBoard PostgreSQL database.

## Backup Overview

JobBoard uses automated backups with the following schedule:

| Type | Schedule | Retention | Location |
|------|----------|-----------|----------|
| Daily | 3:00 AM | 7 days | `backups/daily/` |
| Weekly | Sunday 3:00 AM | 4 weeks | `backups/weekly/` |
| Manual | On-demand | Unlimited | `backups/manual/` |

## Starting the Backup Service

```bash
# Start with backup service
docker-compose --profile backup up -d

# Or start all services including backup
docker-compose --profile full up -d
```

## Backup File Format

Backups are compressed SQL dumps:
- Format: `jobboard_YYYY-MM-DD_HHMMSS.sql.gz`
- Compression: gzip
- Type: Plain SQL (pg_dump --format=plain)

## Manual Backup

### Option 1: Via API
```bash
# Trigger a manual backup
curl -X POST http://localhost/api/v1/admin/backups/trigger \
  -H "X-API-Key: YOUR_API_KEY"
```

### Option 2: Via Docker
```bash
# Connect to the backup container
docker exec -it jobboard-backup /backup.sh
```

### Option 3: Direct pg_dump
```bash
# From host machine
docker exec jobboard-db pg_dump -U postgres jobboard | gzip > backup.sql.gz
```

## Restore Procedures

### Quick Restore (Using Script)

```bash
# List available backups
docker exec jobboard-backup ls -la /backups/daily/

# Restore from a specific backup
docker exec -it jobboard-backup /restore.sh /backups/daily/jobboard_2026-01-19_030000.sql.gz
```

### Manual Restore Steps

1. **Stop the API and Worker** (optional but recommended):
   ```bash
   docker-compose stop api worker
   ```

2. **Connect to database container**:
   ```bash
   docker exec -it jobboard-db bash
   ```

3. **Drop and recreate database**:
   ```sql
   psql -U postgres -c "DROP DATABASE IF EXISTS jobboard;"
   psql -U postgres -c "CREATE DATABASE jobboard;"
   ```

4. **Restore from backup**:
   ```bash
   # If backup is on host
   gunzip -c backup.sql.gz | docker exec -i jobboard-db psql -U postgres -d jobboard

   # If backup is in container
   docker exec -it jobboard-db bash -c "gunzip -c /backups/daily/backup.sql.gz | psql -U postgres -d jobboard"
   ```

5. **Restart services**:
   ```bash
   docker-compose up -d
   ```

6. **Verify restore**:
   ```bash
   # Check job count
   docker exec jobboard-db psql -U postgres -d jobboard -c "SELECT COUNT(*) FROM jobs;"
   ```

## Disaster Recovery

### Full Recovery Steps

1. **Install prerequisites**:
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/jobboard.git
   cd jobboard/compose-project
   ```

2. **Copy backup file** to the server:
   ```bash
   scp backup.sql.gz user@server:/path/to/compose-project/backups/manual/
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start database only**:
   ```bash
   docker-compose up -d db
   ```

5. **Wait for database to be ready**:
   ```bash
   docker-compose exec db pg_isready -U postgres
   ```

6. **Restore backup**:
   ```bash
   docker exec -it jobboard-db bash -c "gunzip -c /backups/manual/backup.sql.gz | psql -U postgres -d jobboard"
   ```

7. **Start all services**:
   ```bash
   docker-compose up -d
   ```

## Monitoring Backups

### Via API
```bash
# Get backup status
curl http://localhost/api/v1/admin/backups/status \
  -H "X-API-Key: YOUR_API_KEY"

# List all backups
curl http://localhost/api/v1/admin/backups \
  -H "X-API-Key: YOUR_API_KEY"
```

### Via Logs
```bash
# Check backup logs
docker logs jobboard-backup

# Check cron output
docker exec jobboard-backup cat /backups/cron.log
```

## Troubleshooting

### Backup Failed
1. Check disk space: `df -h`
2. Check database connectivity: `docker exec jobboard-db pg_isready`
3. Review logs: `docker logs jobboard-backup`

### Restore Failed
1. Ensure database exists
2. Check for active connections
3. Verify backup file integrity: `gunzip -t backup.sql.gz`

### Common Issues

| Issue | Solution |
|-------|----------|
| "database is being accessed" | Stop API/Worker before restore |
| "out of disk space" | Clean old backups or expand storage |
| "permission denied" | Check file permissions on backup directory |
| "file not found" | Verify backup path and file exists |

## Backup Configuration

Environment variables in `.env`:

```bash
# Retention days for daily backups (default: 7)
BACKUP_RETENTION_DAYS=7

# Backup schedule (cron format, default: daily at 3 AM)
# Note: Configured in scripts/backup-crontab
```

## Security Notes

- Backups contain sensitive data - store securely
- Use encrypted storage for off-site backups
- Restrict access to backup files
- Regularly test restore procedures
- Consider encrypting backups at rest:
  ```bash
  # Encrypt backup
  gpg -c backup.sql.gz

  # Decrypt for restore
  gpg -d backup.sql.gz.gpg | gunzip | psql -U postgres -d jobboard
  ```
