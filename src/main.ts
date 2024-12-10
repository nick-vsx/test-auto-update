import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/electron-vite.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://electron-vite.github.io" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>施展更新法術成功了！</h1>
    <div class="version-info">
      Version: <span id="version">1.0.0</span>
    </div>
    <div class="update-container">
      <div id="updateStatus"></div>
      <div id="updateProgress" style="display: none">
        <progress id="progressBar" value="0" max="100"></progress>
        <div id="downloadInfo"></div>
      </div>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

// 更新相關的 DOM 元素
const updateStatus = document.getElementById('updateStatus') as HTMLDivElement
const updateProgress = document.getElementById('updateProgress') as HTMLDivElement
const progressBar = document.getElementById('progressBar') as HTMLProgressElement
const downloadInfo = document.getElementById('downloadInfo') as HTMLDivElement

// 監聽更新事件
window.electronAPI.onUpdateChecking(() => {
  updateStatus.textContent = '正在檢查更新...'
})

window.electronAPI.onUpdateAvailable((info) => {
  updateStatus.textContent = `發現新版本: ${info.version}`
  updateProgress.style.display = 'block'
})

window.electronAPI.onUpdateNotAvailable(() => {
  updateStatus.textContent = '目前已是最新版本'
  updateProgress.style.display = 'none'
})

window.electronAPI.onUpdateError((error) => {
  updateStatus.textContent = `更新錯誤: ${error}`
  updateProgress.style.display = 'none'
})

window.electronAPI.onUpdateProgress((progressObj) => {
  const percent = Math.round(progressObj.percent)
  const speed = (progressObj.bytesPerSecond / (1024 * 1024)).toFixed(2)
  const transferred = (progressObj.transferred / (1024 * 1024)).toFixed(2)
  const total = (progressObj.total / (1024 * 1024)).toFixed(2)

  progressBar.value = percent
  updateStatus.textContent = `正在下載更新: ${percent}%`
  downloadInfo.textContent = `${speed} MB/s (${transferred}MB / ${total}MB)`
})

window.electronAPI.onUpdateDownloaded(() => {
  updateStatus.textContent = '更新已下載完成'
  updateProgress.style.display = 'none'
  window.electronAPI.quitAndInstall() // 安裝更新
})

// 顯示版本號
window.electronAPI.onVersion((version) => {
  const versionElement = document.getElementById('version')
  if (versionElement) {
    versionElement.textContent = version
  }
})

// 原有的主進程消息監聽
window.electronAPI.onMainMessage((message) => {
  console.log(message)
})
