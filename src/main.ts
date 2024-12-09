import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/electron-vite.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://electron-vite.github.io" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div class="update-container">
      <button id="checkUpdate">檢查更新</button>
      <div id="updateStatus"></div>
      <div id="updateProgress" style="display: none">
        <progress id="progressBar" value="0" max="100"></progress>
        <span id="progressText">0%</span>
      </div>
      <button id="installUpdate" style="display: none">安裝更新</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

// 更新相關的 DOM 元素
const checkUpdateBtn = document.getElementById('checkUpdate') as HTMLButtonElement
const updateStatus = document.getElementById('updateStatus') as HTMLDivElement
const updateProgress = document.getElementById('updateProgress') as HTMLDivElement
const progressBar = document.getElementById('progressBar') as HTMLProgressElement
const progressText = document.getElementById('progressText') as HTMLSpanElement
const installUpdateBtn = document.getElementById('installUpdate') as HTMLButtonElement

// 檢查更新按鈕點擊事件
checkUpdateBtn.addEventListener('click', () => {
  window.ipcRenderer.send('check-for-update')
  updateStatus.textContent = '正在檢查更新...'
})

// 安裝更新按鈕點擊事件
installUpdateBtn.addEventListener('click', () => {
  window.ipcRenderer.send('quit-and-install')
})

// 監聽更新事件
window.ipcRenderer.on('update-checking', () => {
  updateStatus.textContent = '正在檢查更新...'
})

window.ipcRenderer.on('update-available', (_event, info) => {
  updateStatus.textContent = `發現新版本: ${info.version}`
  updateProgress.style.display = 'block'
})

window.ipcRenderer.on('update-not-available', () => {
  updateStatus.textContent = '目前已是最新版本'
  updateProgress.style.display = 'none'
})

window.ipcRenderer.on('update-error', (_event, error) => {
  updateStatus.textContent = `更新錯誤: ${error}`
  updateProgress.style.display = 'none'
})

window.ipcRenderer.on('update-progress', (_event, progressObj) => {
  const percent = Math.round(progressObj.percent)
  progressBar.value = percent
  progressText.textContent = `${percent}%`
  updateStatus.textContent = `正在下載更新: ${percent}%`
})

window.ipcRenderer.on('update-downloaded', () => {
  updateStatus.textContent = '更新已下載完成'
  updateProgress.style.display = 'none'
  installUpdateBtn.style.display = 'block'
})

// 原有的主進程消息監聽
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
