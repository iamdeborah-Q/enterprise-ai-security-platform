// Enterprise configured
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { getDb } from './db/schema.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import healthRouter from './routes/health.js';
import { createTeamsRouter } from './routes/teams.js';
import { createStandupsRouter } from './routes/standups.js';
import { createMetricsRouter } from './routes/metrics.js';
import { createAlertsRouter } from './routes/alerts.js';
import { DEFAULT_PORT } from '@teampulse/shared';

dotenv.config();

const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
const dbPath = process.env.DATABASE_PATH || './data/teampulse.db';

// Ensure data directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = getDb(dbPath);

export function createApp(database = db) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(logger);

  // Public routes
  app.use(healthRouter);

  // Protected API routes
  app.use('/api/teams', authMiddleware, createTeamsRouter(database));
  app.use('/api/standups', authMiddleware, createStandupsRouter(database));
  app.use('/api/metrics', authMiddleware, createMetricsRouter(database));
  app.use('/api/alerts', authMiddleware, createAlertsRouter(database));

  app.use(errorHandler);

  return app;
}

// Only start server when run directly (not imported for tests)
const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`TeamPulse API running on http://localhost:${port}`);
  });
}

export default app;
