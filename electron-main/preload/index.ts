import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';
import { Document, ScannerSettings, Tag } from '../models';
const api = {
    documents: {
        getAll: () => ipcRenderer.invoke('documents:getAll'),
        create: async (document: Document) => ipcRenderer.invoke('documents:create', document),
        update: (document: Document) => ipcRenderer.invoke('documents:update', document),
        delete: (id: string) => ipcRenderer.invoke('documents:delete', id),
        getFile: (filePath: string) => ipcRenderer.invoke('documents:getFile', filePath)
    },

    tags: {
        getAll: () => ipcRenderer.invoke('tags:getAll'),
        create: (tag: Tag) => ipcRenderer.invoke('tags:create', tag),
        update: (tag: Tag) => ipcRenderer.invoke('tags:update', tag),
        delete: (id: string) => ipcRenderer.invoke('tags:delete', id)
    },
    scanner: {
        getSettings: () => ipcRenderer.invoke('scanner:getSettings'),
        insertSettings: (scannerSettings: ScannerSettings) => ipcRenderer.invoke('scanner:insertSettings', scannerSettings),
        updateSettings: (scannerSettings: ScannerSettings) => ipcRenderer.invoke('scanner:updateSettings', scannerSettings),
        getScannersList: () => ipcRenderer.invoke('scanner:getScannersList'),
        scan: (options: any) => ipcRenderer.invoke('scanner:scan', options),
    },
    googleDrive: {
        getSettings: () => ipcRenderer.invoke('googleDrive:getSettings'),
        updateSettings: (settings: unknown) => ipcRenderer.invoke('googleDrive:updateSettings', settings),
        connect: () => ipcRenderer.invoke('googleDrive:connect'),
        backup: () => ipcRenderer.invoke('googleDrive:backup'),
        restore: () => ipcRenderer.invoke('googleDrive:restore')
    },
    progress: {
        onUpdate: (callback: any) => { ipcRenderer.on('app-progress', (_, data) => { callback(data); }); }
    }
};

export type API = typeof api;

if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
} else {
    // @ts-ignore
    window.electron = electronAPI;
    // @ts-ignore
    window.api = api;
}