import { ipcMain } from 'electron';
import { GoogleDriveBackupRepository } from '../repositories/googleDriveBackup.repository';
import { connectGoogleDrive, restoreFromGoogleDrive } from '../services/googleAuth';
import { backupToGoogleDrive } from '../services/googleAuth';

export function registerGoogleDriveIpc() {
    ipcMain.handle('googleDrive:getSettings', () => {
        try {
            const result = GoogleDriveBackupRepository.getGoogleDriveSettings();
            if (result) {
                return { success: true, data: result };
            }
            return { success: false, error: "No Data" };
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

    ipcMain.handle('googleDrive:restore', async () => {
        try {
            await restoreFromGoogleDrive();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}