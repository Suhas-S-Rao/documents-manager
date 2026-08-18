import { getDb } from '../database/database';
import { GoogleDriveSettings } from '../models';

export class GoogleDriveBackupRepository {

    static getGoogleDriveSettings(): GoogleDriveSettings | null {
        const row = getDb().prepare(`SELECT * FROM google_drive_backup LIMIT 1`).get() as {
            enabled: number;
            auto_backup: number;
            backup_time: string | null;
            folder_id: string | null;
            last_backup: string | null;
        };
        if (row) {
            return {
                enabled: Boolean(row.enabled),
                auto_backup: Boolean(row.auto_backup),
                backup_time: row.backup_time ?? '',
                folder_id: row.folder_id ?? '',
                last_backup: row.last_backup ?? ''
            };
        }
        return null;
    }

    static updateGoogleDriveSettings(settings: GoogleDriveSettings) {
        return getDb().prepare(`UPDATE google_drive_backup SET enabled = @enabled, auto_backup = @auto_backup, backup_time = @backup_time, folder_id = @folder_id, last_backup = @last_backup`).run(
            { ...settings, enabled: settings.enabled ? 1 : 0, auto_backup: settings.auto_backup ? 1 : 0 }
        );
    }

    static updateLastBackup(date: string) {
        return getDb().prepare(`UPDATE google_drive_backup SET last_backup = ?`).run(date);
    }

    static updateFolderId(folderId: string) {
        return getDb().prepare(`UPDATE google_drive_backup SET folder_id = ?`).run(folderId);
    }
}