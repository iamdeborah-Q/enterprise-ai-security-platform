import { Router, Request, Response } from 'express';
import { AlertService } from '../services/alertService.js';
import Database from 'better-sqlite3';

export function createAlertsRouter(db: Database.Database): Router {
  const router = Router();
  const service = new AlertService(db);

  router.get('/', (_req: Request, res: Response) => {
    try {
      const alerts = service.getAllAlerts();
      res.json(alerts);
    } catch (_err) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  router.get('/:teamId', (req: Request, res: Response) => {
    try {
      const alert = service.getTeamAlert(req.params.teamId);
      res.json(alert);
    } catch (_err) {
      res.status(500).json({ error: 'Failed to fetch alert' });
    }
  });

  return router;
}
