# Doodhly Database Backup & Restoration

## Overview
Automated daily MySQL backups with 30-day retention and compression.

## Setup

### 1. Make Script Executable
```bash
chmod +x backend/scripts/backup-mysql.sh
```

### 2. Configure Environment Variables
Add to `.env`:
```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
```

### 3. Create Backup Directory
```bash
sudo mkdir -p /var/backups/doodhly
sudo chown $(whoami):$(whoami) /var/backups/doodhly
```

### 4. Schedule Cron Job (Daily 2 AM)
```bash
crontab -e
```

Add line:
```cron
0 2 * * * /path/to/doodhly/backend/scripts/backup-mysql.sh >> /var/log/doodhly-backup.log 2>&1
```

### 5. Test Backup Manually
```bash
./backend/scripts/backup-mysql.sh
```

---

##Restoration Procedure

### Restore from Backup
```bash
# 1. Decompress backup
gunzip /var/backups/doodhly/doodhly_20260217_020000.sql.gz

# 2. Restore database
mysql -u root -p doodhly < /var/backups/doodhly/doodhly_20260217_020000.sql

# 3. Verify restoration
mysql -u root -p -e "USE doodhly; SHOW TABLES;"
```

### Verify Backup Integrity
```bash
# Check backup file
zcat /var/backups/doodhly/doodhly_20260217_020000.sql.gz | head -50

# List all backups
ls -lh /var/backups/doodhly/
```

---

## Backup Strategy

| Feature | Configuration |
|---------|---------------|
| **Schedule** | Daily at 2:00 AM |
| **Retention** | 30 days (automatic cleanup) |
| **Compression** | gzip (saves ~70% space) |
| **Type** | Full database dump |
| **Options** | `--single-transaction` (no table locks) |

---

## Production Enhancements (Future)

### Cloud Upload (S3)
Uncomment in script:
```bash
aws s3 cp "${BACKUP_FILE}.gz" "s3://doodhly-backups/"
```

Requires:
```bash
pip install awscli
aws configure
```

### Monitoring
Add to cron job:
```bash
0 2 * * * /path/to/backup-mysql.sh && curl -fsS --retry 3 https://hc-ping.com/your-healthcheck-id
```

### Encrypted Backups
```bash
gzip "${BACKUP_FILE}" | openssl enc -aes-256-cbc -salt -out "${BACKUP_FILE}.gz.enc" -pass file:/etc/doodhly/backup.key
```

---

## Troubleshooting

### Permission Denied
```bash
sudo chown -R $(whoami):$(whoami) /var/backups/doodhly
```

### Cron Not Running
```bash
# Check cron service
sudo systemctl status cron

# View cron logs
grep CRON /var/log/syslog

# Test script manually
bash -x ./backend/scripts/backup-mysql.sh
```

### Backup Size Too Large
```bash
# Exclude specific tables (e.g., logs)
mysqldump --ignore-table=doodhly.logs ...
```

---

## Quick Reference

```bash
# Manual backup
./backend/scripts/backup-mysql.sh

# List backups
ls -lh /var/backups/doodhly/

# Restore latest
LATEST=$(ls -t /var/backups/doodhly/*.sql.gz | head -1)
gunzip -c "$LATEST" | mysql -u root -p doodhly

# Check backup age
find /var/backups/doodhly -mtime -1  # Last 24 hours
```
