import path from 'path';
import fs from 'fs';
import { getDb } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/teampulse.db';
const dir = path.dirname(dbPath);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = getDb(dbPath);
console.log(`Database migrated successfully at ${dbPath}`);
db.close();
