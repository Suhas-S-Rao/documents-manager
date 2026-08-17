import { ipcMain } from 'electron';
import { ScannerRepository } from '../repositories/scanner.repository';
import { getScannersList, scanDocument } from '../scanner/scanner.service';
export function registerScannerIPC() {
    ipcMain.handle('scanner:getProperties', () => {
        return ScannerRepository.get();
    });

    ipcMain.handle('scanner:updateProperties', (_, data) => {
        return ScannerRepository.update(data);
    });



    ipcMain.handle('scanner:getScannersList', async () => {
        const scanners = await getScannersList();
        return scanners;
    });

    ipcMain.handle('scanner:scan', async (_, options) => {
        return await scanDocument(options);
    });
}
