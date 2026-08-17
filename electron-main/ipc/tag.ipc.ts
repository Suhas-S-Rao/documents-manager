import { ipcMain } from 'electron'
import { TagRepository } from '../repositories/tag.repository';
import { Tag } from '../models/tag';

export function registerTagIpc() {
    ipcMain.handle('tags:getAll', () => {
        return TagRepository.getAll();
    });

    ipcMain.handle('tags:create', (_, tag: Tag) => {
        try {
            const result = TagRepository.create(tag);
            return { success: result.changes > 0, data: tag };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('tags:update', (_, tag: Tag) => {
        try {
            const { id, documentCount, ...updateData } = tag;
            const result = TagRepository.update(id, updateData);
            return { success: result.changes > 0, data: tag };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('tags:delete', (_, id: string) => {
        try {
            const result = TagRepository.delete(id);
            return { success: result.changes > 0, data: id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
}