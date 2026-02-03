#!/bin/bash
# Development server startup script

set -e

# Get a free port starting from 3444
PORT=${PORT:-3445}

# Kill any existing processes on the port
lsof -ti :$PORT | xargs kill -9 2>/dev/null || true

echo "🚀 Starting dev server on port $PORT..."

# Use SQLite for local development if no DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    export PAYLOAD_TEST_MODE=true
    export DATABASE_URL=file:./dev.db
    echo "   Using SQLite (dev.db) - set DATABASE_URL for Postgres"
fi

exec npx next dev --port $PORT
