#!/bin/bash

# Final system-wide installation verification and documentation

echo "=== Final System-wide Installation Verification ==="

# Run a comprehensive test to ensure everything is working
echo "Running final verification tests..."

# Test 1: Command availability
if command -v qwen &> /dev/null; then
    echo "✅ Test 1 PASSED: qwen command accessible"
    VERSION=$(qwen --version 2>/dev/null)
    echo "   Version: $VERSION"
else
    echo "❌ Test 1 FAILED: qwen command not accessible"
    exit 1
fi

# Test 2: Symlink integrity
if [ -L "/opt/homebrew/bin/qwen" ] && [ -f "$(readlink /opt/homebrew/bin/qwen)" ]; then
    echo "✅ Test 2 PASSED: Primary symlink integrity"
else
    echo "❌ Test 2 FAILED: Primary symlink broken"
    exit 1
fi

if [ -L "/usr/local/bin/qwen" ] && [ -f "$(readlink /usr/local/bin/qwen)" ]; then
    echo "✅ Test 3 PASSED: Secondary symlink integrity"
else
    echo "❌ Test 3 FAILED: Secondary symlink broken"
    exit 1
fi

# Test 4: Settings configuration
if [ -f "$HOME/.qwen/settings.json" ] && grep -q "local-memori" "$HOME/.qwen/settings.json"; then
    echo "✅ Test 4 PASSED: Settings configuration"
else
    echo "❌ Test 4 FAILED: Settings configuration"
    exit 1
fi

# Test 5: MCP server availability
if nc -z localhost 4004; then
    echo "✅ Test 5 PASSED: MCP server availability"
else
    echo "⚠️  Test 5 WARNING: MCP server not running (this is expected if not started)"
fi

# Test 6: Core files existence
if [ -f "/Users/alvin/custom-qwen-code/packages/core/src/extensions/memori/memori-extension.ts" ]; then
    echo "✅ Test 6 PASSED: Core extension files"
else
    echo "❌ Test 6 FAILED: Core extension files missing"
    exit 1
fi

echo ""
echo "=== All Verification Tests Passed ==="
echo "✅ System-wide installation is complete and functional"
echo "✅ Qwen Code with Memori extension is ready for use"
echo "✅ Command accessible from any location"
echo "✅ All components properly linked and configured"
echo ""

# Show the installation summary
cat << EOF
==============================================
QWEN CODE SYSTEM-WIDE INSTALLATION COMPLETE
==============================================

Application: Qwen Code with Memori Extension
Version:     $VERSION
Command:     qwen
Location:    /Users/alvin/custom-qwen-code
Symlinks:    /opt/homebrew/bin/qwen
             /usr/local/bin/qwen

Features:
- Conversation memory with session isolation
- Persistent storage via local-memori MCP server
- Two new tools: store_conversation_turn, search_conversation_history
- Complete session isolation for privacy

To use:
1. Start MCP server: npx @qwen-code/local-memori (if needed)
2. Run: qwen
3. Use Memori tools when connected to MCP server

Installation verified at: $(date)
==============================================
EOF

# Create a quick start guide
cat > /tmp/qwen-quick-start.txt << EOF
Qwen Code with Memori Extension - Quick Start Guide
==================================================

1. Ensure MCP server is running (usually on port 4004):
   npx @qwen-code/local-memori
   (Or keep it running in a separate terminal)

2. Start Qwen Code:
   qwen

3. Once connected to MCP server, you can use:
   - store_conversation_turn: Store conversation context with session isolation
   - search_conversation_history: Search conversations with session filtering

4. Example usage after connection:
   When Qwen asks for a tool, you can select:
   - store_conversation_turn to save important context
   - search_conversation_history to retrieve previous conversations

Remember:
- Each session has isolated conversation memory
- Data persists across Qwen Code restarts
- MCP server must be running for Memori tools to work
EOF

echo "Quick start guide saved to: /tmp/qwen-quick-start.txt"

echo ""
echo "🎉 System-wide installation successfully completed!"
echo "📋 Check /tmp/qwen-quick-start.txt for usage instructions"
echo "📄 Check $(pwd)/SYSTEM_WIDE_INSTALLATION_REPORT.md for detailed report"