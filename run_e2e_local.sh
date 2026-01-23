#!/bin/bash
set -e

# ============================================================================
# E2E Tests - Simple approach:
# 1. Start infrastructure (if not running)
# 2. Run tests locally with Playwright
# 3. Keep infrastructure running for fast re-runs
# ============================================================================

cd "$(dirname "$0")"

# Check if infrastructure is already running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Infrastructure already running"
else
    echo "🚀 Starting infrastructure..."
    docker compose -f docker-compose.test.yml up -d --build --wait
    echo "✅ Infrastructure ready"
fi

echo ""
echo "🧪 Running E2E tests..."
echo "════════════════════════════════════════════════════════════"

cd apps/web

# Generate BDD files and run tests
npx bddgen
npx playwright test --config=playwright.config.ts "$@"
