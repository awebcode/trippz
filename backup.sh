#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Create backup directory
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Set backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="trippz_backup_$TIMESTAMP.sql"

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_DIR/$BACKUP_FILENAME"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILENAME"

# Create backup of environment variables
echo "Backing up environment variables..."
cp .env "$BACKUP_DIR/env_backup_$TIMESTAMP"

# Backup logs
echo "Backing up logs..."
tar -czf "$BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz" logs/

echo "Backup completed successfully!"
echo "Backup files:"
echo "- Database: $BACKUP_DIR/${BACKUP_FILENAME}.gz"
echo "- Environment: $BACKUP_DIR/env_backup_$TIMESTAMP"
echo "- Logs: $BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz"

# Optional: Remove backups older than 30 days
find $BACKUP_DIR -name "trippz_backup_*" -type f -mtime +30 -delete
find $BACKUP_DIR -name "env_backup_*" -type f -mtime +30 -delete
find $BACKUP_DIR -name "logs_backup_*" -type f -mtime +30 -delete
