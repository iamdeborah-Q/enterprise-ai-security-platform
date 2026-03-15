import { Router, Request, Response } from 'express';
import { TeamService } from '../services/teamService.js';
import { validateTeamInput } from '../utils/validation.js';
import Database from 'better-sqlite3';

export function createTeamsRouter(db: Database.Database): Router {
  const router = Router();
  const service = new TeamService(db);

  router.get('/', (_req: Request, res: Response) => {
    try {
      const teams = service.findAll();
      res.json(teams);
    } catch (_err) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  router.get('/:id', (req: Request, res: Response) => {
    const team = service.findById(req.params.id);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json(team);
  });

  router.post('/', (req: Request, res: Response) => {
    try {
      const validation = validateTeamInput(req.body);
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }
      const team = service.create(validation.data);
      res.status(201).json(team);
    } catch (_err) {
      res.status(500).json({ error: 'Failed to create team' });
    }
  });

  router.put('/:id', (req: Request, res: Response) => {
    const team = service.update(req.params.id, req.body);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json(team);
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = service.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
