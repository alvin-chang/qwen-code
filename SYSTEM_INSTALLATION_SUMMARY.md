# Qwen Code System-wide Installation with Memori Extension

## Installation Summary

Your custom Qwen Code with the Memori extension is now installed system-wide and ready to use!

### Installation Details

- **Installation Location**: `/Users/alvin/custom-qwen-code`
- **Binary Location**: `/opt/homebrew/bin/qwen` (symlink to the actual binary)
- **Version**: 0.0.12
- **Access**: Available from anywhere on your system via the `qwen` command

### Configuration

Your `~/.qwen/settings.json` is properly configured with:

1. **MCP Servers**:
   - `local-memori` server at `http://localhost:4004/mcp`
   - `playwright` server for browser automation

2. **Memori Extension**:
   - Project ID: `qwen-code`
   - Session-aware conversation memory
   - Semantic search capabilities
   - Code context storage and retrieval

### Key Features Available

1. **Session Isolation**: Each conversation is isolated by unique session IDs
2. **Persistent Storage**: Conversations are stored in a local database
3. **Semantic Search**: Intelligent search capabilities for conversation history
4. **Code Context**: Ability to store and retrieve code snippets with context
5. **Two New Tools**:
   - `store_conversation_turn`: Store conversation context in persistent memory
   - `search_conversation_history`: Search conversation history with session isolation

### System Maintenance

For future updates, you can use the update script:
```bash
/Users/alvin/update-custom-qwen.sh
```

To verify the installation at any time:
```bash
/Users/alvin/verify-qwen-install.sh
```

### Usage

To start using Qwen Code with the Memori extension:

1. Make sure the local-memori MCP server is running on `http://localhost:4004/mcp`
2. Run `qwen` from any directory
3. The Memori tools will be automatically available when connected to the MCP server
4. Conversations will be automatically isolated by session

### Session Isolation

The Memori extension ensures complete session isolation through:

1. **Unique Session IDs**: Each conversation gets a unique identifier
2. **Session-aware Storage**: Conversations are stored with session context
3. **Session-aware Search**: Search queries include session filtering
4. **Result Filtering**: Only conversations from the current session are returned

This ensures that conversations from different sessions don't interfere with each other, providing privacy and contextual relevance.

Enjoy your enhanced Qwen Code experience with persistent conversation memory!