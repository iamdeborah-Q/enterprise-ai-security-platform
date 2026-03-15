# TeamPulse

Internal Team Health & Standup Tracking API with a React dashboard.

## Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode)
- **Backend:** Express 4.x
- **Database:** SQLite via better-sqlite3
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Testing:** Vitest + supertest
- **Package Manager:** npm workspaces (monorepo)

## Quick Start

```bash
# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development servers
npm run dev
```

The API runs on `http://localhost:3001` and the frontend on `http://localhost:5173`.

## Manual Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development servers
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and web dev servers |
| `npm run build` | Build all packages |
| `npm test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Lint and auto-fix |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |

## API Authentication

All `/api/*` routes require a Bearer token:

```
Authorization: Bearer tp_dev_secret_key_change_me
```

See [docs/api.md](docs/api.md) for full API documentation.

## Project Structure

```
teampulse/
├── packages/
│   ├── api/         # Express API server
│   ├── web/         # React frontend
│   └── shared/      # Shared types and constants
├── scripts/         # Setup and utility scripts
└── docs/            # API documentation
```
