import { getDb } from '../database/database';
import { ScannerSettings } from '../models';


export class ScannerRepository {
    static get(): ScannerSettings | null {
        let row = getDb().prepare(`SELECT * FROM scanner_settings WHERE id = 1`).get() as {
            scanner_name: string,
            scanner_id: string,
            dpi: number,
            color_mode: string,
            id: string
            is_default: number
        };
        if (row) {
            return {
                scanner_name: row.scanner_name,
                scanner_id: row.scanner_id,
                dpi: row.dpi,
                color_mode: row.color_mode,
                id: row.id,
                is_default: Boolean(row.is_default)
            };
        }
        return null;
    }

    static insert(scannerSettings: ScannerSettings) {
        return getDb().prepare(`INSERT INTO scanner_settings (id, scanner_id, scanner_name, dpi, color_mode) VALUES (@id, @scanner_id, @scanner_name, @dpi, @color_mode)`).run({
            scanner_name: scannerSettings.scanner_name,
            dpi: scannerSettings.dpi,
            color_mode: scannerSettings.color_mode,
            id: scannerSettings.id,
            is_default: scannerSettings ? 1 : 0
        });
    }

    static update(scannerSettings: ScannerSettings) {
        return getDb().prepare(`UPDATE scanner_settings SET scanner_name = scanner_name, dpi = @dpi, color_mode = @color_mode WHERE id = @id`).run({
            scanner_name: scannerSettings.scanner_name,
            dpi: scannerSettings.dpi,
            color_mode: scannerSettings.color_mode,
            id: scannerSettings.id,
            is_default: scannerSettings ? 1 : 0
        });
    }

    static delete(id: string) {
        let result = getDb().prepare(`DELETE FROM scanner_settings WHERE id = @id`).run({ id });;
        return result;
    }
}
