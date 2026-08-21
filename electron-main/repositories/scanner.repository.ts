import { getDb } from '../database/database';
import { ScannerSettings } from '../models';


export class ScannerRepository {
    static getAll(): ScannerSettings[] | null {
        let row = getDb().prepare(`SELECT * FROM scanner_settings`).all() as (Omit<ScannerSettings, 'is_default'> & { is_default: number })[];
        if (row) {
            let output: ScannerSettings[] = []
            for (let r of row) {
                output.push({
                    scanner_name: r.scanner_name,
                    scanner_id: r.scanner_id,
                    dpi: r.dpi,
                    color_mode: r.color_mode,
                    id: r.id,
                    is_default: Boolean(r.is_default),
                    max_dpi: r.max_dpi
                });
            }
            return output;
        }
        return null;
    }

    static insert(scannerSettings: ScannerSettings) {
        if (scannerSettings.is_default) {
            getDb().prepare(`UPDATE scanner_settings SET is_default = 0`).run();
        }
        return getDb().prepare(`INSERT INTO scanner_settings (id, scanner_id, scanner_name, dpi, color_mode, is_default, max_dpi) VALUES (@id, @scanner_id, @scanner_name, @dpi, @color_mode, @is_default, @max_dpi)`).run({
            scanner_id: scannerSettings.scanner_id,
            scanner_name: scannerSettings.scanner_name,
            dpi: scannerSettings.dpi,
            color_mode: scannerSettings.color_mode,
            id: scannerSettings.id,
            is_default: scannerSettings.is_default ? 1 : 0,
            max_dpi: scannerSettings.max_dpi
        });
    }

    static update(scannerSettings: ScannerSettings) {
        if (scannerSettings.is_default) {
            getDb().prepare(`UPDATE scanner_settings SET is_default = 0`).run();
        }
        return getDb().prepare(`UPDATE scanner_settings SET scanner_name = @scanner_name, dpi = @dpi, color_mode = @color_mode, is_default = @is_default, max_dpi = @max_dpi WHERE id = @id`).run({
            scanner_id: scannerSettings.scanner_id,
            scanner_name: scannerSettings.scanner_name,
            dpi: scannerSettings.dpi,
            color_mode: scannerSettings.color_mode,
            id: scannerSettings.id,
            is_default: scannerSettings.is_default ? 1 : 0,
            max_dpi: scannerSettings.max_dpi
        });
    }
}
