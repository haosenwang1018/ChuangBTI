/**
 * 6 轴双极条形图 — Canvas API，无外部依赖
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Object} axisScores { ACT: 3, RISK: -2, ... }
 * @param {Array}  axisOrder  ['ACT','RISK',...]
 * @param {Object} axisDefs   dimensions.json 的 definitions
 */
export function drawBipolarBars(canvas, axisScores, axisOrder, axisDefs) {
  const dpr = window.devicePixelRatio || 1
  const W = 360
  const rowH = 44
  const H = rowH * axisOrder.length + 16
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, W, H)

  const labelW = 72
  const trackX = labelW
  const trackW = W - labelW - 16
  const midX = trackX + trackW / 2
  const maxAbs = 4
  const unit = trackW / 2 / maxAbs

  ctx.font = '600 13px system-ui, "PingFang SC", sans-serif'
  ctx.textBaseline = 'middle'

  axisOrder.forEach((ax, i) => {
    const def = axisDefs[ax]
    const score = axisScores[ax] ?? 0
    const cy = 16 + i * rowH

    // 负端标签
    ctx.fillStyle = '#6b7b6e'
    ctx.textAlign = 'right'
    ctx.fillText(def?.negLabel || '', labelW - 8, cy + rowH / 2 - 2)

    // 正端标签
    ctx.textAlign = 'left'
    ctx.fillText(def?.posLabel || '', W - 12, cy + rowH / 2 - 2)

    // 轴名
    ctx.font = '500 11px system-ui, "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#aab8ac'
    ctx.fillText(def?.name || ax, midX, cy + 4)
    ctx.font = '600 13px system-ui, "PingFang SC", sans-serif'

    // 轨道
    const trackCy = cy + rowH / 2 + 8
    ctx.fillStyle = '#e8f0ea'
    ctx.fillRect(trackX, trackCy - 4, trackW, 8)

    // 中线
    ctx.fillStyle = '#aab8ac'
    ctx.fillRect(midX - 1, trackCy - 8, 2, 16)

    // 填充条
    const filled = score * unit
    ctx.fillStyle = '#4c6752'
    if (score >= 0) {
      ctx.fillRect(midX, trackCy - 4, filled, 8)
    } else {
      ctx.fillRect(midX + filled, trackCy - 4, -filled, 8)
    }

    // 点
    ctx.beginPath()
    ctx.arc(midX + filled, trackCy, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#2c3e2d'
    ctx.fill()
  })
}
