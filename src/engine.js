/**
 * ChuangBTI 评分引擎 — 6 轴双极欧氏距离
 * 纯函数，无 DOM 依赖。
 */

/**
 * 按轴累加用户答案 → 6 维向量
 * @param {Object} answers   { q_act_1: 1, q_act_2: -1, ... }
 * @param {Array}  questions 题目定义 [{ id, axis, ... }]
 * @param {Array}  axisOrder ['ACT','RISK','TEAM','AI','SHOW','DRIVE']
 * @returns {Object}         { ACT: 3, RISK: -2, ... }
 */
export function calcAxisScores(answers, questions, axisOrder) {
  const raw = {}
  const maxAbs = {}
  for (const ax of axisOrder) { raw[ax] = 0; maxAbs[ax] = 0 }
  for (const q of questions) {
    const v = answers[q.id]
    if (v == null) continue
    raw[q.axis] = (raw[q.axis] || 0) + v
    const optMax = Math.max(...q.options.map((o) => Math.abs(o.value)))
    maxAbs[q.axis] = (maxAbs[q.axis] || 0) + optMax
  }
  // 归一化到 -4..+4 以匹配人格坐标
  const scores = {}
  for (const ax of axisOrder) {
    scores[ax] = maxAbs[ax] > 0 ? +((raw[ax] / maxAbs[ax]) * 4).toFixed(2) : 0
  }
  return scores
}

/**
 * 欧氏距离
 * @param {Object} userScores  { ACT: 3, ... }
 * @param {Array}  coords      [3, 2, 0, -2, 0, -4]
 * @param {Array}  axisOrder   轴顺序（决定 coords 索引对应关系）
 * @returns {number}
 */
export function euclideanDistance(userScores, coords, axisOrder) {
  let sum = 0
  for (let i = 0; i < axisOrder.length; i++) {
    const diff = (userScores[axisOrder[i]] ?? 0) - coords[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

/**
 * FLEX 触发：每根轴绝对值都 ≤ 阈值
 */
export function isFlex(userScores, axisOrder, thresholdAbs = 1) {
  return axisOrder.every((ax) => Math.abs(userScores[ax] ?? 0) <= thresholdAbs)
}

/**
 * 主判定函数
 * @param {Object} userScores   { ACT: ..., RISK: ..., ... }
 * @param {Array}  axisOrder
 * @param {Array}  standardTypes types.json 的 standard 数组
 * @param {Array}  specialTypes  types.json 的 special 数组（含 FLEX）
 * @param {Object} options       { maxDistance, flexThresholdAbs }
 * @returns {{ primary, axisScores, mode }}
 */
export function determineResult(userScores, axisOrder, standardTypes, specialTypes, options = {}) {
  const { maxDistance = 19.6, flexThresholdAbs = 1 } = options

  if (isFlex(userScores, axisOrder, flexThresholdAbs)) {
    const flex = specialTypes.find((t) => t.code === 'FLEX')
    if (flex) {
      return { primary: { ...flex, similarity: 100 }, axisScores: userScores, mode: 'flex' }
    }
  }

  let best = null
  let bestD = Infinity
  for (const t of standardTypes) {
    const d = euclideanDistance(userScores, t.coords, axisOrder)
    if (d < bestD) {
      bestD = d
      best = t
    }
  }
  const similarity = Math.max(0, Math.round((1 - bestD / maxDistance) * 100))
  return {
    primary: { ...best, similarity, distance: bestD },
    axisScores: userScores,
    mode: 'normal',
  }
}
