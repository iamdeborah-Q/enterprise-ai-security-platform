import { Router, Request, Response } from 'express';
import { DigestService } from '../services/digestService.js';
import Database from 'better-sqlite3';

export function createDigestRouter(db: Database.Database): Router {
  const router = Router();
  const service = new DigestService(db);

  router.get('/', (_req: Request, res: Response) => {
    try {
      const digest = service.getWeeklyDigest();
      res.json({ data: digest, error: null, meta: { teamCount: digest.teams.length } });
    } catch (_err) {
      res.status(500).json({ data: null, error: 'Failed to generate weekly digest', meta: {} });
    }
  });

  return router;
}
