# Custom Qwen Code Installation with Memori Extension

## Installation Summary

You have successfully installed a custom version of Qwen Code with the enhanced BMAD orchestrator and Memori extension from your forked repository.

### Installation Details

1. **Source**: Your fork of Qwen Code at https://github.com/alvin-chang/qwen-code
2. **Branch**: enhanced-bmad-orchestrator
3. **Installation Location**: /Users/alvin/custom-qwen-code
4. **Global Installation**: Installed globally via npm symlink
5. **Binary**: Available as `qwen` command

### Key Features Installed

The custom version includes the Memori extension with the following capabilities:

1. **Session-aware conversation memory**:
   - Stores conversation turns with session isolation
   - Persistent storage via local-memori MCP server
   - Semantic search for conversation history

2. **New tools**:
   - `store_conversation_turn`: Stores conversation context in persistent memory
   - `search_conversation_history`: Searches conversation history with session isolation

3. **Code context management**:
   - Store and retrieve code snippets with contextual descriptions
   - Session isolation to prevent interference between different conversation contexts

### How to Use

1. **Run Qwen Code**:
   ```bash
   qwen
   ```

2. **Configure MCP servers** (required for Memori extension):
   Create a `.qwen/settings.json` file with:
   ```json
   {
     "mcpServers": {
       "local-memori": {
         "httpUrl": "http://localhost:4004/mcp",
         "headers": {}
       }
     }
   }
   ```

3. **Use the new tools**:
   Once connected to an MCP server, Qwen Code will automatically register the Memori tools:
   - `store_conversation_turn`: Store conversation context
   - `search_conversation_history`: Search conversation history

### Protection from npm Updates

To prevent your custom version from being overwritten by npm updates:
1. A lock file has been created at `~/.qwen-code-npm-lock.json`
2. The global installation uses a symlink to your local repository
3. To update, you need to manually pull changes from your fork and rebuild

### Repository Location

Your local repository is located at:
```
/Users/alvin/custom-qwen-code
```

This allows you to:
- Make further modifications to the code
- Pull updates from your fork
- Push changes back to your fork
- Rebuild and reinstall as needed

### Next Steps

1. Start the local-memori MCP server if you haven't already
2. Run `qwen` to start using your enhanced version
3. The Memori extension tools will be automatically available when connected to an MCP server