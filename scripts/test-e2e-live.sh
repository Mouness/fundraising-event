#!/bin/bash
# Reset Database to known state
./scripts/reset-db.sh

# Export Env Vars
export E2E_USE_MOCKS=false
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="admin123"

echo "Running E2E tests in LIVE mode (No Mocks)..."
E2E_USE_MOCKS=false pnpm --filter @fundraising/e2e test "$@"
