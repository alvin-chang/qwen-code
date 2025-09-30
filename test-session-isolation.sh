#!/bin/bash

# Test script to verify conversation memory and session isolation in custom Qwen Code

echo "Testing conversation memory and session isolation..."

# Create a test directory
TEST_DIR="/tmp/qwen-code-session-test"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Create settings file with MCP server configuration
cat > .qwenrc << 'EOF'
{
  "mcpServers": {
    "local-memori": {
      "httpUrl": "http://localhost:4004/mcp",
      "headers": {}
    }
  },
  "memori": {
    "project_id": "qwen-code-test",
    "default_agent_role": "code-assistant",
    "conversation_agent_role": "conversation",
    "code_context_agent_role": "code-context"
  }
}
EOF

echo "Created test configuration with MCP server settings"

# Since we can't actually run the local-memori server in this test,
# let's create a simple Node.js script to test the Memori extension functionality directly

cat > test-memori.js << 'EOF'
const { MemoriExtension } = require('./packages/core/src/extensions/memori');

// Mock MCP Client
const mockClient = {
  callTool: async (params) => {
    // Simulate different responses based on the tool being called
    if (params.name === 'store_memory') {
      console.log(`[MOCK] Storing memory: ${params.arguments.content}`);
      return {
        content: [{ type: 'text', text: '✅ Stored memory successfully' }]
      };
    } else if (params.name === 'search_memory') {
      // Simulate search results based on query
      if (params.arguments.query.includes('session-1')) {
        return {
          content: [{
            type: 'text',
            text: `Key: [test-project][conversation] CONVERSATION_TURN [session-1]: USER: Hello in session 1 | ASSISTANT: Hi there from session 1`
          }]
        };
      } else if (params.arguments.query.includes('session-2')) {
        return {
          content: [{
            type: 'text',
            text: `Key: [test-project][conversation] CONVERSATION_TURN [session-2]: USER: Hello in session 2 | ASSISTANT: Hi there from session 2`
          }]
        };
      } else {
        return {
          content: [{ type: 'text', text: '🔍 No memories found' }]
        };
      }
    }
    return { content: [] };
  }
};

async function testSessionIsolation() {
  console.log("=== Testing Session Isolation ===");
  
  // Create two memori extensions with different session IDs
  const memori1 = new MemoriExtension('test-project');
  memori1.setSessionId('session-1');
  memori1.initialize(mockClient);
  
  const memori2 = new MemoriExtension('test-project');
  memori2.setSessionId('session-2');
  memori2.initialize(mockClient);
  
  console.log(`Session 1 ID: ${memori1.getSessionId()}`);
  console.log(`Session 2 ID: ${memori2.getSessionId()}`);
  
  // Store conversations in different sessions
  console.log("\n--- Storing conversation in Session 1 ---");
  const result1 = await memori1.storeConversationTurn(
    'Hello in session 1',
    'Hi there from session 1'
  );
  console.log(`Store result for session 1: ${result1}`);
  
  console.log("\n--- Storing conversation in Session 2 ---");
  const result2 = await memori2.storeConversationTurn(
    'Hello in session 2',
    'Hi there from session 2'
  );
  console.log(`Store result for session 2: ${result2}`);
  
  // Search in session 1 - should only find session 1 content
  console.log("\n--- Searching in Session 1 ---");
  const searchResults1 = await memori1.searchConversationHistory('hello', 'session-1');
  console.log(`Search results for session 1:`, searchResults1);
  
  // Search in session 2 - should only find session 2 content
  console.log("\n--- Searching in Session 2 ---");
  const searchResults2 = await memori2.searchConversationHistory('hello', 'session-2');
  console.log(`Search results for session 2:`, searchResults2);
  
  // Verify isolation - searching for session 1 content in session 2 should return empty
  console.log("\n--- Verifying isolation (searching for session 1 content in session 2) ---");
  const isolatedSearch = await memori2.searchConversationHistory('session-1');
  console.log(`Isolated search results:`, isolatedSearch);
  
  console.log("\n=== Test Complete ===");
  console.log("If session isolation is working correctly:");
  console.log("- Each session should only find its own conversation turns");
  console.log("- Session 1 search should not return Session 2 content and vice versa");
}

testSessionIsolation().catch(console.error);
EOF

echo "Created test script for Memori extension"

# Try to run the test script
echo "Running Memori extension test..."
node test-memori.js

# Clean up
cd ..
# rm -rf "$TEST_DIR"

echo "Test completed!"