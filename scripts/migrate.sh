#!/bin/bash
# =============================================================================
# PollsIA - Database Migration Script
# =============================================================================

set -e

# Configuration
MIGRATIONS_DIR="./migrations"
BACKUP_DIR="/backups/pollsia"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required environment variables are set
check_env() {
    if [[ -z "$DATABASE_URL" ]]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
}

# Create backup before migration
create_backup() {
    log_step "Creating backup before migration..."
    
    if [[ -f "./scripts/backup.sh" ]]; then
        ./scripts/backup.sh
    else
        log_warn "Backup script not found, skipping backup"
    fi
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."
    
    if [[ -d "$MIGRATIONS_DIR" ]]; then
        log_info "Found migrations directory: $MIGRATIONS_DIR"
        
        # Count migration files
        MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.sql" | wc -l)
        log_info "Found $MIGRATION_COUNT migration files"
        
        if [[ $MIGRATION_COUNT -gt 0 ]]; then
            # Run each migration file in order
            for migration_file in $(find "$MIGRATIONS_DIR" -name "*.sql" | sort); do
                log_info "Running migration: $(basename $migration_file)"
                
                # Execute migration
                psql "$DATABASE_URL" -f "$migration_file"
                
                if [[ $? -eq 0 ]]; then
                    log_info "Migration completed: $(basename $migration_file)"
                else
                    log_error "Migration failed: $(basename $migration_file)"
                    exit 1
                fi
            done
        else
            log_info "No migration files found"
        fi
    else
        log_warn "Migrations directory not found: $MIGRATIONS_DIR"
        log_info "Creating migrations directory..."
        mkdir -p "$MIGRATIONS_DIR"
    fi
}

# Verify database connection
verify_connection() {
    log_step "Verifying database connection..."
    
    psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1
    
    if [[ $? -eq 0 ]]; then
        log_info "Database connection verified"
    else
        log_error "Failed to connect to database"
        exit 1
    fi
}

# Create initial schema if needed
create_initial_schema() {
    log_step "Checking if initial schema exists..."
    
    # Check if any tables exist
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    
    if [[ $TABLE_COUNT -eq 0 ]]; then
        log_info "No tables found, creating initial schema..."
        
        # Create initial schema
        psql "$DATABASE_URL" << EOF
-- Create initial schema for PollsIA
CREATE TABLE IF NOT EXISTS pools (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    token_a VARCHAR(255) NOT NULL,
    token_b VARCHAR(255) NOT NULL,
    liquidity DECIMAL(20, 8) DEFAULT 0,
    volume_24h DECIMAL(20, 8) DEFAULT 0,
    apy DECIMAL(8, 4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_positions (
    id SERIAL PRIMARY KEY,
    user_wallet VARCHAR(255) NOT NULL,
    pool_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pool_address) REFERENCES pools(address)
);

CREATE INDEX IF NOT EXISTS idx_pools_address ON pools(address);
CREATE INDEX IF NOT EXISTS idx_user_positions_wallet ON user_positions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_positions_pool ON user_positions(pool_address);
EOF
        
        if [[ $? -eq 0 ]]; then
            log_info "Initial schema created successfully"
        else
            log_error "Failed to create initial schema"
            exit 1
        fi
    else
        log_info "Database schema already exists ($TABLE_COUNT tables found)"
    fi
}

# Main execution
main() {
    log_info "Starting PollsIA database migration process..."
    
    check_env
    verify_connection
    create_backup
    create_initial_schema
    run_migrations
    
    log_info "Migration process completed successfully"
}

# Run main function
main "$@"