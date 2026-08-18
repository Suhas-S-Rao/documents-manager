import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { checkScheduledBackup } from '../services/googleAuth';

import '../database/migrate';
import { registerIpc } from '../ipc';

const preloadPath = join(__dirname, '../preload/index.js');


function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: preloadPath,
            sandbox: false
        }
    });

    mainWindow.maximize();
    mainWindow.webContents.openDevTools();

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
}

app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.suhas.documentmanager');
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });
    registerIpc();
    createWindow();
    try {
        await checkScheduledBackup();
    }
    catch (error) {
        console.error('Auto backup failed', error);
    }
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
