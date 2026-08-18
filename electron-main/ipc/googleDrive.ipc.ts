import { ipcMain } from 'electron';
import { GoogleDriveBackupRepository } from '../repositories/googleDriveBackup.repository';
import { connectGoogleDrive } from '../services/googleAuth';
import { backupToGoogleDrive } from '../services/googleAuth';

export function registerGoogleDriveIpc() {
    ipcMain.handle('googleDrive:getSettings', () => {
        try {
            return { success: true, data: GoogleDriveBackupRepository.getGoogleDriveSettings() };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('googleDrive:updateSettings', (_, settings) => {
        try {
            const result = GoogleDriveBackupRepository.updateGoogleDriveSettings(settings);
            return { success: result.changes > 0, data: settings };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('googleDrive:connect', async () => {
        try {
            await connectGoogleDrive();
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('googleDrive:backup', async () => {
        try {
            await backupToGoogleDrive();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}