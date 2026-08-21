import { getDb } from '../database/database';
import { GoogleDriveSettings } from '../models';

export class GoogleDriveBackupRepository {

    static getGoogleDriveSettings(): GoogleDriveSettings | null {
        const row = getDb().prepare(`SELECT * FROM google_drive_backup LIMIT 1`).get() as GoogleDriveSettings;
        if (row) {
            return {
                enabled: Boolean(row.enabled),
                folder_id: row.folder_id,
                last_backup: row.last_backup
            };
        }
        return null;
    }

    static updateGoogleDriveSettings(settings: GoogleDriveSettings) {
        return getDb().prepare(`UPDATE google_drive_backup SET enabled = @enabled, auto_backup = @auto_backup, backup_time = @backup_time, folder_id = @folder_id, last_backup = @last_backup WHERE id = 1`).run(
            {
                enabled: settings.enabled ? 1 : 0,
                folder_id: settings.folder_id,
                last_backup: settings.last_backup
            }
        );
    }

    static updateLastBackup(date: string) {
        return getDb().prepare(`UPDATE google_drive_backup SET last_backup = ? WHERE id = 1`).run(date);
    }

    static updateFolderId(folderId: string) {
        return getDb().prepare(`UPDATE google_drive_backup SET folder_id = ? WHERE id = 1`).run(folderId);
    }
}