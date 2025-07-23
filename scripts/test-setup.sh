#!/bin/bash

# Test setup script for CI/CD pipeline
set -e

echo "Setting up test environment..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "PostgreSQL is not running. Please start PostgreSQL service."
    exit 1
fi

# Create test database if it doesn't exist
createdb test_motorhome_blog 2>/dev/null || echo "Test database already exists"

# Set test environment variables
export NODE_ENV=test
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_motorhome_blog"

# Run database migrations for test environment
echo "Running database migrations..."
npm run db:push

echo "Test environment setup complete!"

# Run the tests
echo "Running test suite..."
npm test

echo "All tests completed!"