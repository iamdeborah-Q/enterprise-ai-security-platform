#!/usr/bin/env bash
set -euo pipefail

echo "Setting up TeamPulse..."

# Copy env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run migrations
echo "Running database migrations..."
npm run db:migrate

# Seed database
echo "Seeding database..."
npm run db:seed

echo ""
echo "Setup complete! Run 'npm run dev' to start the development server."
