import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import fs from 'node:fs'

// 添加這行配置
autoUpdater.autoDownload = false
autoUpdater.allowDowngrade = true
autoUpdater.allowPrerelease = true

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let updateWindow: BrowserWindow | null

// 清理更新緩存
function clearUpdateCache() {
  const appName = 'com.nick-vsx.test-auto-update'
  const cachesPaths = [
    path.join(app.getPath('home'), 'Library/Caches', appName),
    path.join(app.getPath('home'), 'Library/Caches', `${appName}.ShipIt`)
  ]

  cachesPaths.forEach(cachePath => {
    try {
      if (fs.existsSync(cachePath)) {
        console.log(`Clearing cache at: ${cachePath}`)
        fs.rmSync(cachePath, { recursive: true, force: true })
      }
    } catch (error) {
      console.error(`Failed to clear cache at ${cachePath}:`, error)
    }
  })
}

// 創建更新確認視窗
function createUpdateWindow() {
  if (updateWindow) return; // 如果已經存在就不再創建

  updateWindow = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist-electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: false,
    resizable: false,
    center: true
  })

  if (VITE_DEV_SERVER_URL) {
    updateWindow.loadURL(`${VITE_DEV_SERVER_URL}update.html`)
  } else {
    updateWindow.loadFile(path.join(RENDERER_DIST, 'update.html'))
  }

  updateWindow.on('closed', () => {
    updateWindow = null
  })
}

// 檢查更新
function checkForUpdates() {
  // 清除緩存
  clearUpdateCache()
  
  // 清除應用程序的 HTTP 緩存
  if (win?.webContents) {
    win.webContents.session.clearCache()
    win.webContents.session.clearStorageData({
      storages: ['cachestorage', 'shadercache', 'localstorage']
    })
  }
  autoUpdater.checkForUpdates()
}

// 設置自動更新事件監聽
function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    console.log('checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('update available:', info.version)
    createUpdateWindow() // 只在發現更新時創建視窗
    // 等待視窗加載完成後再發送更新信息
    updateWindow?.webContents.on('did-finish-load', () => {
      updateWindow?.webContents.send('update-available', info)
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('update not available')
    createWindow()
  })

  autoUpdater.on('error', (err) => {
    console.error('update error:', err)
    if (!win) createWindow()
  })

  autoUpdater.on('download-progress', (progressObj) => {
    if (updateWindow) {
      updateWindow.webContents.send('update-progress', progressObj)
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    if (updateWindow) {
      updateWindow.webContents.send('update-downloaded', info)
    }
  })

  // 設置 IPC 監聽器
  ipcMain.on('start-download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.on('skip-update', () => {
    if (updateWindow) {
      updateWindow.close()
      updateWindow = null
    }
    createWindow()
  })
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist-electron/preload.js'),
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
    updateWindow = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  if (!VITE_DEV_SERVER_URL) {
    setupAutoUpdater()
    checkForUpdates()
  } else {
    createWindow()
  }
})
