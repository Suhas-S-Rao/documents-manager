/// <reference types="vite/client" />

import type { ElectronAPI } from '@electron-toolkit/preload'
import type { API } from '../electron-main/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

export {}