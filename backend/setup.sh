#!/bin/bash

echo "🚀 Setting up ImpactChain Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Install turbo globally if not installed
if ! command -v turbo &> /dev/null; then
    echo "📦 Installing Turbo globally..."
    npm install -g turbo
fi

# Install all dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment variables if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << 'EOF'
# Node Environment
NODE_ENV=development

# Server Configuration
HOST=0.0.0.0
PORT=4000

# Database
DATABASE_URL="postgresql://impactchain:password@localhost:5432/impactchain_dev"

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -base64 32)
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# NATS Message Broker
NATS_URL=nats://localhost:4222

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Service URLs (for GraphQL Federation)
AUTH_SERVICE_URL=http://localhost:4001/graphql
DAO_SERVICE_URL=http://localhost:4002/graphql
FUNDING_SERVICE_URL=http://localhost:4003/graphql
HELPDESK_SERVICE_URL=http://localhost:4004/graphql
AUCTION_SERVICE_URL=http://localhost:4005/graphql
ML_SERVICE_URL=http://localhost:4006/graphql
NOTIFIER_SERVICE_URL=http://localhost:4007/graphql

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
POLYGON_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Smart Contract Addresses (fill after deployment)
GOVERNANCE_TOKEN_ADDRESS=
REPUTATION_BADGE_ADDRESS=

# External APIs
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
PINATA_JWT=your_pinata_jwt_token

# Monitoring & Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=impactchain-backend

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
EOF
    echo "✅ Created .env file with default values"
    echo "⚠️  IMPORTANT: Update JWT_SECRET and database credentials in .env file"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "⚠️  Docker is not running. Starting Docker services is recommended for databases."
    echo "   Run: docker-compose -f docker-compose.dev.yml up -d"
else
    echo "🐳 Starting Docker services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for databases to be ready
    echo "⏳ Waiting for databases to be ready..."
    sleep 10
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
cd packages/libs
npx prisma generate
cd ../..

# Run database migrations
echo "🗄️  Running database migrations..."
cd packages/libs
npx prisma migrate dev --name init --skip-seed
cd ../..

# Seed the database
echo "🌱 Seeding database..."
cd packages/libs
npx prisma db seed
cd ../..

# Build all packages
echo "🔨 Building packages..."
turbo build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   npm run dev"
echo ""
echo "📊 Services will be available at:"
echo "   - Gateway (GraphQL): http://localhost:4000/graphql"
echo "   - Auth Service: http://localhost:4001/graphql"  
echo "   - API Documentation: http://localhost:4000/docs"
echo ""
echo "🐳 Docker services:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - NATS: localhost:4222"
echo ""
echo "⚠️  Don't forget to update your .env file with real credentials!" 