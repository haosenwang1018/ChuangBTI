# ChuangBTI · 创始人人格整活测试

> **ChuangBTI**：面向创始人群体的整活向「创投圈脑回路」测评——**与 MBTI 完全无关**，语境锁定在融资、条款、联创、路演、对账与死线；创始人特供调侃版，仅供娱乐，与任何临床/职业鉴定无关。

一个开源的娱乐性人格测试项目，基于 B站UP主 [@蛆肉儿串儿](https://space.bilibili.com/417038183) 的原创测试。

Remixed by [Koutian Wu](https://ktwu01.github.io/)

## 在线体验

若已为仓库开启 GitHub Pages，可访问：**[https://ktwu01.github.io/ChuangBTI/](https://ktwu01.github.io/ChuangBTI/)**（与 `vite.config.js` 中 `base` 及部署目录一致即可）。

## 特性

- **25 种创业者人格** — 覆盖驱力型、风格型、AI 风格型、叙事型
- **6 根双极轴** — 行动 / 风险 / 协作 / AI / 叙事 / 驱动源
- **欧氏距离匹配** — 24 题 → 6 维向量 → 最近人格
- **FLEX 特殊触发** — 所有轴得分都接近 0 时判为变色龙
- **人格大图** — 每个结果带专属插画
- **移动端优先** — 响应式布局
- **易于定制** — 数据都在 `data/*.json`

## 项目结构

```
├── data/
│   ├── dimensions.json   # 6 轴定义
│   ├── questions.json    # 24 题
│   ├── types.json        # 25 人格 + 6 维坐标
│   └── config.json       # UI 文案、评分参数
├── public/personas/      # 25 张人格图
├── src/
│   ├── engine.js         # 双极累加 + 欧氏距离 + FLEX
│   ├── engine.test.mjs   # node:test 自测
│   ├── chart.js          # 双极条形图（Canvas）
│   ├── quiz.js           # 答题流程
│   ├── result.js         # 结果页渲染（含人格大图）
│   ├── share.js          # 分享卡生成
│   └── main.js           # 入口
└── docs/
    ├── personas.md       # 25 人格定义原文
    └── superpowers/      # 设计 spec + 实施计划
```

## 快速开始

**请使用 Vite 开发服务器**（不要直接双击打开 `index.html`，否则模块与路径容易404）。

```bash
git clone https://github.com/ktwu01/ChuangBTI.git
cd ChuangBTI

npm install
npm run dev
```

浏览器打开终端里提示的本地地址（本项目默认可用 `http://localhost:5180/`；可用 `VITE_DEV_PORT=端口 npm run dev` 覆盖）。

```bash
# 构建生产版本（输出 dist/，部署时只上传 dist 内文件）
npm run build

# 若站点必须挂在固定子路径（如仅支持 /ChuangBTI/ 绝对前缀）
npm run build:subdir
```

## 部署

### GitHub Pages

将 **`npm run build` 生成的 `dist/` 目录内容** 作为站点根目录发布（不要只上传带 `src/` 的源码，否则浏览器找不到打包后的 JS/CSS）。

### Vercel / Netlify

连接本仓库，构建命令 `npm run build`，输出目录 `dist`。

### 手动部署

```bash
npm run build
# 将 dist/ 目录部署到任何静态服务器
```

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- 原生 JavaScript — 无框架依赖
- Canvas API — 雷达图与分享图
- CSS Custom Properties — 主题化

## 致谢

- 原创测试：B站UP主 [@蛆肉儿串儿](https://space.bilibili.com/417038183)（UID: 417038183）
- 原版活动：[B站活动页（原 SBTI 企划）](https://www.bilibili.com/blackboard/era/VxiCX2CRqcqzPK9F.html)

## 声明

本测试仅供娱乐，请勿用于任何严肃场景。本项目为开源二创，如有侵权请联系删除。

## License

[MIT](LICENSE)
