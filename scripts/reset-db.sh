#!/bin/bash
set -e

echo "Recycling Database..."
pnpm --filter api db:seed:islamic
echo "Database Reset Complete."
