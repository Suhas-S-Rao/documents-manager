import Database from 'better-sqlite3';
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

let database: Database.Database | null = null;

export function getDb(): Database.Database {
    if (database) {
        return database;
    }
    const dataDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, {
            recursive: true
        });
    }
    const dbPath = path.join(dataDir, 'documents.db');
    database = new Database(dbPath);
    database.pragma('journal_mode = WAL');
    database.pragma('foreign_keys = ON');
    return database;
}

export function closeDb() {
    if (database) {
        database.close();
        database = null;
    }
}