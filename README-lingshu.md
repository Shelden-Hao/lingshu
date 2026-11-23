# 灵枢（Lingshu）使用说明

基于 Pi (v1.6.0) 的个人 Agent Harness，接入 WorkBuddy 的 KCoder 网关（同方知网）。

## 已接入的 4 个模型

| 模型 ID | 名称 | 上下文 |
|---|---|---|
| `kcoder/glm` | GLM-5.3-FP8 | 300K |
| `kcoder/glm-flash` | GLM-5.3-Flash | 1M |
| `kcoder/KCoder` | 四模型随机调度 | 300K |
| `kcoder/deepseek` | DeepSeek-V4-Flash-0731 | 1M |

全部已实测可用（2026-11-23）。

## 启动方式

```bash
cd C:/Codefield/lingshu
./start-lingshu.sh                              # 默认 glm，交互模式
./start-lingshu.sh --model kcoder/deepseek      # 指定模型
./start-lingshu.sh -p --model kcoder/glm "Say PONG"  # 非交互
```

启动脚本会自动：
1. 从 `~/.workbuddy/models.json` 读取 API key（不写入本仓库）
2. 启动本地协议代理（解决 KCoder 私有协议与 Pi 的 URL 拼接冲突）
3. 启动 Pi

## 为什么需要协议代理

KCoder 网关要求 `POST https://coder.cnki.net/KCoder`（WorkBuddy 的 `useCustomProtocol`），
而 Pi 作为标准 OpenAI-compatible 客户端会拼接 `/chat/completions` 变成 404。

`scripts/kcoder_proxy.py` 监听 `127.0.0.1:8899`，把 Pi 的标准请求转发到网关正确端点，
并修正 `reasoning_effort` 参数（网关只接受 low/high/xhigh/max）。

## 文件说明

- `.pi/models.json` — 4 个模型的定义（key 用 `$KCODER_API_KEY` 环境变量引用，无明文）
- `scripts/kcoder_proxy.py` — 协议转换代理
- `start-lingshu.sh` — 一体化启动脚本

## 同步上游

```bash
git fetch upstream
git merge upstream/main
```
