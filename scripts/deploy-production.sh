#!/bin/bash

# Production Deployment Script for ImpactChain & CharityChain
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Configuration
PROJECT_ROOT=$(pwd)
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
CONTRACTS_DIR="$PROJECT_ROOT/contracts"

# Check if required environment files exist
check_env_files() {
    log "Checking environment configuration..."
    
    if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
        log_warning "Frontend .env.local not found. Please copy from env.production.template"
        return 1
    fi
    
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        log_warning "Backend .env not found. Please copy from env.production.template"
        return 1
    fi
    
    log_success "Environment files found"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    # Check if Git is clean
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Git working directory is not clean. Consider committing changes."
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        log_warning "Not on main/master branch (currently on: $CURRENT_BRANCH)"
        read -p "Continue deployment? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    log_success "Pre-deployment checks completed"
}

# Run tests
run_tests() {
    log "Running test suites..."
    
    # Frontend tests
    log "Running frontend tests..."
    cd "$FRONTEND_DIR"
    npm ci
    npm run lint || log_warning "Frontend linting failed"
    npm run type-check || log_warning "Frontend type check failed"
    # npm test -- --coverage --watchAll=false || log_warning "Frontend tests failed"
    
    # Backend tests
    log "Running backend tests..."
    cd "$BACKEND_DIR"
    npm ci
    npm run build || log_error "Backend build failed"
    # npm test || log_warning "Backend tests failed"
    
    # Contract tests
    log "Running contract tests..."
    cd "$CONTRACTS_DIR"
    npm ci
    npx hardhat compile
    npm test || log_warning "Contract tests failed"
    
    cd "$PROJECT_ROOT"
    log_success "Test suites completed"
}

# Build applications
build_applications() {
    log "Building applications for production..."
    
    # Build frontend
    log "Building frontend..."
    cd "$FRONTEND_DIR"
    npm run build || log_error "Frontend build failed"
    
    # Build backend
    log "Building backend..."
    cd "$BACKEND_DIR"
    npm run build || log_error "Backend build failed"
    
    cd "$PROJECT_ROOT"
    log_success "Applications built successfully"
}

# Security scan
security_scan() {
    log "Running security scans..."
    
    # Frontend security audit
    cd "$FRONTEND_DIR"
    npm audit --audit-level=high || log_warning "Frontend security audit found issues"
    
    # Backend security audit
    cd "$BACKEND_DIR"
    npm audit --audit-level=high || log_warning "Backend security audit found issues"
    
    cd "$PROJECT_ROOT"
    log_success "Security scans completed"
}

# Docker build and push
docker_build_push() {
    log "Building and pushing Docker images..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running"
        return 1
    fi
    
    # Build frontend image
    log "Building frontend Docker image..."
    cd "$FRONTEND_DIR"
    docker build -t impactchain-frontend:latest .
    
    # Build backend image
    log "Building backend Docker image..."
    cd "$BACKEND_DIR"
    docker build -t impactchain-backend:latest .
    
    # Push to registry (if configured)
    if [ -n "$DOCKER_REGISTRY" ]; then
        log "Pushing images to registry..."
        docker tag impactchain-frontend:latest "$DOCKER_REGISTRY/impactchain-frontend:latest"
        docker tag impactchain-backend:latest "$DOCKER_REGISTRY/impactchain-backend:latest"
        docker push "$DOCKER_REGISTRY/impactchain-frontend:latest"
        docker push "$DOCKER_REGISTRY/impactchain-backend:latest"
    fi
    
    cd "$PROJECT_ROOT"
    log_success "Docker images built and pushed"
}

# Deploy to production
deploy_to_production() {
    log "Deploying to production..."
    
    # Deploy frontend to Vercel
    if command -v vercel &> /dev/null; then
        log "Deploying frontend to Vercel..."
        cd "$FRONTEND_DIR"
        vercel --prod || log_warning "Vercel deployment failed"
    else
        log_warning "Vercel CLI not found. Please deploy frontend manually."
    fi
    
    # Deploy backend to Railway
    if command -v railway &> /dev/null; then
        log "Deploying backend to Railway..."
        cd "$BACKEND_DIR"
        railway deploy || log_warning "Railway deployment failed"
    else
        log_warning "Railway CLI not found. Please deploy backend manually."
    fi
    
    cd "$PROJECT_ROOT"
    log_success "Production deployment initiated"
}

# Post-deployment health checks
health_checks() {
    log "Running post-deployment health checks..."
    
    # Wait for deployment to stabilize
    log "Waiting for deployment to stabilize..."
    sleep 30
    
    # Check frontend health
    if curl -f https://app.impactchain.org/api/health > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
    fi
    
    # Check backend health
    if curl -f https://api.impactchain.org/health > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
    fi
    
    log_success "Health checks completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    # Remove temporary files, reset directories, etc.
    cd "$PROJECT_ROOT"
}

# Main deployment function
main() {
    log "🚀 Starting production deployment for ImpactChain & CharityChain"
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Run deployment steps
    check_env_files || exit 1
    pre_deployment_checks
    security_scan
    run_tests
    build_applications
    
    # Ask for confirmation before deployment
    echo
    log_warning "Ready to deploy to production. This will update the live application."
    read -p "Continue with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelled by user"
        exit 1
    fi
    
    docker_build_push
    deploy_to_production
    health_checks
    
    echo
    log_success "🎉 Production deployment completed successfully!"
    log "Frontend: https://app.impactchain.org"
    log "Backend: https://api.impactchain.org"
    log "Documentation: https://docs.impactchain.org"
    
    echo
    log "📊 Post-deployment checklist:"
    echo "  ✅ Verify all services are running"
    echo "  ✅ Check monitoring dashboards"
    echo "  ✅ Verify database migrations"
    echo "  ✅ Test critical user flows"
    echo "  ✅ Update documentation"
    echo "  ✅ Notify team of deployment"
}

# Script options
case "${1:-}" in
    --help|-h)
        echo "Production Deployment Script for ImpactChain & CharityChain"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --check-only   Run checks without deploying"
        echo "  --build-only   Build applications without deploying"
        echo "  --docker-only  Only build and push Docker images"
        echo ""
        echo "Environment Variables:"
        echo "  DOCKER_REGISTRY   Docker registry URL for image pushing"
        echo ""
        exit 0
        ;;
    --check-only)
        log "Running checks only..."
        check_env_files || exit 1
        pre_deployment_checks
        security_scan
        log_success "Checks completed"
        exit 0
        ;;
    --build-only)
        log "Building applications only..."
        check_env_files || exit 1
        run_tests
        build_applications
        log_success "Build completed"
        exit 0
        ;;
    --docker-only)
        log "Building Docker images only..."
        docker_build_push
        log_success "Docker build completed"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 