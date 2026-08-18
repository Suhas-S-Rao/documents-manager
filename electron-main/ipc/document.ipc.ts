import { ipcMain } from 'electron';
import { DocumentRepository } from '../repositories/document.repository';
import fs from 'node:fs/promises';
import { Document } from '../models';

export function registerDocumentIPC() {
    ipcMain.handle('documents:getAll', () => {
        return DocumentRepository.getAll();
    });

    ipcMain.handle('documents:create', async (_, data: Document) => {
        try {
            const result = await DocumentRepository.create(data);
            return result !== null ? { success: true, data: result } : { success: false, error: "No file" };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('documents:update', async (_, data: Document) => {
        try {
            const result = await DocumentRepository.update(data);
            return result !== null ? { success: true, data: result } : { success: false, error: "No file" };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('documents:delete', (_, id: string) => {
        try {
            const result = DocumentRepository.delete(id);
            return { success: result.changes > 0, data: id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('documents:getFile', async (_, filePath: string) => {
        try {
            const buffer = await fs.readFile(filePath);
            return { success: true, data: buffer };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    });
}