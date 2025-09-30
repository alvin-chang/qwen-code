#!/bin/bash
# Verification script for Qwen Code installation

echo "=== Verifying Qwen Code Installation ==="

echo "📍 Installation location: /Users/alvin/src/qwen-code"
echo "🔢 Version: $(qwen --version 2>/dev/null || echo 'Not available')"

echo "🔧 Checking symlinks:"
ls -la /opt/homebrew/bin/qwen* 2>/dev/null || echo "No symlinks found in /opt/homebrew/bin"
ls -la /usr/local/bin/qwen* 2>/dev/null || echo "No symlinks found in /usr/local/bin"

echo "✅ Installation verification complete"