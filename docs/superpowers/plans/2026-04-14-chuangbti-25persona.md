# ChuangBTI 25 人格重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ChuangBTI 从 15 维 L/M/H 引擎重构为 6 轴双极欧氏距离引擎 + 25 个新人格 + 带人格大图的轻量结果页。

**Architecture:** 数据驱动（`data/*.json`）+ 纯函数引擎（`src/engine.js`）。替换 dimensions / questions / types / config 四个 JSON，重写 engine/chart，改造 result/share 两个渲染器，删除酒局彩蛋与 TOP5 列表。

**Tech Stack:** Vite 6、原生 ES Module、Canvas API、node:test（零依赖自测）。

**参考 Spec:** `docs/superpowers/specs/2026-04-14-chuangbti-25persona-design.md`

---

## Task 1: 生成 CLAUDE.md（claude init 手动版）

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: 写入仓库说明**

```markdown
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
```

- [ ] **Step 2: 提交**

```bash
git add CLAUDE.md
git commit -m "docs: 加 CLAUDE.md 项目指引"
```

---

## Task 2: 重写 `data/dimensions.json`（6 轴双极）

**Files:**
- Modify: `data/dimensions.json`（全量覆盖）

- [ ] **Step 1: 写入新内容**

```json
{
  "order": ["ACT", "RISK", "TEAM", "AI", "SHOW", "DRIVE"],
  "definitions": {
    "ACT": {
      "name": "行动轴",
      "negLabel": "思考",
      "posLabel": "执行",
      "desc": "面对问题，你更偏向先想清楚还是先做出来"
    },
    "RISK": {
      "name": "风险轴",
      "negLabel": "稳健",
      "posLabel": "激进",
      "desc": "下注时你更偏向保底还是 all in"
    },
    "TEAM": {
      "name": "协作轴",
      "negLabel": "单干",
      "posLabel": "控场",
      "desc": "做事你更偏向一个人推进还是带团队"
    },
    "AI": {
      "name": "AI 浓度",
      "negLabel": "低依赖",
      "posLabel": "高依赖",
      "desc": "AI 在你日常工作里占多大比重"
    },
    "SHOW": {
      "name": "叙事欲",
      "negLabel": "低调",
      "posLabel": "聚光灯",
      "desc": "你多愿意把自己和项目讲给别人听"
    },
    "DRIVE": {
      "name": "驱动源",
      "negLabel": "内驱",
      "posLabel": "外驱",
      "desc": "你更多是被热爱/使命推着走，还是被证明/财富推着走"
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add data/dimensions.json
git commit -m "feat(data): 改为 6 轴双极定义"
```

---

## Task 3: 重写 `data/types.json`（25 人格 + 6 维坐标）

**Files:**
- Modify: `data/types.json`（全量覆盖）

- [ ] **Step 1: 写入全部 25 个人格**

每个人格包含 `code / cn / intro / desc / coords / image`。`coords` 顺序严格对应 `dimensions.json` 的 `order`（ACT, RISK, TEAM, AI, SHOW, DRIVE）。`image` 路径使用相对 `/personas/{CODE}.png`（Vite 会把 `public/` 下文件映射到根）。

```json
{
  "standard": [
    { "code": "FIRE", "cn": "燃烧者", "intro": "我不是想创业，我是不做会难受。", "desc": "你不是在\"选择创业\"，你是在被某种东西持续点燃。别人下班是休息，你下班是开始；别人需要动力，你需要的是\"停下来\"。你对\"做成一件事\"的渴望像低频噪音，一直在脑子里嗡。哪怕失败、哪怕亏钱，只要还在做，你就还在呼吸。对你来说，创业不是选项，是症状。", "coords": [3, 2, 0, -2, 0, -4], "image": "/personas/FIRE.png" },
    { "code": "PROV", "cn": "证明者", "intro": "我一定要证明他们当初看错我。", "desc": "你不是在做公司，你是在写一封很长的\"回信\"。对象可能是曾经否定你的人、错过你的机会，甚至是过去那个不被看好的自己。每一次推进、每一个里程碑，都是在说一句：\"你看错了。\"你可以很冷静，也可以很极端，但底层驱动力永远带着一点不服气。你不只是想赢，你是必须赢。", "coords": [3, 2, 0, 0, 1, 4], "image": "/personas/PROV.png" },
    { "code": "ALLIN", "cn": "全押者", "intro": "退路是给还没想清楚的人留的。", "desc": "你的人生像一场持续下注的牌局，而且你从不小注试探。辞职、all in、把时间和资源全部砸进去，对你来说不是勇气，是常态。你相信\"没有退路才有出路\"，也愿意为此承担所有代价。别人看到风险，你看到的是可能性；别人留后手，你直接把后手当燃料烧掉。", "coords": [4, 4, 0, 0, 1, 2], "image": "/personas/ALLIN.png" },
    { "code": "SAFE", "cn": "稳健派", "intro": "可以慢，但不能死。", "desc": "你不是不敢冒险，你只是对\"活下来\"这件事有执念。你会算账、控成本、留现金流，不轻易all in，但每一步都走得很稳。你可能不在风口最前，但也很少被风吹倒。对你来说，创业不是一场短跑，而是一场必须活到最后的耐力赛。", "coords": [1, -4, 0, -2, -2, -1], "image": "/personas/SAFE.png" },
    { "code": "LEAD", "cn": "控场者", "intro": "可以没资源，但不能没我。", "desc": "你是那种只要在场，局面就不会失控的人。团队乱了你来收，方向偏了你来拉，没人拍板你来定。你不是最温柔的，也不一定最讨喜，但你是\"必须在\"的那个角色。你更像一个系统，而不是个人——有你在，事情就能继续往前走。", "coords": [3, 1, 4, -1, 1, 0], "image": "/personas/LEAD.png" },
    { "code": "SOLO", "cn": "单干王", "intro": "人越少，事越快。", "desc": "你对\"人多力量大\"这句话始终存疑。你见过太多沟通成本、内耗和失控，所以宁愿自己多做一点，也不愿多一个变量。你擅长独立推进、快速决策、低依赖运转。对你来说，团队不是必须条件，效率才是。", "coords": [3, 0, -4, 1, -3, 0], "image": "/personas/SOLO.png" },
    { "code": "SHIP", "cn": "上线狂", "intro": "先做出来，再说对不对。", "desc": "你不相信完美，只相信\"已上线\"。别人还在讨论逻辑，你已经发了版本；别人还在纠结细节，你已经开始收反馈。你对不确定的唯一应对方式就是——先做。世界在你眼里只有两种状态：没做，和已经上线。", "coords": [4, 2, 0, 1, 0, -1], "image": "/personas/SHIP.png" },
    { "code": "TALK", "cn": "空谈家", "intro": "逻辑已经闭环，就差开始做了。", "desc": "你拥有极强的分析能力和表达能力，一切问题都可以被你讲清楚、讲透彻、讲到别人信服。但问题在于，事情往往停在\"讲清楚\"那一步。你不是不知道要做什么，而是一直在等一个\"更完美的开始\"。你的世界里，执行总是慢半拍。", "coords": [-3, 0, 0, 0, 2, 0], "image": "/personas/TALK.png" },
    { "code": "WAIT", "cn": "等风者", "intro": "再等等，现在还不是最佳时机。", "desc": "你对时机极度敏感，也极度谨慎。你相信\"顺势而为\"，但有时候这个\"势\"永远还没到。你会观察、分析、判断，但很少真正出手。你不是不想做，而是一直在等一个\"更确定\"的信号——只是那个信号可能一直不来。", "coords": [-4, -3, -1, 0, -1, 0], "image": "/personas/WAIT.png" },
    { "code": "LONG", "cn": "长线主义者", "intro": "慢一点，但要走到最后。", "desc": "你对短期波动免疫，对长期结果执着。你不追风口，不拼短期爆发，你更在意这件事能不能持续、能不能沉淀。别人三个月想结果，你愿意用三年换一个确定性。你走得不一定快，但很少掉头。", "coords": [1, -2, 0, -1, -2, -3], "image": "/personas/LONG.png" },
    { "code": "REAL", "cn": "现实主义者", "intro": "理想是理想，账是账。", "desc": "你对世界的理解非常清醒。你可以讲愿景，但不会沉迷；可以做梦，但会算钱。你尊重现金流、利润、成本这些\"无聊但真实\"的东西。你不反对理想，但你更清楚，没有现实支撑的理想，只是幻觉。", "coords": [2, -3, 0, -1, -3, 1], "image": "/personas/REAL.png" },
    { "code": "WILD", "cn": "狂野人生", "intro": "规则？那是别人走不通时用的。", "desc": "你对规则天然不信任。你更相信直觉、冲动和临场反应。你可能不按流程、不走常规，但往往能走出意料之外的路径。你不是反叛，你只是从一开始就不打算按别人设计好的路线走。", "coords": [3, 3, -1, 0, 1, 0], "image": "/personas/WILD.png" },
    { "code": "AIGC", "cn": "AI教徒", "intro": "能让AI做的，我一行字都不想写。", "desc": "你已经把AI当成默认生产力。写文案、做方案、改产品、想创意——先问AI再说。你不是不会做，而是觉得\"没必要自己做\"。你的核心能力，不是产出，而是调用。", "coords": [2, 0, 0, 4, 0, 0], "image": "/personas/AIGC.png" },
    { "code": "PROM", "cn": "氛围感工程师", "intro": "代码不会写，但prompt能写到融资级别。", "desc": "你可能不会写一行代码，但你能写出让AI\"理解你\"的prompt。你擅长描述、构建语境、调动模型的潜力。你更像一个\"导演\"，而AI是你的演员。输出不一定稳定，但一旦对了，效果惊人。", "coords": [2, 1, 0, 3, 1, 0], "image": "/personas/PROM.png" },
    { "code": "AUTO", "cn": "自动化者", "intro": "只要能自动，我就不手动。", "desc": "你对重复劳动有生理性厌恶。你会不断搭工具、写流程、连系统，只为让事情自动发生。你做的不是任务，而是系统。别人一天做10次，你让机器自动跑100次。", "coords": [3, -1, -1, 3, -2, -1], "image": "/personas/AUTO.png" },
    { "code": "CTRL", "cn": "AI拿捏者", "intro": "AI只是工具，关键是我怎么调教它。", "desc": "你不是在用AI，你是在\"驯化\"AI。你会拆解问题、设计流程、优化输入输出，让AI成为你系统的一部分。别人被AI带着走，你让AI按你的逻辑运行。你掌控工具，而不是被工具定义。", "coords": [3, 0, 2, 3, 0, 0], "image": "/personas/CTRL.png" },
    { "code": "LAZY", "cn": "AI偷懒者", "intro": "不是效率高，是懒到极致。", "desc": "你用AI的出发点很简单：少做一点。你不追求极致效果，只追求\"够用就行\"。你会快速生成、快速交付，然后继续下一件事。你不精细，但很快。", "coords": [2, 0, -2, 2, -3, 1], "image": "/personas/LAZY.png" },
    { "code": "FAKE", "cn": "人机", "intro": "全是AI写的，但看起来像我写的。", "desc": "你擅长\"伪装\"。你让AI写，再稍微改一改，让它看起来像人写的。你知道哪些地方需要\"加点人味\"，哪些地方可以直接用。你不是创作者，你是\"最后一层加工\"。", "coords": [2, 0, -1, 3, 0, 2], "image": "/personas/FAKE.png" },
    { "code": "FAST", "cn": "AI加速器", "intro": "别人一周，我一天靠AI搞完。", "desc": "你把AI当成效率放大器。你依然在思考、决策、推进，但AI帮你把时间压缩。你不是偷懒，而是提速。别人线性推进，你指数级加速。", "coords": [4, 1, 0, 4, 0, 0], "image": "/personas/FAST.png" },
    { "code": "HERO", "cn": "主角病", "intro": "这个故事必须以我为核心展开。", "desc": "你天然把自己放在叙事中心。产品、团队、公司，都像是你故事的一部分。你需要舞台，需要关注，需要\"我在做一件大事\"的感觉。你不只是想成功，你想被看到。", "coords": [2, 2, 2, 0, 4, 2], "image": "/personas/HERO.png" },
    { "code": "LUCK", "cn": "天选之子", "intro": "也没多努力，就是刚好踩中了。", "desc": "你的人生轨迹，总是带点\"刚好\"。刚好遇到对的人、刚好进对的赛道、刚好踩中机会。你不否认努力，但你更清楚，很多时候是运气在推你一把。", "coords": [1, 1, 0, 0, 2, 1], "image": "/personas/LUCK.png" },
    { "code": "RICH", "cn": "暴富者", "intro": "这波做完，我直接财富自由。", "desc": "你对\"翻身\"有强烈想象。你愿意吃苦、愿意拼，但内心一直有一个清晰画面：一波成了，彻底改变人生。你做的每一件事，都隐约带着\"这一把值不值\"的计算。", "coords": [2, 3, 0, 0, 2, 4], "image": "/personas/RICH.png" },
    { "code": "DEAD", "cn": "向死而生", "intro": "生命诚可贵，创业价更高。", "desc": "你对压力、风险甚至失败有一种近乎冷静的接受。你知道可能会很惨，但还是选择往前走。你不是不怕死，你只是觉得\"不做更难受\"。你在边缘状态里反而更清醒。", "coords": [1, 3, 0, -1, -4, -2], "image": "/personas/DEAD.png" },
    { "code": "SHOW", "cn": "表演家", "intro": "创业是为了登上更大的舞台。", "desc": "你享受表达、展示和被关注。路演、分享、社交媒体，对你来说不只是工具，是舞台。你知道如何讲故事、制造氛围、吸引目光。你做的不只是公司，也是一个持续展开的\"演出\"。", "coords": [2, 1, 1, 1, 4, 2], "image": "/personas/SHOW.png" }
  ],
  "special": [
    {
      "code": "FLEX",
      "cn": "变色龙",
      "intro": "原则是有的，但可以调整。",
      "desc": "你适应环境的能力极强。不同的人、不同的场景、不同的阶段，你都能迅速切换状态。你可以坚定，也可以妥协；可以激进，也可以保守。有人觉得你不够\"纯粹\"，但你知道，活下来比一致性更重要。",
      "image": "/personas/FLEX.png",
      "trigger": "6 根轴每根 |score| ≤ 1 时触发（无明显偏向）"
    }
  ]
}
```

- [ ] **Step 2: 校验 JSON 合法性**

运行：
```bash
node -e "JSON.parse(require('fs').readFileSync('data/types.json'))"
```
Expected: 无输出 = OK；报错则修正引号/逗号。

- [ ] **Step 3: 提交**

```bash
git add data/types.json
git commit -m "feat(data): 25 人格 + 6 维坐标"
```

---

## Task 4: 写 `data/questions.json`（24 题）

**Files:**
- Modify: `data/questions.json`（全量覆盖）

- [ ] **Step 1: 写入全部 24 题**

每题 3 选项，值 `-1 / 0 / +1`。`axis` 字段对应 `dimensions.json` 的 key。删除原 `main / special` 分组、饭局门控两题。

```json
{
  "questions": [
    {
      "id": "q_act_1", "axis": "ACT",
      "text": "看到一个产品 idea，你第一反应是？",
      "options": [
        { "label": "先列需求、画流程、评估可行性", "value": -1 },
        { "label": "大致想一下就开始打样", "value": 0 },
        { "label": "先发个 landing page/Demo 看市场反应", "value": 1 }
      ]
    },
    {
      "id": "q_act_2", "axis": "ACT",
      "text": "新功能完成度 70%，要不要上线？",
      "options": [
        { "label": "不行，得打磨到 95% 再说", "value": -1 },
        { "label": "看情况，核心路径稳就发", "value": 0 },
        { "label": "先发，线上反馈比我想的准", "value": 1 }
      ]
    },
    {
      "id": "q_act_3", "axis": "ACT",
      "text": "长期计划 vs 快速行动，你更偏哪边？",
      "options": [
        { "label": "先有 3 个月 roadmap 才踏实", "value": -1 },
        { "label": "有方向就行，具体周周调", "value": 0 },
        { "label": "边做边想，计划是做出来的", "value": 1 }
      ]
    },
    {
      "id": "q_act_4", "axis": "ACT",
      "text": "周末给自己留时间，你更可能？",
      "options": [
        { "label": "复盘 + 看书 + 写思考笔记", "value": -1 },
        { "label": "一半思考一半动手", "value": 0 },
        { "label": "直接开干做新东西", "value": 1 }
      ]
    },
    {
      "id": "q_risk_1", "axis": "RISK",
      "text": "账上还有 6 个月现金流，下一笔钱还没到位，你会？",
      "options": [
        { "label": "立刻砍成本、保底活着", "value": -1 },
        { "label": "一边省一边继续推新功能", "value": 0 },
        { "label": "梭哈增长、赌下一轮", "value": 1 }
      ]
    },
    {
      "id": "q_risk_2", "axis": "RISK",
      "text": "考虑要不要全职 all in 创业？",
      "options": [
        { "label": "留本职做副业，先验证", "value": -1 },
        { "label": "阶段性裸辞，也可能回头", "value": 0 },
        { "label": "辞职、卖资产、没有退路", "value": 1 }
      ]
    },
    {
      "id": "q_risk_3", "axis": "RISK",
      "text": "一个机会窗口期只有 2 周但风险很大，你？",
      "options": [
        { "label": "算账：期望值负我就放弃", "value": -1 },
        { "label": "拆小赌，下一部分资源", "value": 0 },
        { "label": "机会比风险重要，上", "value": 1 }
      ]
    },
    {
      "id": "q_risk_4", "axis": "RISK",
      "text": "黑天鹅来了（政策/友商/技术变了），你？",
      "options": [
        { "label": "先保命：收缩、等看清再说", "value": -1 },
        { "label": "一部分继续一部分转向", "value": 0 },
        { "label": "趁乱调结构，可能反而是机会", "value": 1 }
      ]
    },
    {
      "id": "q_team_1", "axis": "TEAM",
      "text": "理想的团队规模？",
      "options": [
        { "label": "1-2 人，多了就乱", "value": -1 },
        { "label": "3-8 人，小精悍", "value": 0 },
        { "label": "规模化，有分工有体系", "value": 1 }
      ]
    },
    {
      "id": "q_team_2", "axis": "TEAM",
      "text": "重大决策卡住时，你更可能？",
      "options": [
        { "label": "自己想清楚再说，不想开会", "value": -1 },
        { "label": "找 1-2 个关键人聊聊", "value": 0 },
        { "label": "召集团队，我来拍板", "value": 1 }
      ]
    },
    {
      "id": "q_team_3", "axis": "TEAM",
      "text": "招第一个 key hire，你更看重？",
      "options": [
        { "label": "自驱、能独立把一块吃下来", "value": -1 },
        { "label": "既能独立也能和我咬合", "value": 0 },
        { "label": "能执行我想清楚的方向", "value": 1 }
      ]
    },
    {
      "id": "q_team_4", "axis": "TEAM",
      "text": "联创和你意见不合，你？",
      "options": [
        { "label": "算了我自己做，少一个人省事", "value": -1 },
        { "label": "谁的领域听谁的", "value": 0 },
        { "label": "我来对齐到同一个方向", "value": 1 }
      ]
    },
    {
      "id": "q_ai_1", "axis": "AI",
      "text": "写一篇产品介绍，你会？",
      "options": [
        { "label": "亲手写，AI 最多查查资料", "value": -1 },
        { "label": "AI 起稿 + 我改", "value": 0 },
        { "label": "prompt 到位、AI 出稿直接用", "value": 1 }
      ]
    },
    {
      "id": "q_ai_2", "axis": "AI",
      "text": "要做一个 MVP 功能，你更可能？",
      "options": [
        { "label": "自己写代码/找工程师", "value": -1 },
        { "label": "AI 辅助编码，自己把关", "value": 0 },
        { "label": "全交给 Cursor/Claude Code，我只测结果", "value": 1 }
      ]
    },
    {
      "id": "q_ai_3", "axis": "AI",
      "text": "重复性任务（回邮件、做报表）你会？",
      "options": [
        { "label": "自己做，AI 不够稳", "value": -1 },
        { "label": "偶尔用 AI 提提效", "value": 0 },
        { "label": "必须做成自动化/AI pipeline", "value": 1 }
      ]
    },
    {
      "id": "q_ai_4", "axis": "AI",
      "text": "对 AI 在你工作中的定位，你更认同？",
      "options": [
        { "label": "辅助参考，核心还得人干", "value": -1 },
        { "label": "提效工具，能用就用", "value": 0 },
        { "label": "核心生产力，没它干不动", "value": 1 }
      ]
    },
    {
      "id": "q_show_1", "axis": "SHOW",
      "text": "做成一个小里程碑，你会？",
      "options": [
        { "label": "自己知道就行，埋头继续", "value": -1 },
        { "label": "在小圈子里分享下", "value": 0 },
        { "label": "发朋友圈/推特/小红书", "value": 1 }
      ]
    },
    {
      "id": "q_show_2", "axis": "SHOW",
      "text": "路演/公开讲话对你来说？",
      "options": [
        { "label": "折磨，能不上就不上", "value": -1 },
        { "label": "能上，准备充分就行", "value": 0 },
        { "label": "享受，舞台越大越兴奋", "value": 1 }
      ]
    },
    {
      "id": "q_show_3", "axis": "SHOW",
      "text": "有媒体想采访你，你？",
      "options": [
        { "label": "能推就推，我更想安静做事", "value": -1 },
        { "label": "看调性再定", "value": 0 },
        { "label": "来者不拒，曝光就是机会", "value": 1 }
      ]
    },
    {
      "id": "q_show_4", "axis": "SHOW",
      "text": "别人问起你在做啥，你更可能？",
      "options": [
        { "label": "随便说两句，转移话题", "value": -1 },
        { "label": "简短介绍一下", "value": 0 },
        { "label": "讲故事、画愿景、拉人入伙", "value": 1 }
      ]
    },
    {
      "id": "q_drive_1", "axis": "DRIVE",
      "text": "你为什么创业？",
      "options": [
        { "label": "真的热爱这件事，不做难受", "value": -1 },
        { "label": "既喜欢也想过上更好的生活", "value": 0 },
        { "label": "想证明自己 / 想赚大钱 / 想被看到", "value": 1 }
      ]
    },
    {
      "id": "q_drive_2", "axis": "DRIVE",
      "text": "凌晨两点还在干活，支撑你的是？",
      "options": [
        { "label": "事情本身有趣，停不下来", "value": -1 },
        { "label": "喜欢也有压力，混着的", "value": 0 },
        { "label": "不成功不罢休，必须赢", "value": 1 }
      ]
    },
    {
      "id": "q_drive_3", "axis": "DRIVE",
      "text": "想象成功后的画面，你最先看到？",
      "options": [
        { "label": "这件事自己长成了一个系统", "value": -1 },
        { "label": "团队、产品、用户都在", "value": 0 },
        { "label": "财富自由 / 被某些人看见 / 登上舞台", "value": 1 }
      ]
    },
    {
      "id": "q_drive_4", "axis": "DRIVE",
      "text": "如果这次创业失败了，你？",
      "options": [
        { "label": "再找下一个让我兴奋的事做", "value": -1 },
        { "label": "休息一下再说", "value": 0 },
        { "label": "马上再来一次，必须证明给他们看", "value": 1 }
      ]
    }
  ]
}
```

- [ ] **Step 2: 校验**

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('data/questions.json')); console.log(d.questions.length, '题'); const by={}; for(const q of d.questions) by[q.axis]=(by[q.axis]||0)+1; console.log(by);"
```
Expected:
```
24 题
{ ACT: 4, RISK: 4, TEAM: 4, AI: 4, SHOW: 4, DRIVE: 4 }
```

- [ ] **Step 3: 提交**

```bash
git add data/questions.json
git commit -m "feat(data): 24 题双极选项"
```

---

## Task 5: 重写 `data/config.json`

**Files:**
- Modify: `data/config.json`（全量覆盖）

- [ ] **Step 1: 写入新配置**

```json
{
  "scoring": {
    "maxDistance": 19.6,
    "flexThresholdAbs": 1
  },
  "display": {
    "title": "ChuangBTI · 创业者人格测试",
    "subtitle": "6 轴双极创业者画像，25 种人格",
    "funNote": "本测试仅供娱乐，与任何心理学量表无关。<br>Remixed by <a href=\"https://ktwu01.github.io/\" target=\"_blank\" rel=\"noopener noreferrer\">Koutian Wu</a>",
    "ui": {
      "introTitleHtml": "ChuangBTI<br/>创业者人格",
      "introLead": "24 题测出你在 6 根轴上的创业者画像，匹配 25 种人格中最接近的一个。",
      "resultKicker": "你的创业者人格",
      "axisSectionTitle": "你的 6 轴画像",
      "shareWatermark": "https://ktwu01.github.io/ChuangBTI/ · 创业者人格测试 · 仅供娱乐"
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add data/config.json
git commit -m "refactor(data): 配置瘦身（砍 drinkGate/fallback/topList）"
```

---

## Task 6: 重写 `src/engine.js`（6 轴双极引擎 + 自测）

**Files:**
- Modify: `src/engine.js`（全量覆盖）
- Create: `src/engine.test.mjs`

- [ ] **Step 1: 重写 engine**

```js
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
  const scores = {}
  for (const ax of axisOrder) scores[ax] = 0
  for (const q of questions) {
    const v = answers[q.id]
    if (v == null) continue
    scores[q.axis] = (scores[q.axis] || 0) + v
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
```

- [ ] **Step 2: 写自测（node:test，零依赖）**

```js
// src/engine.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcAxisScores, euclideanDistance, isFlex, determineResult } from './engine.js'

const AXES = ['ACT', 'RISK', 'TEAM', 'AI', 'SHOW', 'DRIVE']

test('calcAxisScores 累加每题到对应轴', () => {
  const qs = [
    { id: 'q1', axis: 'ACT' },
    { id: 'q2', axis: 'ACT' },
    { id: 'q3', axis: 'RISK' },
  ]
  const answers = { q1: 1, q2: -1, q3: 1 }
  const s = calcAxisScores(answers, qs, AXES)
  assert.equal(s.ACT, 0)
  assert.equal(s.RISK, 1)
  assert.equal(s.TEAM, 0)
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
```

- [ ] **Step 3: 加 `npm run test` 脚本**

修改 `package.json` scripts：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:subdir": "VITE_BASE=/ChuangBTI/ vite build",
    "preview": "vite preview",
    "test": "node --test src/*.test.mjs"
  }
}
```

- [ ] **Step 4: 跑测试**

```bash
npm run test
```
Expected: `# pass 5` 左右，退出码 0。

- [ ] **Step 5: 提交**

```bash
git add src/engine.js src/engine.test.mjs package.json
git commit -m "feat(engine): 6 轴双极欧氏距离 + node:test 自测"
```

---

## Task 7: 重写 `src/chart.js`（双极条形图）

**Files:**
- Modify: `src/chart.js`（全量覆盖）

- [ ] **Step 1: 写入**

```js
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
```

- [ ] **Step 2: 提交**

```bash
git add src/chart.js
git commit -m "feat(chart): 双极条形图替换雷达图"
```

---

## Task 8: 简化 `src/quiz.js`（去掉饭局门控）

**Files:**
- Modify: `src/quiz.js`（全量覆盖）

- [ ] **Step 1: 写入**

```js
import { shuffle } from './utils.js'

/**
 * 答题控制器 — 简化版：无特殊题插入
 * @param {Object} questionsData { questions: [...] }
 * @param {Object} config        config.json
 * @param {Function} onComplete  (answers) => void
 */
export function createQuiz(questionsData, config, onComplete) {
  let queue = shuffle(questionsData.questions)
  let current = 0
  let answers = {}

  const els = {
    fill: document.getElementById('progress-fill'),
    text: document.getElementById('progress-text'),
    qText: document.getElementById('question-text'),
    options: document.getElementById('options'),
  }

  function updateProgress() {
    const pct = (current / queue.length) * 100
    els.fill.style.width = pct + '%'
    els.text.textContent = `${current} / ${queue.length}`
  }

  function renderQuestion() {
    const q = queue[current]
    els.qText.textContent = q.text
    els.options.innerHTML = ''
    q.options.forEach((opt) => {
      const btn = document.createElement('button')
      btn.className = 'btn btn-option'
      btn.textContent = opt.label
      btn.addEventListener('click', () => selectOption(q, opt))
      els.options.appendChild(btn)
    })
    updateProgress()
  }

  function selectOption(question, option) {
    answers[question.id] = option.value
    current++
    if (current >= queue.length) {
      onComplete(answers)
    } else {
      renderQuestion()
    }
  }

  function start() {
    current = 0
    answers = {}
    queue = shuffle(questionsData.questions)
    renderQuestion()
  }

  return { start, renderQuestion }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/quiz.js
git commit -m "refactor(quiz): 去掉饭局门控，简化答题流程"
```

---

## Task 9: 改 `index.html`（结果页 DOM 瘦身 + 图片位）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 替换结果页 section**

将 `<section id="page-result">` 整段（原第 40-86 行）替换为：

```html
    <!-- 结果页 -->
    <section id="page-result" class="page">
      <div class="card result-card" id="result-card">
        <div class="result-kicker" id="result-kicker">你的创业者人格</div>
        <img id="result-image" class="result-image" alt="" />
        <div class="result-code" id="result-code"></div>
        <div class="result-name" id="result-name"></div>
        <div class="result-intro" id="result-intro"></div>
        <div class="result-desc" id="result-desc"></div>

        <h3 class="section-title" id="axis-section-title">你的 6 轴画像</h3>
        <canvas id="axis-chart"></canvas>

        <div class="disclaimer" id="disclaimer"></div>

        <div class="result-actions">
          <button id="btn-download" class="btn btn-primary">保存分享图片</button>
          <button id="btn-restart" class="btn btn-secondary">重新测试</button>
        </div>

        <div class="agent-section">
          <p class="agent-title">想自己搭一个？</p>
          <div class="agent-cmd">
            <code>git clone https://github.com/haosenwang1018/ChuangBTI.git && cd ChuangBTI && npm install && npm run dev</code>
          </div>
          <button id="btn-agent" class="btn btn-agent">复制一键部署命令</button>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 改答题页占位文本**

`index.html` 原第 31 行 `<div class="progress-text" id="progress-text">0 / 31</div>` 改为 `0 / 24`。

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "refactor(html): 结果页 DOM 瘦身，加人格图位"
```

---

## Task 10: 重写 `src/result.js`

**Files:**
- Modify: `src/result.js`（全量覆盖）

- [ ] **Step 1: 写入**

```js
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
```

- [ ] **Step 2: 提交**

```bash
git add src/result.js
git commit -m "refactor(result): 轻量结果页，加人格大图"
```

---

## Task 11: 重写 `src/share.js`

**Files:**
- Modify: `src/share.js`（全量覆盖）

- [ ] **Step 1: 写入**

```js
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
  const H = 1280
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
```

- [ ] **Step 2: 提交**

```bash
git add src/share.js
git commit -m "refactor(share): 分享图用人格大图 + 双极条形图"
```

---

## Task 12: 改 `src/main.js` 以对接新引擎

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: 读当前内容**

```bash
cat src/main.js
```

读完后改造核心逻辑：load `dimensions.json / questions.json / types.json / config.json`，调用 `createQuiz`（新签名 `(questionsData, config, onComplete)`），`onComplete(answers)` 里：
1. `calcAxisScores(answers, questionsData.questions, dims.order)`
2. `determineResult(scores, dims.order, types.standard, types.special, config.scoring)`
3. `renderResult(result, scores, dims.order, dims.definitions, config)`

如果当前 main.js 的逻辑与旧 engine/quiz 紧耦合，按上面三步重写对应段。保留"开始测试"按钮、"重新测试"按钮、切页逻辑。

- [ ] **Step 2: 跑 dev 确认页面能进入答题**

```bash
npm run dev
```
打开浏览器，点"开始测试"能进入答题界面。若报错按 console 提示修。

- [ ] **Step 3: 提交**

```bash
git add src/main.js
git commit -m "refactor(main): 接入 6 轴新引擎"
```

---

## Task 13: 调整 `src/style.css`（加人格图 + 条形图容器样式）

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: 在文件末尾追加**

```css
/* === 25 人格重构新增样式 === */
.result-image {
  display: block;
  margin: 16px auto 8px;
  width: 280px;
  max-width: 80%;
  height: auto;
  border-radius: 16px;
  object-fit: contain;
}

#axis-chart {
  display: block;
  margin: 12px auto;
  max-width: 100%;
}

/* 旧类不再用，避免残留样式 */
.result-badge, .result-secondary, .result-top3, .dimensions-detail { display: none !important; }
```

- [ ] **Step 2: 提交**

```bash
git add src/style.css
git commit -m "style: 人格图 + 条形图容器"
```

---

## Task 14: 更新 `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 把"特性"小节和"项目结构"小节替换为新版**

用 Edit 工具把 README 中 `## 特性` 到 `## 快速开始` 之前的内容替换为：

```markdown
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
```

- [ ] **Step 2: 删除旧的"修改题目 / 添加新人格 / 评分算法 / 敬局彩蛋"等章节**（如果存在）。保留"快速开始 / 部署 / 技术栈 / License"。

- [ ] **Step 3: 提交**

```bash
git add README.md
git commit -m "docs: README 更新为 25 人格 / 6 轴版"
```

---

## Task 15: 端到端手测

**Files:** 无

- [ ] **Step 1: 启动 dev server**

```bash
npm run dev
```

- [ ] **Step 2: 浏览器手测 checklist**

逐项打勾：

- [ ] 首页 "开始测试" 按钮可点击进入答题页
- [ ] 答题进度显示 `0 / 24` → `24 / 24`
- [ ] 24 题每题 3 选项，点击后自动进下一题
- [ ] 答完自动跳到结果页
- [ ] 结果页顶部显示人格大图（`/personas/{CODE}.png`，非 404）
- [ ] 代号 + 中文名 + 金句 + 描述正文都有
- [ ] 6 轴条形图绘制正常（有中线、双极延伸、负端/正端标签）
- [ ] 没有 TOP5 列表、没有百分比 badge、没有雷达图
- [ ] "保存分享图片" 按钮点击后下载 PNG，分享图里人格大图正常显示
- [ ] "重新测试" 按钮能回到首页
- [ ] 复制部署命令按钮能复制

- [ ] **Step 3: 故意全选中间项测 FLEX**

重新测试一次，所有题都选 "value=0" 那项。确认最后显示为 `FLEX · 变色龙`。

- [ ] **Step 4: 跑引擎自测**

```bash
npm run test
```
Expected: 全绿。

- [ ] **Step 5: 打包验证**

```bash
npm run build
```
Expected: `dist/` 生成，无报错。

```bash
npm run preview
```
再次手测一遍 preview 构建。

---

## Task 16: 最终提交 & 合并

**Files:** 无

- [ ] **Step 1: 确认 git 状态干净**

```bash
git status
```
Expected: nothing to commit, working tree clean.

- [ ] **Step 2: 查看完整提交历史**

```bash
git log --oneline -20
```
确认提交信息清晰有序。

- [ ] **Step 3: 告知用户完工，询问是否推送到 fork**

不要直接 `git push`，除非用户明确要求。

---

## Self-Review Notes

**Spec 覆盖检查**：
- §2 引擎（6 轴 / 打分 / 欧氏 / FLEX）→ Task 2, 6 ✓
- §3 25 人格坐标表 → Task 3 ✓
- §4 24 题结构 → Task 4 ✓
- §5 结果页布局 → Task 9, 10, 13 ✓
- §6 分享图 → Task 11 ✓
- §7 文件改动清单 → Task 2-14 ✓
- §8 兜底/彩蛋（唯 FLEX）→ Task 3, 6 ✓
- §10 开放项（claude init / 24 题题干）→ Task 1, 4 ✓

**类型一致性**：
- 所有任务使用 `axis` / `axisOrder` / `axisScores` / `coords` 术语，未混用
- engine 导出：`calcAxisScores / euclideanDistance / isFlex / determineResult` — chart/result/main 调用处匹配

**占位符**：0 处 TBD / TODO。所有代码块完整。
