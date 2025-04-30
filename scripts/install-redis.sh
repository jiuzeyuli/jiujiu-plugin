#!/bin/bash

# 安装Redis
if ! command -v redis-server &> /dev/null; then
    echo "正在安装Redis..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update
        sudo apt install -y redis-server
        sudo systemctl enable redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
        brew services start redis
    else
        echo "不支持的操作系统: $OSTYPE"
        exit 1
    fi
fi

# 检查Redis运行状态
if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis已安装并运行"
else
    echo "❌ Redis安装失败"
    exit 1
fi