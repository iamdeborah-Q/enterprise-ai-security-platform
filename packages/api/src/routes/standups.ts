import { Router, Request, Response } from 'express';
import { StandupService } from '../services/standupService.js';
import type Database from 'better-sqlite3';

export function createStandupsRouter(db: Database.Database): Router {
  const router = Router();
  const service = new StandupService(db);

  router.get('/', (req: Request, res: Response) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      const date = req.query.date as string | undefined;

      const filters: { teamId?: string; date?: string } = {};
      if (teamId) filters.teamId = teamId;
      if (date) filters.date = date;

      const standups = service.findAll(filters);
      res.json(standups);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch standups' });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    const standup = service.findById(req.params.id);
    if (!standup) {
      res.status(404).json({ error: 'Standup not found' });
      return;
    }
    res.json(standup);
  });

  router.post('/', (req: Request, res: Response) => {
    const { teamId, author, date, yesterday, today, blockers, mood } = req.body;

    if (!teamId || !author || !date || !yesterday || !today) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const standup = service.create({
      teamId,
      author,
      date,
      yesterday,
      today,
      blockers: blockers || '',
      mood: mood || 3,
    });
    res.status(201).json(standup);
  });

  router.put('/:id', (req: Request, res: Response) => {
    const standup = service.update(req.params.id, req.body);
    if (!standup) {
      res.status(404).json({ error: 'Standup not found' });
      return;
    }
    res.json(standup);
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = service.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Standup not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
