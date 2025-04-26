#!/bin/bash

# Exit on error
set -e

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./backups/trippz_backup_20250426_123456.sql.gz"
  exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Decompress backup if it's compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup file..."
  gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
  BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Stop the application
echo "Stopping the application..."
docker-compose down

# Start only the database
echo "Starting the database..."
docker-compose up -d postgres

# Wait for the database to be ready
echo "Waiting for the database to be ready..."
sleep 10

# Restore the database
echo "Restoring the database..."
cat "$BACKUP_FILE" | docker-compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB

# Start the application
echo "Starting the application..."
docker-compose up -d

echo "Restore completed successfully!"
