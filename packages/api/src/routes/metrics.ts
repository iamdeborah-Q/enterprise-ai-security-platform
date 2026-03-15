import { Router, Request, Response } from 'express';
import { MetricsService } from '../services/metricsService.js';
import Database from 'better-sqlite3';

export function createMetricsRouter(db: Database.Database): Router {
  const router = Router();
  const service = new MetricsService(db);

  router.get('/', (_req: Request, res: Response) => {
    const metrics = service.getAllMetrics();
    res.json(metrics);
  });

  router.get('/:teamId', (req: Request, res: Response) => {
    try {
      const metrics = service.getTeamMetrics(req.params.teamId);
      if (!metrics) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
      res.json(metrics);
    } catch (_err) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  router.get('/:teamId/history', (req: Request, res: Response) => {
    const history = service.getTeamHistory(req.params.teamId);
    res.json(history);
  });

  return router;
}
