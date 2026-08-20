import { authenticate } from '@google-cloud/local-auth';
import { app } from 'electron';
import extract from 'extract-zip';
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { closeDb } from '../database/database';
import { GoogleDriveBackupRepository } from '../repositories/googleDriveBackup.repository';
import { cleanupBackup, createZip, prepareBackup } from './backupArchive';
import { decryptFile, encryptFile } from './encryption';
import Database from 'better-sqlite3';
import { delay, sendProgress } from '../utils/helpers';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const credentialsPath = path.join(app.getPath('userData'), 'credentials.json');
let authClient: any = null;

const readCredentials = () => {
    if (!fs.existsSync(credentialsPath)) {
        throw new Error('Google credentials file not found');
    }
    return JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
};

const saveCredentials = (credentials: any) => {
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
};

export const connectGoogleDrive = async () => {
    try {
        sendProgress('googleConnect', 'Opening Google login...', 5);
        const auth = await authenticate({ scopes: SCOPES, keyfilePath: credentialsPath });

        sendProgress('googleConnect', 'Saving authentication details...', 35);
        const credentials = readCredentials();
        credentials.token = auth.credentials;

        sendProgress('googleConnect', 'Initializing Google Drive client...', 50);
        const client = new google.auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret);
        client.setCredentials(credentials.token);
        await client.getAccessToken();
        authClient = client;
        authClient.on('tokens', (tokens: any) => {
            credentials.token = { ...credentials.token, ...tokens };
            saveCredentials(credentials);
        });
        saveCredentials(credentials);

        sendProgress('googleConnect', 'Creating backup folder...', 70);
        const folderId = await getOrCreateBackupFolder();

        sendProgress('googleConnect', 'Saving backup settings...', 85);
        if (folderId) {
            GoogleDriveBackupRepository.updateFolderId(folderId);
        }

        sendProgress('googleConnect', 'Google Drive connected', 100);
        await delay(1000);
        return { success: true };
    } catch (error) {
        sendProgress('googleConnect', 'Google Drive connection failed', 0);
        throw error;
    }
};

export const loadGoogleDriveAuth = async () => {
    const credentials = readCredentials();
    if (!credentials.token) {
        throw new Error('Google Drive is not connected');
    }
    const client = new google.auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret);
    client.setCredentials(credentials.token);
    await client.getAccessToken();
    authClient = client;
    client.on('tokens', (tokens: any) => {
        credentials.token = { ...credentials.token, ...tokens };
        saveCredentials(credentials);
    });
    return true;
};

export const getDriveClient = () => {
    if (!authClient) {
        throw new Error('Google Drive authentication not initialized');
    }
    return google.drive({ version: 'v3', auth: authClient });
};

export const backupToGoogleDrive = async () => {
    let backupFolder = '';
    let zipFile = '';
    let encryptedFile = '';

    try {
        sendProgress('googleBackup', 'Checking Google Drive authentication...', 5);
        await loadGoogleDriveAuth();

        sendProgress('googleBackup', 'Loading backup settings...', 10);
        const settings = GoogleDriveBackupRepository.getGoogleDriveSettings();
        if (!settings) {
            throw new Error('Google Drive settings not found');
        }

        sendProgress('googleBackup', 'Checking backup folder...', 15);
        const folderId = await getBackupFolderId(true);

        sendProgress('googleBackup', 'Preparing backup data...', 20);
        backupFolder = await prepareBackup();

        sendProgress('googleBackup', 'Creating backup archive...', 35);
        zipFile = await createZip(backupFolder);

        sendProgress('googleBackup', 'Encrypting backup...', 50);
        encryptedFile = await encryptFile(zipFile);

        sendProgress('googleBackup', 'Removing old backup...', 60);
        await deleteAllBackupFiles(folderId);

        sendProgress('googleBackup', 'Uploading encrypted backup...', 70);
        await uploadFile(encryptedFile, 'DocumentsManagerBackup.enc', folderId);

        sendProgress('googleBackup', 'Updating backup information...', 85);
        GoogleDriveBackupRepository.updateLastBackup(new Date().toISOString());

        sendProgress('googleBackup', 'Backup completed successfully', 100);
        await delay(1000);
        return { success: true };
    } catch (error) {
        sendProgress('googleBackup', 'Backup failed', 0);
        console.error('Google Drive backup failed', error);
        throw error;
    } finally {
        cleanupBackup([backupFolder, zipFile, encryptedFile]);
    }
};

const uploadFile = async (filePath: string, fileName: string, folderId?: string) => {
    const drive = getDriveClient();
    const result = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: folderId ? [folderId] : undefined
        },
        media: {
            body: fs.createReadStream(filePath)
        },
        fields: 'id'
    });
    return result.data.id;
};

const deleteAllBackupFiles = async (folderId: string) => {
    const drive = getDriveClient();
    let pageToken: string | undefined = undefined;
    do {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and name='DocumentsManagerBackup.enc' and trashed=false`,
            fields: 'nextPageToken, files(id,name)',
            pageToken
        });
        const files = response.data.files ?? [];
        for (const file of files) {
            if (file.id) {
                await drive.files.delete({ fileId: file.id });
            }
        }
        pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);
};

const getOrCreateBackupFolder = async () => {
    const drive = getDriveClient();
    const response = await drive.files.list({
        q: "name='Documents Manager Backup' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id,name)'
    });
    const folders = response.data.files ?? [];
    let folderId: string | null = null;
    if (folders.length > 0) {
        folderId = folders[0].id ?? null;
    } else {
        const folder = await drive.files.create({
            requestBody: {
                name: 'Documents Manager Backup',
                mimeType: 'application/vnd.google-apps.folder'
            },
            fields: 'id'
        });
        folderId = folder.data.id ?? null;
    }

    if (!folderId) {
        throw new Error('Unable to create Google Drive backup folder');
    }
    return folderId;
};

export const restoreFromGoogleDrive = async () => {
    let encryptedPath = '';
    let zipPath = '';

    try {
        sendProgress('googleRestore', 'Checking Google Drive authentication...', 5);
        await loadGoogleDriveAuth();

        sendProgress('googleRestore', 'Loading backup settings...', 10);
        const settings = GoogleDriveBackupRepository.getGoogleDriveSettings();
        if (!settings) {
            throw new Error('Google Drive settings not found');
        }

        sendProgress('googleRestore', 'Checking backup folder...', 15);
        const folderId = await getBackupFolderId(false);
        const drive = getDriveClient();

        sendProgress('googleRestore', 'Finding backup file...', 20);
        const response = await drive.files.list({
            q: `'${folderId}' in parents and name='DocumentsManagerBackup.enc' and trashed=false`,
            fields: 'files(id,name)'
        });
        const backupFile = response.data.files?.[0];
        if (!backupFile?.id) {
            throw new Error('Backup file not found');
        }
        encryptedPath = path.join(process.env.TEMP!, 'DocumentsManagerBackup.enc');
        zipPath = path.join(process.env.TEMP!, 'DocumentsManagerBackup.zip');

        sendProgress('googleRestore', 'Downloading backup...', 30);
        const writer = fs.createWriteStream(encryptedPath);
        const download = await drive.files.get({ fileId: backupFile.id, alt: 'media' }, { responseType: 'stream' });
        await new Promise<void>((resolve, reject) => {
            download.data.pipe(writer).on('finish', resolve).on('error', reject);
        });

        sendProgress('googleRestore', 'Decrypting backup...', 45);
        await decryptFile(encryptedPath, zipPath);

        sendProgress('googleRestore', 'Closing database...', 55);
        await new Promise((resolve) => setTimeout(resolve, 200));
        closeDb();
        await new Promise((resolve) => setTimeout(resolve, 500));

        sendProgress('googleRestore', 'Removing old data...', 65);
        const dataPath = path.join(app.getPath('userData'), 'data');
        const dbPath = path.join(dataPath, 'documents.db');
        if (fs.existsSync(dbPath)) {
            fs.rmSync(dbPath, { force: true });
        }
        if (fs.existsSync(`${dbPath}-wal`)) {
            fs.rmSync(`${dbPath}-wal`, { force: true });
        }
        if (fs.existsSync(`${dbPath}-shm`)) {
            fs.rmSync(`${dbPath}-shm`, { force: true });
        }
        fs.mkdirSync(dataPath, { recursive: true });
        const documentsPath = path.join(app.getPath('userData'), 'documents');
        if (fs.existsSync(documentsPath)) {
            fs.rmSync(documentsPath, { recursive: true, force: true });
        }

        sendProgress('googleRestore', 'Extracting backup files...', 80);
        await extract(zipPath, { dir: app.getPath('userData') });

        sendProgress('googleRestore', 'Verifying restored database...', 90);
        let db: Database.Database | null = null;
        try {
            db = new Database(path.join(app.getPath('userData'), 'data', 'documents.db'));
            const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as { name: string }[];
            const requiredTables = ['documents', 'tags', 'document_tags'];
            const valid = requiredTables.every(table => tables.some(x => x.name === table));
            if (!valid) {
                throw new Error('Invalid backup database');
            }
        } finally {
            db?.close();
        }

        sendProgress('googleRestore', 'Restore completed successfully', 100);
        await delay(1000);
        return { success: true };
    } catch (error) {
        sendProgress('googleRestore', 'Restore failed', 0);
        console.error('Google Drive restore failed', error);
        throw error;
    } finally {
        cleanupBackup([encryptedPath, zipPath]);
    }
};

const getBackupFolderId = async (createIfMissing = false) => {
    const settings = GoogleDriveBackupRepository.getGoogleDriveSettings();

    if (settings?.folder_id) {
        try {
            await getDriveClient().files.get({
                fileId: settings.folder_id,
                fields: 'id'
            });

            return settings.folder_id;
        } catch {
            GoogleDriveBackupRepository.updateFolderId('');
        }
    }

    const folderId = await findBackupFolder();

    if (folderId) {
        GoogleDriveBackupRepository.updateFolderId(folderId);

        return folderId;
    }

    if (createIfMissing) {
        const newFolder = await getOrCreateBackupFolder();

        GoogleDriveBackupRepository.updateFolderId(newFolder);

        return newFolder;
    }

    throw new Error('Backup folder not found');
};
const findBackupFolder = async () => {
    const drive = getDriveClient();
    const response = await drive.files.list({
        q: "name='Documents Manager Backup' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id)'
    });
    return response.data.files?.[0]?.id ?? null;
};
