# LiteNav Tabs

一个自托管的书签 / 新标签页导航面板。单页应用，数据默认存浏览器 `localStorage`，可选通过 WebDAV 备份/恢复。

## 技术栈

- React 19 + TypeScript
- Vite 6（构建工具）
- Tailwind CSS v4（样式）
- Zustand（状态管理）
- @dnd-kit（拖拽排序）
- Express + webdav（本地开发服务器与 WebDAV 同步代理）

## 本地运行

```bash
npm install
npm run dev          # 开发模式，默认 http://127.0.0.1:3000
```

## 生产构建与启动

```bash
npm run build        # 类型检查 + 构建前端到 dist/
npm start            # NODE_ENV=production，用 tsx 直接跑 server.ts，托管 dist/ 并提供 WebDAV 代理
```

> 说明：`server.ts` 在 `NODE_ENV=production` 时直接托管 `dist/` 静态文件；开发模式下接入 Vite 中间件做热更新。生产启动不再需要把 `server.ts` 编译成 CJS。

## 部署到 GitHub Pages

本项目为纯前端静态站点，可部署到 GitHub Pages：

1. `npm run build` 产出 `dist/`
2. 将 `dist/` 内容推送到仓库的 `gh-pages` 分支
3. 在仓库 Settings → Pages 选择 `gh-pages` 分支、`/ (root)` 作为源

`vite.config.ts` 中 `base: './'` 已设为相对路径，因此站点在 `https://<user>.github.io/<repo>/` 子路径下也能正确加载资源。

## WebDAV 同步

设置中可填写 WebDAV 地址、账号、密码，用于把书签备份到私有网盘并跨设备恢复。同步代理仅绑定 `127.0.0.1`（除非显式设置 `HOST=0.0.0.0`），请勿在公网暴露。

## 环境变量

参考 `.env.example`：

- `HOST`：服务监听地址（默认 `127.0.0.1`）
- `DISABLE_HMR`：设为 `true` 关闭 Vite 热更新
