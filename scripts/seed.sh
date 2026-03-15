#!/usr/bin/env bash
set -euo pipefail

echo "Seeding TeamPulse database..."
npm run db:seed
echo "Done!"
