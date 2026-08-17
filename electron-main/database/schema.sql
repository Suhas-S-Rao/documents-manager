CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    document_date TEXT,
    document_number TEXT,
    total_pages INTEGER NOT NULL DEFAULT 1,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT
);

CREATE TABLE IF NOT EXISTS document_tags (
    document_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (document_id, tag_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scanner_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    scanner_name TEXT,
    dpi INTEGER DEFAULT 300,
    color_mode TEXT DEFAULT 'Color',
    paper_size TEXT DEFAULT 'A4',
    duplex INTEGER DEFAULT 0,
    auto_crop INTEGER DEFAULT 1,
    auto_rotate INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE TABLE IF NOT EXISTS google_drive_backup (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER DEFAULT 0,
    folder_id TEXT,
    last_backup_at TEXT,
    last_backup_status TEXT
);