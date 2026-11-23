# 灵枢桌面版

Electron 桌面壳，内嵌现有 `apps/p2` Web 界面与 agent 核心。当前为最小可用版本（P0/P1），不含托盘、全局快捷键与自动更新。

## 前置条件

- Node >= 22.19.0
- Python（用于 KCoder 协议代理）
- 已配置 `~/.pi/agent/models.json` 或项目 `.pi/models.json`

## 使用

安装依赖并启动：

```bash
cd apps/desktop
npm install
npm run dev
```

`dev` 会编译 TypeScript 壳、拉起 p2 服务与协议代理，并打开桌面窗口。首次打开需在页面输入启动日志里打印的一次性 sign-in token。

### 自定义模型（KCoder）

桌面版启动时会自动把 KCoder provider 写入 p2 的数据目录，并补齐凭证：

- `~/.lingshu/p2/models.json` — 4 个模型定义（glm / glm-flash / KCoder / deepseek），baseUrl 指向本地协议代理 `127.0.0.1:8899/v1`
- `~/.lingshu/p2/auth.json` — `kcoder` 的 api_key 凭证，值写 `$KCODER_API_KEY` 环境变量引用，不落盘明文

**只增量写入 `kcoder` 条目**，你已有的其他 provider、默认模型和改动都会保留。

API key 来源：主进程从 `~/.workbuddy/models.json` 读取第一个条目的 `apiKey`，注入 p2 进程的环境变量。也可用 `LINGSHU_KCODER_KEY_FILE` 指定其他文件。

> 关键点：p2 **只显示 auth.json 里有凭证的 provider**。只写 models.json 而不写 auth.json，模型不会出现在选择器里。

### 环境前提与踩坑

- **npm 代理**：若 `~/.npmrc` 里的代理端口失效，npm 会静默超时。用 `npm config set proxy/https-proxy http://127.0.0.1:7890 --location=user` 指向可用代理。
- **Electron 二进制**：`npm install --ignore-scripts` 不会下载 electron 二进制；手动下载时走镜像 `https://npmmirror.com/mirrors/electron/<版本>/electron-v<版本>-win32-x64.zip`，解压到 `node_modules/electron/dist` 并写入 `path.txt`（内容 `electron.exe`）。
- **ELECTRON_RUN_AS_NODE**：宿主环境若注入该变量，Electron 会以纯 Node 模式运行，导致 `app` 为 undefined。`dev` 脚本已自动清除。
- **模型数据**：首次启动 p2 前需生成 gitignored 的模型数据：`npm run hydrate:model-data`（仓库根目录）。
- **`--import` 路径**：Windows 上传给 Node 的绝对路径需为 `file://` URL，主进程已用 `pathToFileURL` 处理。

打包安装包（P3 阶段任务，配置已给出方向但未经实测，node_modules 体积需进一步优化）：

```bash
npm run package
```

如需自定义 p2 源码或协议代理位置，可设置环境变量 `LINGSHU_P2_DIR`、`LINGSHU_PROXY_SCRIPT` 覆盖自动探测。

## 实现说明

- 主进程检测 `127.0.0.1:8788`：未启动则 spawn p2 server，已启动则直接加载，避免重复进程。
- 启动前清除环境里的失效 HTTP 代理，避免本地回环请求被错误代理。
- 退出时按进程树回收 p2 server 与协议代理，避免孤儿进程。
- 渲染进程 `contextIsolation` + `sandbox` 开启，仅通过 preload 暴露窗口控制；导航白名单限定本地地址。

详细方案见 `docs/desktop-plan.md`。
