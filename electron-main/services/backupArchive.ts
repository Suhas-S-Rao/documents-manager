import { ZipArchive } from 'archiver';
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '../database/database';

export const createBackupFolder = async () => {
    const backupPath = path.join(process.env.TEMP!, 'documents-manager-backup');

    if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath, { recursive: true, force: true });
    }

    fs.mkdirSync(backupPath, { recursive: true });
    return backupPath;
};

export const prepareBackup = async () => {
    const backupFolder = await createBackupFolder();
    const dataFolder = path.join(backupFolder, 'data');
    fs.mkdirSync(dataFolder, { recursive: true });
    const dbPath = path.join(app.getPath('userData'), 'data', 'documents.db');

    const db = getDb();

    db.pragma('wal_checkpoint(FULL)');

    fs.copyFileSync(dbPath, path.join(dataFolder, 'documents.db'));

    const documentsPath = path.join(app.getPath('userData'), 'documents');
    fs.cpSync(documentsPath, path.join(backupFolder, 'documents'), { recursive: true });
    return backupFolder;
};

export const createZip = async (sourceFolder: string) => {
    const zipPath = path.join(process.env.TEMP!, 'DocumentsManagerBackup.zip');
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }
    return new Promise<string>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = new ZipArchive({ zlib: { level: 9 } });
        output.on('close', () => { resolve(zipPath); });
        archive.on('error', (error: any) => { reject(error); });
        archive.pipe(output);
        archive.directory(sourceFolder, false);
        archive.finalize();
    });
};

export const cleanupBackup = (paths: string[]) => {
    for (const item of paths) {
        if (fs.existsSync(item)) {
            fs.rmSync(item, { recursive: true, force: true });
        }
    }
};