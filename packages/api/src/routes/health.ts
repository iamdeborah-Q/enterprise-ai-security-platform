import { Router, Request, Response } from 'express';
import { APP_VERSION } from '@teampulse/shared';

const router = Router();
const startTime = Date.now();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: APP_VERSION,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

export default router;
