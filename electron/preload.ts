import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 更新相關
  checkForUpdate: () => ipcRenderer.send('check-for-update'),
  quitAndInstall: () => ipcRenderer.send('quit-and-install'),
  
  // 監聽更新事件
  onUpdateChecking: (callback: () => void) => ipcRenderer.on('update-checking', callback),
  onUpdateAvailable: (callback: (info: any) => void) => ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateNotAvailable: (callback: (info: any) => void) => ipcRenderer.on('update-not-available', (_event, info) => callback(info)),
  onUpdateError: (callback: (error: string) => void) => ipcRenderer.on('update-error', (_event, error) => callback(error)),
  onUpdateProgress: (callback: (progress: { percent: number }) => void) => ipcRenderer.on('update-progress', (_event, progress) => callback(progress)),
  onUpdateDownloaded: (callback: (info: any) => void) => ipcRenderer.on('update-downloaded', (_event, info) => callback(info)),
  
  // 版本號相關
  onVersion: (callback: (version: string) => void) => ipcRenderer.on('version', (_event, version) => callback(version)),
  
  // 其他消息
  onMainMessage: (callback: (message: string) => void) => ipcRenderer.on('main-process-message', (_event, message) => callback(message))
})
