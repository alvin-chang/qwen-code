#!/bin/bash
# Update script for Qwen Code installation

echo "=== Updating Qwen Code ==="

cd /Users/alvin/src/qwen-code

echo "🔄 Pulling latest changes..."
git pull origin main  # or whatever your default branch is

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "🌍 Reinstalling globally..."
npm install -g .

echo "✅ Update complete!"
qwen --version