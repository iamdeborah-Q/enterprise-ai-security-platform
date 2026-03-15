import Database from 'better-sqlite3';

export function createTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      lead TEXT NOT NULL,
      members INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS standups (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      author TEXT NOT NULL,
      date TEXT NOT NULL,
      yesterday TEXT NOT NULL,
      today TEXT NOT NULL,
      blockers TEXT NOT NULL DEFAULT '',
      mood INTEGER NOT NULL CHECK(mood >= 1 AND mood <= 5),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_standups_team_id ON standups(team_id);
    CREATE INDEX IF NOT EXISTS idx_standups_date ON standups(date);
    CREATE INDEX IF NOT EXISTS idx_standups_team_date ON standups(team_id, date);
  `);
}

export function getDb(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createTables(db);
  return db;
}
