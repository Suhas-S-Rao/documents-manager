import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

export const setProgressWindow = (window: BrowserWindow) => {
    mainWindow = window;
};

export const sendProgress = (id: string, message?: string, progress?: number) => {
    mainWindow?.webContents.send('app-progress', { id, message, progress });
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));