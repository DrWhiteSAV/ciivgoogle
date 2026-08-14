import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { PLANETS, RACES, FALLBACK_CHOICES, FALLBACK_SKILLS } from '../config/constants.js';

let dbInstance: Database | null = null;
const DB_FILE_PATH = path.join(process.cwd(), 'civ_game.sqlite');

export async function getSQLiteDB(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('[SQLite] Loaded existing database from disk.');
    } catch (err) {
      console.error('[SQLite] Failed to load existing database file, creating new one.', err);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log('[SQLite] Creating new SQLite database...');
    dbInstance = new SQL.Database();
  }

  initSchema(dbInstance);
  saveSQLiteDB();
  return dbInstance;
}

export function saveSQLiteDB() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('[SQLite] Failed to save database to disk:', err);
  }
}

function initSchema(db: Database) {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS planets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      desc TEXT,
      shortDesc TEXT,
      seed TEXT,
      image TEXT,
      history TEXT,
      habitat_json TEXT,
      loading_phrases_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS races (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      desc TEXT,
      shortDesc TEXT,
      type TEXT,
      trait TEXT,
      image TEXT,
      history TEXT,
      biology TEXT,
      reproduction_json TEXT,
      development_json TEXT,
      stats_json TEXT,
      habitat_json TEXT,
      loading_phrases_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fallback_choices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      desc TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fallback_skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_saves (
      id TEXT PRIMARY KEY,
      planet_id TEXT,
      race_id TEXT,
      era TEXT,
      era_description TEXT,
      year INTEGER DEFAULT 0,
      era_year INTEGER DEFAULT 0,
      population INTEGER DEFAULT 144,
      stability INTEGER DEFAULT 100,
      compatibility INTEGER DEFAULT 100,
      available_years INTEGER DEFAULT 10,
      prayers INTEGER DEFAULT 500,
      current_situation TEXT,
      game_state_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chronicles (
      id TEXT PRIMARY KEY,
      game_id TEXT,
      year INTEGER,
      event TEXT,
      growth_percent REAL,
      original_growth_percent REAL,
      prayers_used INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS heroes (
      id TEXT PRIMARY KEY,
      game_id TEXT,
      era TEXT,
      name TEXT NOT NULL,
      title TEXT,
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS relics (
      id TEXT PRIMARY KEY,
      game_id TEXT,
      era TEXT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cron_jobs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      last_run TIMESTAMP,
      run_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create SQLite Triggers
  db.run(`
    CREATE TRIGGER IF NOT EXISTS trigger_update_planets_timestamp
    AFTER UPDATE ON planets
    BEGIN
      UPDATE planets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trigger_update_races_timestamp
    AFTER UPDATE ON races
    BEGIN
      UPDATE races SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trigger_update_game_saves_timestamp
    AFTER UPDATE ON game_saves
    BEGIN
      UPDATE game_saves SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  // Seed default planets if empty
  const planetCheck = db.exec("SELECT COUNT(*) as count FROM planets");
  if (!planetCheck.length || planetCheck[0].values[0][0] === 0) {
    console.log('[SQLite] Seeding planets...');
    const stmt = db.prepare(`
      INSERT INTO planets (id, name, desc, shortDesc, seed, image, history, habitat_json, loading_phrases_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of PLANETS) {
      stmt.run([
        p.id,
        p.name,
        p.desc,
        p.shortDesc,
        p.seed,
        p.image,
        p.history,
        JSON.stringify(p.habitat),
        JSON.stringify(p.loadingPhrases)
      ]);
    }
    stmt.free();
  }

  // Seed default races if empty
  const raceCheck = db.exec("SELECT COUNT(*) as count FROM races");
  if (!raceCheck.length || raceCheck[0].values[0][0] === 0) {
    console.log('[SQLite] Seeding races...');
    const stmt = db.prepare(`
      INSERT INTO races (id, name, desc, shortDesc, type, trait, image, history, biology, reproduction_json, development_json, stats_json, habitat_json, loading_phrases_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of RACES) {
      stmt.run([
        r.id,
        r.name,
        r.desc,
        r.shortDesc,
        r.type,
        r.trait,
        r.image,
        r.history,
        r.biology,
        JSON.stringify(r.reproduction),
        JSON.stringify(r.development),
        JSON.stringify(r.stats),
        JSON.stringify(r.habitat),
        JSON.stringify((r as any).loadingPhrases || [])
      ]);
    }
    stmt.free();
  }

  // Seed default fallback choices if empty
  const choiceCheck = db.exec("SELECT COUNT(*) as count FROM fallback_choices");
  if (!choiceCheck.length || choiceCheck[0].values[0][0] === 0) {
    console.log('[SQLite] Seeding fallback choices...');
    const stmt = db.prepare(`INSERT INTO fallback_choices (id, title, desc) VALUES (?, ?, ?)`);
    FALLBACK_CHOICES.forEach((c, idx) => {
      stmt.run([`choice-${idx + 1}`, c.title, c.desc]);
    });
    stmt.free();
  }

  // Seed default fallback skills if empty
  const skillCheck = db.exec("SELECT COUNT(*) as count FROM fallback_skills");
  if (!skillCheck.length || skillCheck[0].values[0][0] === 0) {
    console.log('[SQLite] Seeding fallback skills...');
    const stmt = db.prepare(`INSERT INTO fallback_skills (id, name, description) VALUES (?, ?, ?)`);
    FALLBACK_SKILLS.forEach((s, idx) => {
      stmt.run([`skill-${idx + 1}`, s.name, s.description]);
    });
    stmt.free();
  }

  // Seed cron jobs registry if empty
  const cronCheck = db.exec("SELECT COUNT(*) as count FROM cron_jobs");
  if (!cronCheck.length || cronCheck[0].values[0][0] === 0) {
    console.log('[SQLite] Seeding cron jobs registry...');
    db.run(`
      INSERT INTO cron_jobs (id, name, schedule, status, last_run, run_count)
      VALUES 
        ('cron-1', 'Game Passive Resource Generator', 'every 60s', 'active', datetime('now'), 0),
        ('cron-2', 'Database Auto Sync & Cleanup', 'every 300s', 'active', datetime('now'), 0);
    `);
  }
}
