// src/engine.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcAxisScores, euclideanDistance, isFlex, determineResult } from './engine.js'

const AXES = ['ACT', 'RISK', 'TEAM', 'AI', 'SHOW', 'DRIVE']

test('calcAxisScores 按题选项最大绝对值归一化到 -4..+4', () => {
  const mkOpts = (vals) => vals.map((v) => ({ value: v }))
  const qs = [
    { id: 'q1', axis: 'ACT', options: mkOpts([-2, -1, 1, 2]) },
    { id: 'q2', axis: 'ACT', options: mkOpts([-2, -1, 1, 2]) },
    { id: 'q3', axis: 'RISK', options: mkOpts([-2, -1, 1, 2]) },
  ]
  // 全选满分正端
  const s1 = calcAxisScores({ q1: 2, q2: 2, q3: 2 }, qs, AXES)
  assert.equal(s1.ACT, 4)
  assert.equal(s1.RISK, 4)
  // 对冲
  const s2 = calcAxisScores({ q1: 2, q2: -2, q3: 1 }, qs, AXES)
  assert.equal(s2.ACT, 0)
  assert.equal(s2.RISK, 2)
  assert.equal(s2.TEAM, 0)
})

test('euclideanDistance 0 距离当完全对齐', () => {
  const u = { ACT: 3, RISK: 2, TEAM: 0, AI: -2, SHOW: 0, DRIVE: -4 }
  const d = euclideanDistance(u, [3, 2, 0, -2, 0, -4], AXES)
  assert.equal(d, 0)
})

test('isFlex 所有轴 |score|≤1 时返回 true', () => {
  assert.equal(isFlex({ ACT: 1, RISK: -1, TEAM: 0, AI: 0, SHOW: 1, DRIVE: -1 }, AXES, 1), true)
  assert.equal(isFlex({ ACT: 2, RISK: 0, TEAM: 0, AI: 0, SHOW: 0, DRIVE: 0 }, AXES, 1), false)
})

test('determineResult 选出最近人格', () => {
  const standard = [
    { code: 'FIRE', cn: '燃烧者', coords: [3, 2, 0, -2, 0, -4] },
    { code: 'WAIT', cn: '等风者', coords: [-4, -3, -1, 0, -1, 0] },
  ]
  const special = [{ code: 'FLEX', cn: '变色龙' }]
  const u = { ACT: 3, RISK: 2, TEAM: 0, AI: -2, SHOW: 0, DRIVE: -4 }
  const r = determineResult(u, AXES, standard, special, { flexThresholdAbs: 1 })
  assert.equal(r.primary.code, 'FIRE')
  assert.equal(r.mode, 'normal')
  assert.equal(r.primary.similarity, 100)
})

test('determineResult 低得分触发 FLEX', () => {
  const standard = [{ code: 'FIRE', coords: [3, 2, 0, -2, 0, -4] }]
  const special = [{ code: 'FLEX', cn: '变色龙' }]
  const u = { ACT: 1, RISK: 0, TEAM: 0, AI: 1, SHOW: -1, DRIVE: 0 }
  const r = determineResult(u, AXES, standard, special, { flexThresholdAbs: 1 })
  assert.equal(r.primary.code, 'FLEX')
  assert.equal(r.mode, 'flex')
})
