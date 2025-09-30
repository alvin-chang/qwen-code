# Session Isolation in Qwen Code Memori Extension

## Overview

Your custom Qwen Code installation includes the Memori extension, which provides session-aware conversation memory capabilities. A key feature of this extension is **session isolation**, which ensures that conversations from different sessions don't interfere with each other.

## How Session Isolation Works

### 1. Session ID Generation
- Each conversation session is assigned a unique session ID when created
- Session IDs are generated using random strings to ensure uniqueness
- The `generateSessionId()` method creates a 28-character random string

### 2. Session-aware Storage
- When storing conversation turns, the session ID is included as part of the storage key
- Conversations are stored with the format: `CONVERSATION_TURN [session-id]: USER: ... | ASSISTANT: ...`
- This ensures that each conversation is associated with its specific session

### 3. Session-aware Search
- When searching conversation history, the query includes the session ID for filtering
- Search queries are formatted as: `[session-id] search-query`
- This ensures that only conversations from the specified session are returned

### 4. Session Filtering
- When parsing search results, the extension filters conversations to only include those from the current session
- The `parseConversationResults()` method checks that the session ID matches before including results
- This provides complete isolation between different conversation sessions

## Key Implementation Details

### Session ID Generation
```typescript
private generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
```

### Session-aware Storage
```typescript
const conversationId = sessionId || this.sessionId;
const response = await this.client.callTool({
  name: 'store_memory',
  arguments: {
    content: `CONVERSATION_TURN [${conversationId}]: USER: ${userInput} | ASSISTANT: ${assistantResponse}`,
    // ...
  }
});
```

### Session-aware Search
```typescript
const conversationId = sessionId || this.sessionId;
const response = await this.client.callTool({
  name: 'search_memory',
  arguments: {
    query: `[${conversationId}] ${query}`,
    // ...
  }
});
```

### Session Filtering
```typescript
// In parseConversationResults method
const conversationMatch = line.match(/\[([^\]]+)\]: USER: (.*?) \| ASSISTANT: (.*)/);
if (conversationMatch) {
  const [, sessionId, userInput, assistantResponse] = conversationMatch;
  // Only include results from the specified session
  if (sessionId === conversationId) {
    results.push({ userInput, assistantResponse, sessionId });
  }
}
```

## Benefits of Session Isolation

1. **Privacy**: Conversations from different users or contexts don't mix
2. **Contextual Relevance**: Search results only include relevant conversations from the current session
3. **Scalability**: Can handle multiple concurrent sessions without interference
4. **Organization**: Clear separation of different conversation contexts

## Using Session Isolation

### Automatic Session Management
- Qwen Code automatically generates a unique session ID for each conversation
- All conversation turns are stored with the current session ID
- Searches automatically filter to the current session

### Manual Session Management
- You can manually set a session ID using `setSessionId()`
- This allows you to continue a previous conversation or group related conversations
- Useful for scenarios where you want to maintain context across multiple Qwen Code sessions

## Tools Available

The Memori extension provides two new tools that automatically respect session isolation:

1. **`store_conversation_turn`**: Stores conversation context with session awareness
2. **`search_conversation_history`**: Searches conversation history with session filtering

Both tools automatically use the current session ID unless explicitly overridden.

## Conclusion

Your custom Qwen Code installation with the Memori extension provides robust session isolation that ensures conversations are properly separated and organized. This feature enhances privacy, improves contextual relevance, and provides a better overall user experience by preventing interference between different conversation sessions.