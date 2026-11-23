#!/usr/bin/env bash
# 灵枢启动脚本
# 自动处理 KCoder 私有协议（网关要求 POST /KCoder，Pi 会拼 /chat/completions）
# 用法：
#   ./start-lingshu.sh                       # 默认 glm，交互模式
#   ./start-lingshu.sh --model kcoder/deepseek
#   ./start-lingshu.sh -p --model kcoder/glm "Say PONG"   # 非交互

set -e
cd "$(dirname "$0")"

# 1. 从 WorkBuddy 读取 API key（不写入本仓库）
if [ -z "$KCODER_API_KEY" ]; then
  export KCODER_API_KEY=$(python -c "
import json, os
print(json.load(open(os.path.expanduser('~/.workbuddy/models.json'), encoding='utf-8'))[0]['apiKey'])
")
fi

# 2. 启动本地协议代理（生命周期与本脚本绑定）
python scripts/kcoder_proxy.py >/dev/null 2>&1 &
PROXY_PID=$!
trap 'kill $PROXY_PID 2>/dev/null || true' EXIT

# 3. 等待代理就绪
for i in 1 2 3 4 5; do
  curl -s --max-time 2 --noproxy '*' http://127.0.0.1:8899/ping >/dev/null 2>&1 && break
  sleep 0.5
done

# 4. 启动 Pi（从全局 npm 前缀定位，避免写死本机用户名）
PI_JS="$(npm root -g)/@earendil-works/pi-coding-agent/dist/bundle/cli.js"
if [ ! -f "$PI_JS" ]; then
  echo "未找到 @earendil-works/pi-coding-agent，请先执行：npm i -g @earendil-works/pi-coding-agent" >&2
  exit 1
fi
exec node "$PI_JS" "$@"
