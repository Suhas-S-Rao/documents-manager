import { ipcMain } from 'electron';
import { ScannerRepository } from '../repositories/scanner.repository';
import { getScannersList, scanDocument } from '../scanner/scanner.service';

export function registerScannerIPC() {
    ipcMain.handle('scanner:getSettings', () => {
        return ScannerRepository.get();
    });

    ipcMain.handle('scanner:updateSettings', (_, settings) => {
        try {
            const result = ScannerRepository.update(settings);
            return { success: result.changes > 0, data: settings };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });

    ipcMain.handle('scanner:insertSettings', (_, settings) => {
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

    ipcMain.handle('scanner:scan', async (_, options) => {
        return await scanDocument(options);
    });
}
