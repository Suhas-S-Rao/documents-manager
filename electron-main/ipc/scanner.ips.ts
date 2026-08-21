import { ipcMain } from 'electron';
import { ScannerRepository } from '../repositories/scanner.repository';
import { getScannersList, scanDocument } from '../services/scanner';
import { ScannerSettings } from '../models';

export function registerScannerIPC() {
    ipcMain.handle('scanner:getSettings', () => {
        return ScannerRepository.getAll();
    });

    ipcMain.handle('scanner:updateSettings', (_, settings: ScannerSettings) => {
        try {
            const result = ScannerRepository.update(settings);
            return { success: result.changes > 0, data: settings };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('scanner:insertSettings', (_, settings: ScannerSettings) => {
        try {
            const result = ScannerRepository.insert(settings);
            return { success: result.changes > 0, data: settings };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('scanner:getScannersList', async () => {
        const scanners = await getScannersList();
        return scanners;
    });

    ipcMain.handle('scanner:scan', async (_, scannerSetting) => {
        try {
            const file = await scanDocument(scannerSetting);
            return { success: true, data: file };
        } catch (error: any) {
            return { success: false, error: error.message ?? 'Scanner disconnected' };
        }
    });
}
