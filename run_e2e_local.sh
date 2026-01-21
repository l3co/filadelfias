#!/bin/bash
echo "🚀 Starting Local E2E Tests with Firestore Emulator..."

# Clean up any orphans
docker compose -f docker-compose.test.yml down --remove-orphans

# Build and Run
# Exit code from 'e2e' service will determine success/failure
docker compose -f docker-compose.test.yml up --build --exit-code-from e2e

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo "✅ Tests Passed!"
else
    echo "❌ Tests Failed!"
fi

# Cleanup
# docker compose -f docker-compose.test.yml down

exit $exit_code
