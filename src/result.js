import { drawBipolarBars } from './chart.js'
import { generateShareImage } from './share.js'

export function renderResult(result, axisScores, axisOrder, axisDefs, config) {
  const { primary } = result
  const ui = config.display?.ui || {}

  document.getElementById('result-kicker').textContent = ui.resultKicker || '你的创业者人格'
  document.getElementById('result-code').textContent = primary.code
  document.getElementById('result-name').textContent = primary.cn
  document.getElementById('result-intro').textContent = primary.intro || ''
  document.getElementById('result-desc').textContent = primary.desc || ''

  const img = document.getElementById('result-image')
  if (primary.image) {
    img.src = primary.image
    img.alt = `${primary.code} · ${primary.cn}`
    img.style.display = ''
  } else {
    img.style.display = 'none'
  }

  const title = document.getElementById('axis-section-title')
  if (title && ui.axisSectionTitle) title.textContent = ui.axisSectionTitle

  const canvas = document.getElementById('axis-chart')
  drawBipolarBars(canvas, axisScores, axisOrder, axisDefs)

  const disclaimerEl = document.getElementById('disclaimer')
  disclaimerEl.innerHTML = config.display?.funNote || ''

  const btnDownload = document.getElementById('btn-download')
  btnDownload.onclick = () => {
    generateShareImage(primary, axisScores, axisOrder, axisDefs, config)
  }

  const btnAgent = document.getElementById('btn-agent')
  btnAgent.onclick = () => {
    const cmd = 'git clone https://github.com/haosenwang1018/ChuangBTI.git && cd ChuangBTI && npm install && npm run dev'
    navigator.clipboard.writeText(cmd).then(() => {
      btnAgent.textContent = '已复制!'
      setTimeout(() => { btnAgent.textContent = '复制一键部署命令' }, 2000)
    })
  }
}
