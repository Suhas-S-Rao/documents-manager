import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Tag } from '../models/tag';
import { Document } from '../models/document';
const api = {
    documents: {
        getAll: () => ipcRenderer.invoke('documents:getAll'),
        create: async (document: Document) => ipcRenderer.invoke('documents:create', document),
        update: (data: unknown) => ipcRenderer.invoke('documents:update', data),
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
        getProperties: () => ipcRenderer.invoke('scanner:getProperties'),
        updateProperties: (data: unknown) => ipcRenderer.invoke('scanner:updateProperties', data),
        getScannersList: () => ipcRenderer.invoke('scanner:getScannersList'),
        scan: (options: any) => ipcRenderer.invoke('scanner:scan', options)
    },
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