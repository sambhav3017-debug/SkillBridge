#!/usr/bin/env bash
# SkillBridge Development Server Startup Script
set -e

# Change to the project directory regardless of where the script is called from
cd "$(dirname "$0")"

echo "============================================="
echo " SkillBridge — Starting Development Server"
echo " Project: $(pwd)"
echo " Local URL: http://localhost:3000"
echo "============================================="

# Start the Next.js development server
npm run dev -- -H 0.0.0.0 -p 3000
