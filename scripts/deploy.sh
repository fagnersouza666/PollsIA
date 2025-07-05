#!/bin/bash
# =============================================================================
# PollsIA - Production Deployment Script
# =============================================================================

set -e

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
}

# Check if environment file exists
check_env_file() {
    if [[ ! -f ".env.production" ]]; then
        log_error "Production environment file not found: .env.production"
        log_info "Please create .env.production with required variables"
        exit 1
    fi
    
    log_info "Loading environment from .env.production"
    source .env.production
}

# Create backup before deployment
create_backup() {
    log_step "Creating backup before deployment..."
    
    if [[ -f "./scripts/backup.sh" ]]; then
        ./scripts/backup.sh
        log_info "Backup created successfully"
    else
        log_warn "Backup script not found, skipping backup"
    fi
}

# Pull latest images
pull_images() {
    log_step "Pulling latest Docker images..."
    
    docker-compose -f $COMPOSE_FILE pull
    
    if [[ $? -eq 0 ]]; then
        log_info "Images pulled successfully"
    else
        log_error "Failed to pull images"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."
    
    if [[ -f "./scripts/migrate.sh" ]]; then
        ./scripts/migrate.sh
        log_info "Migrations completed successfully"
    else
        log_warn "Migration script not found, skipping migrations"
    fi
}

# Deploy services with zero downtime
deploy_services() {
    log_step "Deploying services..."
    
    # Start services
    docker-compose -f $COMPOSE_FILE up -d --remove-orphans
    
    if [[ $? -eq 0 ]]; then
        log_info "Services deployed successfully"
    else
        log_error "Failed to deploy services"
        exit 1
    fi
}

# Health check
health_check() {
    log_step "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_info "Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend health
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        log_info "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
}

# Cleanup old images and containers
cleanup() {
    log_step "Cleaning up old images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_info "Cleanup completed"
}

# Show deployment status
show_status() {
    log_step "Deployment Status:"
    
    echo ""
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    
    log_info "Deployment completed successfully!"
    log_info "Application is available at: http://localhost"
    log_info "API health check: http://localhost/health"
    log_info "Frontend health check: http://localhost/api/health"
}

# Main execution
main() {
    log_info "Starting PollsIA production deployment..."
    
    check_root
    check_docker
    check_env_file
    create_backup
    pull_images
    run_migrations
    deploy_services
    health_check
    cleanup
    show_status
    
    log_info "Deployment process completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "backup")
        create_backup
        ;;
    "migrate")
        run_migrations
        ;;
    "deploy")
        deploy_services
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        show_status
        ;;
    *)
        main "$@"
        ;;
esac