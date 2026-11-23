# 灵枢桌面版（Lingshu Desktop）技术方案

> 版本：v1 · 2026-11-23
> 已确认决策：Electron + 内嵌本地 p2 服务 + 最小可用壳

## 1. 目标与范围

把当前终端形态的灵枢改造成桌面应用，达到 Claude Code Desktop / Codex 桌面版的使用体验：双击图标启动、独立窗口、不依赖用户手动敲命令。

**首版范围（最小可用壳）**：能启动窗口、内嵌服务自动拉起、可靠退出回收。系统托盘、全局快捷键、自动更新、主题跟随留到后续迭代。

**明确不做**：不重写 UI，不改 agent 核心，不改现有 p2 服务协议。

## 2. 现状分析：仓库里已经有什么

这是本方案最重要的前提——桌面化不需要从零造 UI。

| 能力 | 位置 | 状态 |
|---|---|---|
| 完整 Web UI | `apps/p2/src/web/` | 已存在，React 19 + TSX，含 Chat、命令面板、活动流、代码高亮 |
| HTTP + WebSocket 服务 | `apps/p2/src/hosts/server.ts` | 已存在，监听 `127.0.0.1:8788` |
| 会话/worker 路由 | `apps/p2/src/hosts/session-workers.ts` | 已存在 |
| 认证与 owner 模型 | `apps/p2/src/runtime/principals.ts`、`web.ts` | 已存在，cookie + owner 权限 |
| PWA manifest / service worker | `apps/p2/public/` | 已存在（桌面壳不依赖，但说明 Web 版已成熟） |
| agent 核心 | `packages/coding-agent` + `chord`/`durable`/`ai`/`mcp` | 已存在，CLI 与 Web 共用 |
| 桌面壳 | 无 | 本次新建 |

**结论**：Web 版已经是完整交互界面，桌面壳的本质是「把 Web 应用装进原生窗口并管理其后端服务生命周期」。

## 3. 架构设计

```
┌──────────────────────────────────────────────┐
│  apps/desktop（本次新建）                      │
│  ┌────────────────────────────────────────┐  │
│  │ Electron 主进程 (main.ts)               │  │
│  │  - spawn p2 server 子进程               │  │
│  │  - 探测端口就绪 → 创建 BrowserWindow     │  │
│  │  - 监听退出 → 回收子进程与协议代理        │  │
│  └───────────────┬────────────────────────┘  │
│                  │ loadURL                    │
│  ┌───────────────▼────────────────────────┐  │
│  │ BrowserWindow + preload                 │  │
│  │  - contextIsolation: true               │  │
│  │  - 导航白名单，禁止加载外部站点           │  │
│  └───────────────┬────────────────────────┘  │
└──────────────────┼────────────────────────────┘
                   │ http://127.0.0.1:8788
┌──────────────────▼────────────────────────────┐
│  apps/p2 Web UI（React，已存在）               │
└──────────────────┬────────────────────────────┘
                   │ WebSocket / HTTP（已有协议）
┌──────────────────▼────────────────────────────┐
│  p2 server → agent 核心（已存在）              │
└──────────────────────────────────────────────┘
```

关键设计原则：**桌面壳只负责「壳」和「生命周期」**。所有业务逻辑（会话、工具调用、模型、文件操作）继续由 p2 服务承载，桌面版与浏览器版共用同一套代码，避免分叉。

## 4. 技术栈选型

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| **Electron** | 生态成熟；Node 与现有 monorepo 同构；主进程可直接 fork p2；打包/更新工具链齐全 | 包体积大（约 100MB+）、内存占用高 | ✅ 采用 |
| Tauri v2 | 体积小、内存低、Rust 后端安全 | 需引入 Rust 工具链；Node 服务要外部进程管理；Webview 跨系统差异 | 备选 |
| PWA 壳 | p2 已有 manifest + SW，零开发量 | 不是真桌面应用（无原生窗口/托盘），体验不达标 | 仅过渡 |

**Electron 的决定性理由**：主进程用 Node/TypeScript 就能直接管理 p2 服务进程，与 workspace 现有包无缝衔接；不需要跨语言桥接，首版可在不改动任何现有代码的前提下完成。

## 5. 关键技术点与实现路径

### 5.1 服务生命周期（首版核心）

Electron 主进程负责：

1. 启动：`spawn` p2 server（`node --import ./src/source.ts src/hosts/server.ts`，cwd 指向 `apps/p2`）。
2. 就绪探测：轮询 `127.0.0.1:8788` 直到可连接，再创建窗口，避免白屏。
3. 窗口加载：`BrowserWindow.loadURL('http://127.0.0.1:8788')`。
4. 退出回收：`window-all-closed` / `before-quit` 时 kill 子进程；macOS 上关闭窗口保留托盘进程需特殊处理（首版统一退出）。
5. 二次启动：检测端口已被占用时直接加载现有服务，不重复 spawn。

**注意**：此前手动启动踩过的坑——协议代理（`scripts/kcoder_proxy.py`，8899）的生命周期必须绑定主进程，不能像 shell 脚本那样被 `trap`/`set -e` 意外杀掉。

### 5.2 安全边界

- `contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`。
- `setWindowOpenHandler`：外部链接交系统浏览器，不在应用内打开。
- `will-navigate`：仅允许 `127.0.0.1:8788` 与本地资源，防止外部站点导航劫持本地服务。
- preload 只暴露最小必要的 IPC（如窗口最小化/关闭），不暴露 Node API 给渲染进程。

### 5.3 打包与分发

- 用 `electron-builder` 产出 Windows NSIS 安装包、macOS dmg、Linux AppImage。
- p2 是 TS 源码运行（靠 `src/source.ts` 做 workspace 源码解析），打包时必须把 `apps/p2/src`、`node_modules` 及 workspace 依赖一并带入 asar，或先做 esbuild 打包成静态入口——**这是首版需要实测确认的点**，决定 asar 体积与启动方式。
- 模型配置沿用现有 `~/.pi/agent/models.json` 与环境变量注入，不写入安装包。

### 5.4 后续迭代（不在首版）

- electron-updater 接入现有 release 流程。
- 系统托盘、全局快捷键、开机自启。
- 跟随系统深色/浅色主题、原生菜单栏。

## 6. 分阶段实施计划

| 阶段 | 内容 | 验收 |
|---|---|---|
| P0 | 新建 `apps/desktop` 子包骨架、Electron 主进程、preload | `tsc --noEmit` 通过 |
| P1 | 打通服务生命周期（spawn → 就绪 → 窗口 → 回收） | 双击启动能看到 p2 Web 界面 |
| P2 | 安全边界 + 二次启动处理 | 外部链接不劫持、重复启动不报端口冲突 |
| P3 | electron-builder 打包配置 | 产出可安装的 Windows 安装包 |
| P4 | 托盘/快捷键/自动更新/主题 | 体验对齐主流桌面版 |

## 7. 风险、约束与待决策

1. **依赖安装受阻（当前环境问题）**：`curl` 直连 npm registry 返回 200，但 `npm view` / `npm pack` 在沙箱内超时。根因是环境注入的失效代理（`HTTP_PROXY=127.0.0.1:51874`），清除后仍超时，判断为沙箱对 npm 进程的网络限制。安装 Electron 前需先解决：配置可用代理，或在用户本机终端执行 `npm install`。
2. **打包形态待实测**：p2 以 TS 源码方式运行，asar 打包需确认是带源码 + node_modules，还是先 bundle。两种方案体积与冷启动差异较大，P3 阶段实测后定。
3. **认证衔接**：桌面 WebView 内是本地可信页面，需确认 p2 的 owner cookie 在无浏览器 профиле 的 Electron 中是否正常持久化，必要时主进程注入一次性 token。
4. **多平台**：首版优先 Windows（用户环境），macOS/Linux 在 P3 后按需适配。
