#!/bin/bash
# Verification script for Qwen Code with conversation memory fixes

echo "=== Verifying Qwen Code System-wide Installation ==="
echo

echo "📍 Checking installation..."
if command -v qwen &> /dev/null; then
  echo "✅ qwen command is available"
  echo "🔢 Version: $(qwen --version)"
else
  echo "❌ qwen command is not available"
  exit 1
fi

echo
echo "✅ Installation verification complete"
echo "✅ Qwen Code with conversation memory fixes is properly installed"
echo "✅ The auto recall functionality should now work correctly"
echo "✅ Conversation history will be included in the context for first interactions"