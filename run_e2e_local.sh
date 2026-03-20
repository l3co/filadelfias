#!/bin/bash
set -e

# ============================================================================
# E2E Tests - Simple approach:
# 1. Start infrastructure (if not running)
# 2. Run tests locally with Playwright
# 3. Keep infrastructure running for fast re-runs
# ============================================================================

cd "$(dirname "$0")"

API_BASE_URL="${E2E_API_URL:-http://127.0.0.1:8010}"

health_check() {
    curl -fsS "$API_BASE_URL/health" > /dev/null 2>&1
}

auth_fixture_check() {
    local response
    response=$(curl -fsS -X POST "$API_BASE_URL/auth/login" \
        -H 'Content-Type: application/x-www-form-urlencoded' \
        --data 'username=admin@igreja.com&password=MinhaS3nh@Segura' 2>/dev/null || true)

    echo "$response" | grep -q 'access_token'
}

ensure_backend() {
    if health_check; then
        echo "✅ Backend infrastructure already running"
        return
    fi

    echo "🚀 Starting backend infrastructure..."
    docker compose -f docker-compose.test.yml up -d --build --wait postgres-test backend-test
    echo "✅ Backend infrastructure ready"
}

ensure_seed_data() {
    if auth_fixture_check; then
        echo "✅ E2E seed data already available"
        return
    fi

    echo "🌱 Seeding E2E auth fixtures..."
    docker compose -f docker-compose.test.yml exec -T backend-test poetry run python src/scripts/seed_e2e_data.py
    echo "✅ E2E seed data ready"
}

ensure_backend
ensure_seed_data

export VITE_API_URL="$API_BASE_URL"

echo ""
echo "🧪 Running E2E tests..."
echo "════════════════════════════════════════════════════════════"

cd apps/web

# Generate BDD files and run tests
npx bddgen
npx playwright test --config=playwright.config.ts "$@"
