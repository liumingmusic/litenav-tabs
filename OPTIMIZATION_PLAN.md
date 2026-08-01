# LiteNav Tabs 优化计划

> 基于代码静态分析 + 实测 `npm run build` 失败得出。按「严重度 → 影响面 → 工作量」排序，分 4 个阶段。
> 每个阶段都可独立提交，互不阻塞。建议从阶段 1 开始——它是唯一会让部署直接挂掉的问题。

---

## 阶段 1 🔴 修复构建脚本（阻塞部署，必做）
**风险：零业务代码改动，只改 `package.json` + 启动方式。**

问题根因（已实测）：
- `build` 脚本 `tsc && vite build && esbuild server.ts ...` 在 esbuild 打 `server.ts` 时失败：`No loader is configured for ".node" files: fsevents.node`（vite 依赖树里的原生模块）。
- 即使打包成功，`--format=cjs` 产物 + `"type":"module"` 也会让 `node dist/server.js` 再崩。
- 结论：**server.ts 不该被 esbuild bundle**，生产环境直接用 `tsx` 跑（`tsx` 已在 devDependencies 中）。

具体改法：
1. `package.json` 的 `build` 改为只做前端构建：
   ```json
   "build": "tsc -b && vite build"
   ```
2. `start`（生产启动）改为：
   ```json
   "start": "cross-env NODE_ENV=production tsx server.ts"
   ```
   （`cross-env` 需加进 dependencies；或改用 `NODE_ENV=production tsx server.ts` 仅限 macOS/Linux）
3. 删除 `server.ts` 里 `import ... from "vite"` 的打包需求——`tsx` 直接跑 `.ts`，无需编译为 js。
4. 验证：`npm run build` 通过 + 本地 `npm start` 能起服务并访问 `index.html`。

**验收**：`npm run build` 无报错；`npm start` 后浏览器打开 `http://127.0.0.1:3000` 正常渲染。

---

## 阶段 2 🟠 清理 AI Studio 脚手架残留（品牌一致性）
**风险：低。改文案/配置，不改逻辑。**

- [ ] `package.json`：`"name": "react-example"` → `"name": "litenav-tabs"`（或项目实际名）。
- [ ] `index.html`：`<title>My Google AI Studio App</title>` → `LiteNav Tabs`。
- [ ] `README.md`：替换为真实项目说明（功能、技术栈、启动方式、WebDAV/数据同步配置）。
- [ ] `vite.config.ts`：删除 `GEMINI_API_KEY` 死配置相关代码与注释；修掉注释里的乱码字符 `â`。
- [ ] `.env.example`：移除 `GEMINI_API_KEY`（全项目无任何 Gemini/AI 代码读取它）。

**验收**：全仓库 grep `GEMINI` / `AI Studio` / `react-example` 无残留（除本计划文档）。

---

## 阶段 3 🟡 清理死代码与噪声（可维护性）
**风险：低。删未用导入/字段，纯瘦身。**

- [ ] `FolderExpandedModal.tsx`：删除未使用的 `ArrowUpToLine` 导入。
- [ ] 多组件文件：合并 `import React from "react"` + 具名 hook 为单行 `import { useState, useEffect } from "react"`，去掉噪声。
- [ ] `store.ts`：`searchEngineUrl` 旧字段——确认已被 `searchEngines[]` 取代后移除（含类型定义与迁移逻辑）。
- [ ] 顺手跑一次 `npm run lint`（项目当前无 lint 脚本，见阶段 4 建议）确认无新报错。

**验收**：`grep -rn "ArrowUpToLine\|searchEngineUrl" src/` 无引用；`npm run build` 仍通过。

---

## 阶段 4 🟢 质量与健壮性增强（按需，非阻塞）
**风险：中低。涉及少量逻辑改动，建议单独立 PR。**

- [ ] **favicon 兜底**：`LinkBlock` 的图标 `onError` 时回退到站点首字母/占位图，避免离线时全空。
- [ ] **性能（大书签量）**：`App` 订阅整个 `links` 数组，书签上千时考虑按分组拆分 selector，减少无效重渲染。
- [ ] **WebDAV 代理安全**：当前 server 默认绑 `127.0.0.1` 安全；若未来要公网，需加目标域名白名单防 SSRF。
- [ ] **加 ESLint/Prettier**：`package.json` 无 lint 脚本，建议引入（仅 dev 依赖）做持续质量门禁。

**验收**：离线场景图标有兜底；lint 通过。

---

## 推荐执行顺序与提交策略
```
阶段1（构建修复）  → 单独 commit，立刻能部署
阶段2（品牌清理）  → 单独 commit
阶段3（死代码）    → 单独 commit
阶段4（增强）      → 视需求，可跳过或独立 PR
```

**一句话**：先把阶段 1 改了就能正常部署；阶段 2/3 是顺手清理；阶段 4 看你后续要不要做。

需要我直接从阶段 1 开始动手改吗？或者你想先只做其中某几个阶段，告诉我即可。
