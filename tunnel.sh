#!/usr/bin/env bash

# ==============================================================================
# SkillBridge Cloudflare Quick Tunnel Helper Script
# Usage:
#   ./tunnel.sh start   - Starts a Cloudflare Quick Tunnel on port 3000
#   ./tunnel.sh stop    - Stops all running Cloudflare Quick Tunnels
#   ./tunnel.sh status  - Checks whether tunnel is currently active and shows URL
# ==============================================================================

PORT=3000
CLOUDFLARED_BIN="/Users/jains/.local/bin/cloudflared"

if [ ! -f "$CLOUDFLARED_BIN" ]; then
  # Fallback to npx package
  CLOUDFLARED_BIN=$(which cloudflared 2>/dev/null)
  if [ -z "$CLOUDFLARED_BIN" ]; then
    CLOUDFLARED_BIN="/Users/jains/.npm/_npx/8a26fc3a61fe4212/node_modules/cloudflared/bin/cloudflared"
  fi
fi

case "$1" in
  start)
    echo "🔍 Checking if SkillBridge frontend is running on port $PORT..."
    if ! lsof -i :$PORT >/dev/null 2>&1; then
      echo "⚠️ SkillBridge dev server is not running on port $PORT!"
      echo "Please run 'npm run dev' first, then start the tunnel."
      exit 1
    fi

    echo "🚀 Starting Cloudflare Quick Tunnel for http://localhost:$PORT..."
    echo "Press Ctrl+C to stop the tunnel at any time."
    "$CLOUDFLARED_BIN" tunnel --http-host-header "localhost:$PORT" --url "http://localhost:$PORT"
    ;;

  stop)
    echo "🛑 Stopping all Cloudflare tunnel processes..."
    pkill -f "cloudflared tunnel" || true
    echo "✓ Cloudflare Tunnel stopped. Temporary sharing URL is now offline."
    ;;

  status)
    PID=$(pgrep -f "cloudflared tunnel" || true)
    if [ -n "$PID" ]; then
      echo "✓ Cloudflare Tunnel is RUNNING (PID: $PID)"
    else
      echo "✗ Cloudflare Tunnel is NOT running."
    fi
    ;;

  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
