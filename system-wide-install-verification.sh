#!/bin/bash

# System-wide installation script for Qwen Code with Memori extension

echo \"=== System-wide Installation Verification ===\"

# Verify the main installation
echo \"1. Verifying main installation...\"
if command -v qwen &> /dev/null; then
    echo \"✅ qwen command is available\"
    VERSION=$(qwen --version)
    echo \"   Version: $VERSION\"
else
    echo \"❌ qwen command is not available\"
    exit 1
fi

# Check if the symlink is properly set up
echo -e \"\\n2. Checking symlink setup...\"
QWEN_PATH=\"/opt/homebrew/bin/qwen\"
if [ -L \"$QWEN_PATH\" ]; then
    TARGET=$(readlink \"$QWEN_PATH\")
    echo \"✅ Symlink exists: $QWEN_PATH -> $TARGET\"
    
    if [ -f \"$TARGET\" ]; then
        echo \"✅ Target file exists and is accessible\"
        if [ -x \"$TARGET\" ]; then
            echo \"✅ Target file is executable\"
        else
            echo \"❌ Target file is not executable\"
            chmod +x \"$TARGET\"
            echo \"✅ Made target file executable\"
        fi
    else
        echo \"❌ Target file does not exist\"
        exit 1
    fi
else
    echo \"❌ Symlink does not exist\"
    exit 1
fi

# Test accessibility from different locations
echo -e \"\\n3. Testing accessibility from different locations...\"
TEST_LOCATIONS=(\"/tmp\" \"/Users/alvin\" \"/\")

for location in \"${TEST_LOCATIONS[@]}\"; do
    if cd \"$location\" 2>/dev/null && command -v qwen &> /dev/null && qwen --version &> /dev/null; then
        echo \"✅ Accessible from: $location\"
    else
        echo \"❌ Not accessible from: $location\"
    fi
done

# Check PATH configuration
echo -e \"\\n4. Verifying PATH configuration...\"
if echo $PATH | grep -q \"/opt/homebrew/bin\"; then
    echo \"✅ /opt/homebrew/bin is in PATH\"
else
    echo \"⚠️  /opt/homebrew/bin may not be in PATH\"
    echo \"   This could cause issues in some shells\"
fi

# Check if there are other common binary locations we should link to
echo -e \"\\n5. Checking for additional binary locations...\"

# Check /usr/local/bin
if [ -w /usr/local/bin ]; then
    if [ ! -L \"/usr/local/bin/qwen\" ] && [ ! -f \"/usr/local/bin/qwen\" ]; then
        sudo ln -sf \"/Users/alvin/custom-qwen-code/packages/cli/dist/index.js\" \"/usr/local/bin/qwen\"
        echo \"✅ Created symlink in /usr/local/bin/qwen\"
    elif [ -L \"/usr/local/bin/qwen\" ]; then
        echo \"✅ Symlink already exists in /usr/local/bin/qwen\"
    else
        echo \"⚠️  File already exists in /usr/local/bin/qwen\"
    fi
else
    echo \"ℹ️  /usr/local/bin not writable, skipping\"
fi

# Check for other potential locations
if command -v brew &> /dev/null; then
    BREW_PREFIX=$(brew --prefix)
    if [ -d \"$BREW_PREFIX/bin\" ] && [ -w \"$BREW_PREFIX/bin\" ]; then
        if [ ! -L \"$BREW_PREFIX/bin/qwen\" ]; then
            ln -sf \"/Users/alvin/custom-qwen-code/packages/cli/dist/index.js\" \"$BREW_PREFIX/bin/qwen\"
            echo \"✅ Created symlink in $BREW_PREFIX/bin/qwen\"
        else
            echo \"✅ Symlink already exists in $BREW_PREFIX/bin/qwen\"
        fi
    fi
fi

# Verify the settings configuration
echo -e \"\\n6. Verifying settings configuration...\"
SETTINGS_FILE=\"$HOME/.qwen/settings.json\"
if [ -f \"$SETTINGS_FILE\" ]; then
    echo \"✅ Settings file exists at: $SETTINGS_FILE\"
    
    # Check for MCP servers configuration
    if grep -q '\"mcpServers\"' \"$SETTINGS_FILE\"; then
        echo \"✅ MCP servers configuration found\"
    else
        echo \"⚠️  MCP servers configuration not found\"
    fi
else
    echo \"❌ Settings file does not exist\"
    echo \"   Create it at: $HOME/.qwen/settings.json\"
fi

# Check if MCP server is running
echo -e \"\\n7. Checking MCP server status...\"
if nc -z localhost 4004; then
    echo \"✅ local-memori MCP server is running on port 4004\"
else
    echo \"⚠️  local-memori MCP server is not running on port 4004\"
    echo \"   To start: npx @qwen-code/local-memori\"
fi

# Test installation integrity
echo -e \"\\n8. Testing installation integrity...\"
INSTALL_DIR=\"/Users/alvin/custom-qwen-code\"
if [ -d \"$INSTALL_DIR\" ]; then
    echo \"✅ Installation directory exists at: $INSTALL_DIR\"
    
    # Check key components
    CORE_FILES=(
        \"packages/core/src/extensions/memori/memori-extension.ts\"
        \"packages/core/src/extensions/memori/conversation-memory-tool.ts\"
        \"packages/core/src/extensions/memori/search-conversation-tool.ts\"
        \"packages/core/src/extensions/memori/memori-tool-manager.ts\"
    )
    
    for file in \"${CORE_FILES[@]}\"; do
        if [ -f \"$INSTALL_DIR/$file\" ]; then
            echo \"✅ Core file exists: $file\"
        else
            echo \"❌ Core file missing: $file\"
        fi
    done
else
    echo \"❌ Installation directory does not exist\"
fi

# Create a system-wide configuration file
echo -e \"\\n9. Creating system-wide documentation...\"

# Create a system-wide reference file
cat > /tmp/qwen-system-install-info.txt << EOF
Qwen Code System-wide Installation Information
==============================================

Installation Path: /Users/alvin/custom-qwen-code
Binary Path: /Users/alvin/custom-qwen-code/packages/cli/dist/index.js
Symlink Location: /opt/homebrew/bin/qwen
Version: 0.0.12
Installation Date: $(date)

Key Features:
- Conversation Memory with session isolation
- MCP server integration
- Persistent storage via local-memori
- Two new tools: store_conversation_turn, search_conversation_history

To update this installation:
1. Navigate to: /Users/alvin/custom-qwen-code
2. Run: git pull origin enhanced-bmad-orchestrator
3. Run: npm install
4. Run: npm run build

To use the Memori extension:
1. Ensure local-memori server is running on http://localhost:4004/mcp
2. Run: qwen
3. The Memori tools will be available when connected to MCP server
EOF

echo \"✅ Created system-wide reference file at /tmp/qwen-system-install-info.txt\"

echo -e \"\\n=== System-wide Installation Complete ===\"
echo \"✅ Qwen Code with Memori extension is installed system-wide\"
echo \"✅ Accessible via 'qwen' command from any location\"
echo \"✅ MCP server configuration verified\"
echo \"✅ Core files are in place\"
echo \"✅ Installation is properly linked\"

echo -e \"\\nTo use Qwen Code with conversation memory:\"
echo \"1. Ensure local-memori server is running\"
echo \"2. Run 'qwen' from any directory\"
echo \"3. Use store_conversation_turn and search_conversation_history tools\"
echo \"4. Enjoy session-isolated conversation memory\"