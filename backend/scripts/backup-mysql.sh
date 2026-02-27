#!/bin/bash

# Doodhly MySQL Backup Script
# Runs daily at 2 AM via cron job
# Retention: 30 days

# Configuration
DB_NAME="doodhly"
DB_USER="${MYSQL_USER:-root}"
DB_PASS="${MYSQL_PASSWORD:-root}"
DB_HOST="${MYSQL_HOST:-localhost}"
BACKUP_DIR="/var/backups/doodhly"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/doodhly_${DATE}.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "=== Doodhly Backup Started: $(date) ==="

# Perform MySQL dump
echo "Dumping database: ${DB_NAME}"
mysqldump -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" \
    --single-transaction \
    --routines \
    --triggers \
    --databases "${DB_NAME}" \
    > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "✓ Database dump successful"
    
    # Compress the backup
    echo "Compressing backup..."
    gzip "${BACKUP_FILE}"
    
    if [ $? -eq 0 ]; then
        echo "✓ Backup compressed: ${BACKUP_FILE}.gz"
        
        # Calculate backup size
        SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        echo "Backup size: ${SIZE}"
        
        # Optional: Upload to cloud storage (uncomment when configured)
        # echo "Uploading to cloud storage..."
        # aws s3 cp "${BACKUP_FILE}.gz" "s3://doodhly-backups/" || echo "⚠️  Cloud upload failed"
        
        # Clean up old backups (older than RETENTION_DAYS)
        echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
        find "${BACKUP_DIR}" -name "doodhly_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -exec rm {} \;
        
        REMAINING=$(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l)
        echo "Backups retained: ${REMAINING}"
        
        echo "=== Backup Complete: $(date) ==="
        exit 0
    else
        echo "✗ Compression failed"
        exit 1
    fi
else
    echo "✗ Database dump failed"
    exit 1
fi
