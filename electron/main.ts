import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'

// 添加這行配置
autoUpdater.autoDownload = false
autoUpdater.allowDowngrade = true
autoUpdater.allowPrerelease = true
autoUpdater.requireExactVersion = false

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// 添加更新檢查函數
function checkForUpdates() {
  autoUpdater.checkForUpdates()
}

// 設置自動更新事件監聽
function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    win?.webContents.send('update-checking')
  })

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('update-available', info)
    // 手動下載更新
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-not-available', (info) => {
    win?.webContents.send('update-not-available', info)
  })

  autoUpdater.on('error', (err) => {
    win?.webContents.send('update-error', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    win?.webContents.send('update-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    win?.webContents.send('update-downloaded', info)
  })

  // 設置 IPC 監聽器
  ipcMain.on('check-for-update', () => {
    checkForUpdates()
  })

  ipcMain.on('quit-and-install', () => {
    autoUpdater.quitAndInstall()
  })
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  })

  win.webContents.on('did-finish-load', () => {
    // 發送版本號
    win?.webContents.send('version', app.getVersion())
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
  
  // 在開發環境下不檢查更新
  if (!VITE_DEV_SERVER_URL) {
    checkForUpdates()
  }
})
