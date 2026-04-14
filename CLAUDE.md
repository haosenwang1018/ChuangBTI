# ChuangBTI

创始人人格测试，25 个人格 + 6 轴双极引擎。

## 开发
- `npm install` 装依赖
- `npm run dev` 启动 Vite（默认 5180 端口）
- `npm run build` 打包到 `dist/`
- `npm run test` 跑引擎自测（node:test）

## 架构
- `data/*.json` — 测试数据（轴/题/人格/配置）
- `src/engine.js` — 纯函数：双极累加 → 欧氏距离 → FLEX 方差检测
- `src/chart.js` — Canvas 双极条形图
- `src/quiz.js` — 答题流程
- `src/result.js` — 结果页渲染（含人格大图）
- `src/share.js` — 分享卡生成
- `public/personas/{CODE}.png` — 25 张人格图

## 改动原则
- 所有人格、题目、轴定义都在 `data/`，优先改数据不改代码
- 引擎输入输出是纯数据，修改时先跑 `npm run test`
