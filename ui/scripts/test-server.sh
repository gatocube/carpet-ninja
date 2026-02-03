#!/bin/bash
# Test server startup script for E2E testing with SQLite

set -e

# Clean up test database if CLEAN=true
if [ "$CLEAN" = "true" ]; then
    echo "🧹 Cleaning test database..."
    rm -f test.db test.db-shm test.db-wal 2>/dev/null || true
fi

# Kill any existing processes on the test port
TEST_PORT=${PORT:-3556}
lsof -ti :$TEST_PORT | xargs kill -9 2>/dev/null || true

# Export test environment variables
export PAYLOAD_TEST_MODE=true
export PORT=$TEST_PORT
export DATABASE_URL=file:./test.db
export PAYLOAD_SECRET=test-secret-for-e2e-testing-only

echo "🚀 Starting test server on port $TEST_PORT..."
echo "   PAYLOAD_TEST_MODE=$PAYLOAD_TEST_MODE"
echo "   DATABASE_URL=$DATABASE_URL"

# Start the Next.js dev server
exec npx next dev --port $TEST_PORT
