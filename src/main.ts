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
    <h1>更新！更新！更新！</h1>
    <div class="version-info">
      Version: <span id="version">1.0.0</span>
    </div>
    <div class="update-container">
      <div id="updateStatus"></div>
      <div id="updateProgress" style="display: none">
        <progress id="progressBar" value="0" max="100"></progress>
      </div>
      <button id="installUpdate" style="display: none">安裝更新</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

// 更新相關的 DOM 元素
// const checkUpdateBtn = document.getElementById('checkUpdate') as HTMLButtonElement
const updateStatus = document.getElementById('updateStatus') as HTMLDivElement
const updateProgress = document.getElementById('updateProgress') as HTMLDivElement
const progressBar = document.getElementById('progressBar') as HTMLProgressElement
const installUpdateBtn = document.getElementById('installUpdate') as HTMLButtonElement

// 檢查更新按鈕點擊事件
// checkUpdateBtn.addEventListener('click', () => {
//   window.electronAPI.checkForUpdate()
//   updateStatus.textContent = '正在檢查更新...'
// })

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
  progressBar.value = percent
  updateStatus.textContent = `正在下載更新: ${percent}%`
})

window.electronAPI.onUpdateDownloaded(() => {
  updateStatus.textContent = '更新已下載完成'
  updateProgress.style.display = 'none'
  installUpdateBtn.style.display = 'block'
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
