import { authenticate } from '@google-cloud/local-auth';
import { app } from 'electron';
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleDriveBackupRepository } from '../repositories/googleDriveBackup.repository';

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
    const auth = await authenticate({ scopes: SCOPES, keyfilePath: credentialsPath });
    const credentials = readCredentials();
    credentials.token = auth.credentials;
    const client = new google.auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret);
    client.setCredentials(credentials.token);
    authClient = client;
    authClient.on('tokens', (tokens: any) => {
        credentials.token = { ...credentials.token, ...tokens };
        saveCredentials(credentials);
    });
    saveCredentials(credentials);
    const folderId = await getOrCreateBackupFolder();
    if (folderId) {
        GoogleDriveBackupRepository.updateFolderId(folderId);
    }
    return true;
};


export const loadGoogleDriveAuth = async () => {
    const credentials = readCredentials();
    if (!credentials.token) {
        throw new Error('Google Drive is not connected');
    }
    const client = new google.auth.OAuth2(credentials.installed.client_id, credentials.installed.client_secret);
    client.setCredentials(credentials.token);
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
    await loadGoogleDriveAuth();
    const settings = GoogleDriveBackupRepository.getGoogleDriveSettings();
    if (!settings) {
        throw new Error('Google Drive settings not found');
    }
    console.log(settings)
    if (!settings?.folder_id) {
        throw new Error('Backup folder not configured');
    }
    await deleteAllBackupFiles(settings.folder_id);
    const dbPath = path.join(app.getPath('userData'), 'data', 'documents.db');
    if (!fs.existsSync(dbPath)) {
        throw new Error('Database file not found');
    }
    await uploadFile(dbPath, 'documents.db', settings.folder_id);
    const documentsPath = path.join(app.getPath('userData'), 'documents');
    await uploadDirectory(documentsPath, settings.folder_id);
    GoogleDriveBackupRepository.updateLastBackup(new Date().toISOString());
};

export const checkScheduledBackup = async () => {
    const settings = GoogleDriveBackupRepository.getGoogleDriveSettings();
    if (!settings || !settings.auto_backup || !settings.backup_time) {
        return;
    }
    const now = new Date();
    const [hours, minutes] = settings.backup_time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (now < scheduledTime) {
        return;
    }

    const lastBackup = settings.last_backup ? new Date(settings.last_backup) : null;
    if (lastBackup) {
        const sameDay = lastBackup.getFullYear() === now.getFullYear() && lastBackup.getMonth() === now.getMonth() && lastBackup.getDate() === now.getDate();
        if (sameDay) {
            return;
        }
    }
    try {
        await backupToGoogleDrive();
    }
    catch (error) {
        console.error('Scheduled Google Drive backup failed', error);
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

const uploadDirectory = async (directoryPath: string, folderId?: string) => {

    if (!fs.existsSync(directoryPath)) {
        return;
    }
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(directoryPath, file.name);
        if (file.isDirectory()) {
            await uploadDirectory(fullPath, folderId);
        } else {
            await uploadFile(fullPath, file.name, folderId);
        }
    }
};

const deleteAllBackupFiles = async (folderId: string) => {
    const drive = getDriveClient();
    let pageToken: string | undefined = undefined;
    do {
        const response =
            await drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
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

    if (folders.length > 0) {
        return folders[0].id;
    }
    const folder = await drive.files.create({
        requestBody: {
            name: 'Documents Manager Backup',
            mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
    });

    return folder.data.id;
};