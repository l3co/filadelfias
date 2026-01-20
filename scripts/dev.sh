#!/bin/bash
# Development environment script

set -e

echo "🚀 Starting Filadelfias Development Environment"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "📦 Starting services with Docker Compose..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📍 Services:"
echo "   - API:          http://localhost:8000"
echo "   - API Docs:     http://localhost:8000/docs"
echo "   - Web App:      http://localhost:5173"
echo "   - Firebase UI:  http://localhost:4000"
echo "   - Firestore:    localhost:8080"
echo ""
echo "📝 Useful commands:"
echo "   docker compose logs -f api      # View API logs"
echo "   docker compose logs -f firebase # View Firebase logs"
echo "   docker compose down             # Stop all services"
echo ""
