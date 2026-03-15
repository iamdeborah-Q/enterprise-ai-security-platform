import { Request, Response, NextFunction } from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const os = require('os');

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${os.hostname()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}
