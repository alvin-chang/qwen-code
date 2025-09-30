#!/bin/bash
# Update script for custom Qwen Code installation

echo "=== Updating Custom Qwen Code ==="

cd /Users/alvin/src/qwen-code

echo "🔄 Pulling latest changes..."
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "No remote to pull from"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "🌍 Installing globally..."
npm install -g .

echo "🔗 Updating symlinks..."
ln -sf /Users/alvin/.local/bin/qwen /opt/homebrew/bin/qwen
ln -sf /Users/alvin/.local/bin/qwen /opt/homebrew/bin/qwen-code

if [ -w "/usr/local/bin" ]; then
  ln -sf /Users/alvin/.local/bin/qwen /usr/local/bin/qwen
  ln -sf /Users/alvin/.local/bin/qwen /usr/local/bin/qwen-code
fi

echo "✅ Update complete!"
qwen --version