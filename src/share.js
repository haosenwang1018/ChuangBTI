/**
 * 生成分享图片 — 人格大图 + 金句 + 6 轴条形图
 */

/**
 * @param {Object} primary    { code, cn, intro, image }
 * @param {Object} axisScores { ACT: ..., ... }
 * @param {Array}  axisOrder
 * @param {Object} axisDefs
 * @param {Object} config
 */
export async function generateShareImage(primary, axisScores, axisOrder, axisDefs, config) {
  const ui = config?.display?.ui || {}
  const dpr = 2
  const W = 720
  const H = 1040
  const canvas = document.createElement('canvas')
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  ctx.fillStyle = '#f0f4f1'
  ctx.fillRect(0, 0, W, H)

  const cardX = 32, cardY = 32, cardW = W - 64, cardH = H - 64
  roundRect(ctx, cardX, cardY, cardW, cardH, 20)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  let y = cardY + 48

  ctx.textAlign = 'center'
  ctx.font = '400 22px system-ui, "PingFang SC", sans-serif'
  ctx.fillStyle = '#6b7b6e'
  ctx.fillText(ui.resultKicker || '你的创业者人格', W / 2, y)
  y += 40

  // 人格大图
  if (primary.image) {
    try {
      const img = await loadImage(primary.image)
      const imgSize = 280
      ctx.drawImage(img, W / 2 - imgSize / 2, y, imgSize, imgSize)
      y += imgSize + 24
    } catch (e) {
      // 图加载失败不阻塞，留空
      y += 20
    }
  }

  ctx.font = '900 64px system-ui, "PingFang SC", sans-serif'
  ctx.fillStyle = '#4c6752'
  ctx.fillText(primary.code, W / 2, y)
  y += 40

  ctx.font = '600 30px system-ui, "PingFang SC", sans-serif'
  ctx.fillStyle = '#2c3e2d'
  ctx.fillText(primary.cn, W / 2, y)
  y += 40

  ctx.font = 'italic 500 20px system-ui, "PingFang SC", sans-serif'
  ctx.fillStyle = '#6b7b6e'
  const introLines = wrapText(ctx, primary.intro || '', cardW - 80)
  for (const line of introLines) {
    ctx.fillText(line, W / 2, y)
    y += 28
  }
  y += 24

  // 6 轴条形图
  ctx.textAlign = 'left'
  const rowH = 56
  const barX = cardX + 48
  const barEnd = cardX + cardW - 48
  const labelW = 80
  const trackX = barX + labelW
  const trackEndX = barEnd - labelW
  const trackW = trackEndX - trackX
  const midX = trackX + trackW / 2
  const maxAbs = 4
  const unit = trackW / 2 / maxAbs

  for (const ax of axisOrder) {
    const def = axisDefs[ax]
    const score = axisScores[ax] ?? 0

    ctx.font = '600 16px system-ui, "PingFang SC", sans-serif'
    ctx.fillStyle = '#6b7b6e'
    ctx.textAlign = 'right'
    ctx.fillText(def?.negLabel || '', trackX - 12, y + 8)
    ctx.textAlign = 'left'
    ctx.fillText(def?.posLabel || '', trackEndX + 12, y + 8)
    ctx.textAlign = 'center'
    ctx.font = '500 13px system-ui, "PingFang SC", sans-serif'
    ctx.fillStyle = '#aab8ac'
    ctx.fillText(def?.name || ax, midX, y - 10)

    const trackCy = y + 8
    ctx.fillStyle = '#e8f0ea'
    ctx.fillRect(trackX, trackCy - 5, trackW, 10)
    ctx.fillStyle = '#aab8ac'
    ctx.fillRect(midX - 1, trackCy - 10, 2, 20)
    ctx.fillStyle = '#4c6752'
    const filled = score * unit
    if (score >= 0) ctx.fillRect(midX, trackCy - 5, filled, 10)
    else ctx.fillRect(midX + filled, trackCy - 5, -filled, 10)
    ctx.beginPath()
    ctx.arc(midX + filled, trackCy, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#2c3e2d'
    ctx.fill()

    y += rowH
  }

  ctx.textAlign = 'center'
  ctx.font = '400 16px system-ui, "PingFang SC", sans-serif'
  ctx.fillStyle = '#aab8ac'
  ctx.fillText(ui.shareWatermark || 'ChuangBTI · 仅供娱乐', W / 2, H - cardY - 24)

  const link = document.createElement('a')
  link.download = `ChuangBTI-${primary.code}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, maxWidth) {
  if (!text) return []
  const lines = []
  let line = ''
  for (const char of text) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}
