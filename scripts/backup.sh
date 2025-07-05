#!/bin/bash
# =============================================================================
# PollsIA - Database Backup Script
# =============================================================================

set -e

# Configuration
BACKUP_DIR="/backups/pollsia"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="pollsia_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env() {
    if [[ -z "$DATABASE_URL" ]]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Perform database backup
backup_database() {
    log_info "Starting database backup..."
    
    # Extract database connection details from DATABASE_URL
    # Format: postgresql://username:password@hostname:port/database
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    # Set password for pg_dump
    export PGPASSWORD="$DB_PASS"
    
    # Perform backup
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --if-exists --create \
        --file "$BACKUP_DIR/$BACKUP_FILE"
    
    if [[ $? -eq 0 ]]; then
        log_info "Database backup completed successfully: $BACKUP_FILE"
        
        # Compress backup
        gzip "$BACKUP_DIR/$BACKUP_FILE"
        log_info "Backup compressed: ${BACKUP_FILE}.gz"
    else
        log_error "Database backup failed"
        exit 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -name "pollsia_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    if [[ $? -eq 0 ]]; then
        log_info "Old backups cleaned up successfully"
    else
        log_warn "Failed to clean up old backups"
    fi
}

# Main execution
main() {
    log_info "Starting PollsIA database backup process..."
    
    check_env
    create_backup_dir
    backup_database
    cleanup_old_backups
    
    log_info "Backup process completed successfully"
}

# Run main function
main "$@"