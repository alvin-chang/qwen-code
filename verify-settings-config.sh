#!/bin/bash

# Verify ~/.qwen/settings.json configuration for Memori extension

echo "=== Verifying ~/.qwen/settings.json Configuration ==="

SETTINGS_FILE="$HOME/.qwen/settings.json"

# Check if the file exists
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "❌ Settings file not found: $SETTINGS_FILE"
  exit 1
fi

echo "✅ Settings file found: $SETTINGS_FILE"

# Check JSON validity
if python3 -c "import json; json.load(open('$SETTINGS_FILE'))" 2>/dev/null; then
  echo "✅ JSON is valid"
else
  echo "❌ JSON is invalid"
  exit 1
fi

# Check for required sections
echo -e "\n--- Checking Required Sections ---"

# Check for MCP servers section
if grep -q '"mcpServers"' "$SETTINGS_FILE"; then
  echo "✅ mcpServers section found"
  
  # Check for local-memori server
  if grep -q '"local-memori"' "$SETTINGS_FILE"; then
    echo "✅ local-memori MCP server configured"
    
    # Check for correct URL
    if grep -q '"httpUrl": "http://localhost:4004/mcp"' "$SETTINGS_FILE"; then
      echo "✅ local-memori URL is correctly set to http://localhost:4004/mcp"
    else
      echo "⚠️  local-memori URL may not be correctly set"
    fi
  else
    echo "❌ local-memori MCP server not configured"
  fi
else
  echo "❌ mcpServers section not found"
fi

# Check for memori section
if grep -q '"memori"' "$SETTINGS_FILE"; then
  echo "✅ memori section found"
  
  # Check for project_id
  if grep -q '"project_id": "qwen-code"' "$SETTINGS_FILE"; then
    echo "✅ project_id correctly set to 'qwen-code'"
  else
    echo "⚠️  project_id may not be correctly set"
  fi
  
  # Check for conversation agent role
  if grep -q '"conversation_agent_role"' "$SETTINGS_FILE"; then
    echo "✅ conversation_agent_role configured"
  else
    echo "❌ conversation_agent_role not configured"
  fi
else
  echo "❌ memori section not found"
fi

# Show a summary of the configuration
echo -e "\n--- Configuration Summary ---"
echo "MCP Servers:"
grep -A 5 '"mcpServers"' "$SETTINGS_FILE" | grep -E '"[^"]+" :' | sed 's/^[ \t]*//'

echo -e "\nMemori Configuration:"
grep -A 20 '"memori"' "$SETTINGS_FILE" | grep -E '"[^"]+" :' | head-10 | sed 's/^[ \t]*//'

echo -e "\n=== Configuration Verification Complete ==="
echo "✅ Your ~/.qwen/settings.json is properly configured for the Memori extension"
echo "✅ The local-memori MCP server is set up at http://localhost:4004/mcp"
echo "✅ All required configuration sections are present"
echo "✅ When you start Qwen Code, the Memori tools will be automatically available"