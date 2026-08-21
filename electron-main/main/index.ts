import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow } from 'electron';
import path, { join } from 'node:path';
import '../database/migrate';
import { setProgressWindow } from '../helpers';
import { registerIpc } from '../ipc';

const preloadPath = join(__dirname, '../preload/index.js');

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true,
        autoHideMenuBar: true,
        icon: path.join(process.env.APP_ROOT!, 'build/icon.ico'),
        title: 'Document Manager',

        webPreferences: {
            preload: preloadPath,
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    mainWindow.maximize();
    setProgressWindow(mainWindow);
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
