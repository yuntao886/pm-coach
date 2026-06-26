#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 启动本地服务器..."
echo "浏览器打开: http://localhost:8080/test.html"
echo "按 Ctrl+C 停止"
echo ""
python3 -m http.server 8080 &
sleep 1
open http://localhost:8080/test.html
wait
