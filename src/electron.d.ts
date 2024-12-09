interface ElectronAPI {
  checkForUpdate: () => void
  quitAndInstall: () => void
  onUpdateChecking: (callback: () => void) => void
  onUpdateAvailable: (callback: (info: any) => void) => void
  onUpdateNotAvailable: (callback: (info: any) => void) => void
  onUpdateError: (callback: (error: string) => void) => void
  onUpdateProgress: (callback: (progress: { percent: number }) => void) => void
  onUpdateDownloaded: (callback: (info: any) => void) => void
  onMainMessage: (callback: (message: string) => void) => void
}

declare interface Window {
  electronAPI: ElectronAPI
}