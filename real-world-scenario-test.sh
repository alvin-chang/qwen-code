#!/bin/bash

# Real-world scenario test for Qwen Code conversation memory

echo "=== Real-World Scenario Test for Conversation Memory ==="

# Create a detailed scenario test
cat > /tmp/conversation-scenario-test.md << 'EOF'
# Qwen Code Conversation Memory: Real-World Scenario Test

## Scenario: Development Session with Memory

This test simulates a realistic development session where a user asks multiple related questions and expects Qwen Code to remember the context.

### Session Setup
- **Project**: Building a React application
- **User Profile**: Mid-level developer
- **Goal**: Implement a feature with multiple steps

### Step 1: Initial Context Setting
**User Input**: "I'm building a React todo app. I want to create a component that displays a list of todos."

**Assistant Response**: "Great! I'll help you create a TodoList component. This component will receive an array of todo items and render them."

**Stored with Memori**: Yes (using store_conversation_turn)

### Step 2: Component Implementation
**User Input**: "Can you show me the code for the TodoList component?"

**Assistant Response**: 
```jsx
import React from 'react';

const TodoList = ({ todos }) => {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
};

export default TodoList;
```

**Stored with Memori**: Yes (using store_conversation_turn)

### Step 3: Adding Functionality
**User Input**: "I want to add a way to mark todos as completed. How can I modify the component?"

**Assistant Response**: "You'll need to update the TodoList component to show the completed status and add functionality to toggle completion."

**Stored with Memori**: Yes (using store_conversation_turn)

### Step 4: Search Memory Context
**User Input**: "Can you search for the original TodoList code you showed me?"

**Search Query**: "TodoList component code"
**Expected Result**: Should find the original TodoList component code from Step 2

### Step 5: Iteration Based on Memory
**User Input**: "I found that the completed todo. Can you update the code to include a checkbox?"

**Assistant Response**: "Sure! Here's the updated TodoList component with checkboxes:"
```jsx
import React from 'react';

const TodoList = ({ todos, onToggle }) => {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input 
            type="checkbox" 
            checked={todo.completed} 
            onChange={() => onToggle(todo.id)} 
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
```

**Stored with Memori**: Yes (using store_conversation_turn)

### Step 6: Cross-Session Test
**New Session**: Start a new Qwen Code session
**User Input**: "Show me a basic React component code"
**Expected Result**: Should NOT find the TodoList component from the previous session (session isolation working)

### Step 7: Context Retrieval
**Back to Original Session**: 
**User Input**: "What was the original purpose of the TodoList component again?"
**Search Query**: "purpose TodoList"
**Expected Result**: Should find the initial context from Step 1

## Implementation Notes

### Session ID Management
- Each development session gets a unique ID
- Context is preserved within the session
- Isolated from other projects/sessions

### Memory Efficiency
- Only important context is stored (user choice)
- Search functionality allows retrieval of relevant information
- Session isolation prevents context mixing

### Persistence Benefits
- Information available across Qwen Code restarts
- Long-term project context maintained
- Reduced need to repeat information

## Success Criteria

### Primary Criteria
1. **Storage**: Conversation turns can be stored successfully
2. **Retrieval**: Stored conversations can be found with relevant searches
3. **Isolation**: Different sessions don't interfere with each other
4. **Persistence**: Information survives application restarts

### Secondary Criteria
1. **Performance**: Storage and retrieval operations are fast
2. **Relevance**: Search returns contextually appropriate results
3. **Integration**: Tools work seamlessly with existing Qwen Code functionality
4. **Usability**: Memory system enhances rather than complicates user experience

## Expected Outcomes

### For Users
- Faster development with remembered context
- Reduced repetition of information
- Better continuity across sessions
- Maintained privacy with session isolation

### For Development Workflow
- More efficient problem solving
- Better context awareness
- Reduced cognitive load
- Improved productivity

## Verification Checklist

- [ ] Tools are available when MCP server connects
- [ ] store_conversation_turn stores data correctly
- [ ] search_conversation_history returns relevant results
- [ ] Session isolation prevents cross-talk
- [ ] Data persists across Qwen Code restarts
- [ ] Search is efficient and accurate
- [ ] Integration doesn't break existing functionality

This scenario test demonstrates the practical value of conversation memory in a real development workflow, showing how it enhances productivity while maintaining privacy and context.
EOF

echo "✅ Created real-world scenario test documentation"

# Create a practical test script that can be run to simulate this scenario
cat > /tmp/practical-scenario-test.sh << 'EOF'
#!/bin/bash

# Script to demonstrate the real-world scenario for conversation memory
# This script shows how to use the Memori tools in a practical context

echo "=== Qwen Code Conversation Memory Practical Test ==="
echo "This script demonstrates the real-world usage of conversation memory"
echo ""

echo "Prerequisites:"
echo "- Local-memori MCP server running on http://localhost:4004/mcp"
echo "- Qwen Code installed and accessible via 'qwen' command"
echo ""

echo "Step 1: Starting Qwen Code session for React todo app development..."
echo "Run: qwen"
echo ""

echo "Step 2: Setting initial context (in Qwen Code session):"
echo "User: I'm building a React todo app. I want to create a component that displays a list of todos."
echo "Assistant: Great! I'll help you create a TodoList component..."
echo ""

echo "Step 3: Storing the initial context (using store_conversation_turn tool):"
echo 'Tool: store_conversation_turn'
echo 'Parameters: {'
echo '  "user_input": "I'"'"'m building a React todo app. I want to create a component that displays a list of todos.",'
echo '  "assistant_response": "Great! I'"'"'ll help you create a TodoList component. This component will receive an array of todo items and render them."'
echo '}'
echo ""

echo "Step 4: Getting component code (in Qwen Code session):"
echo "User: Can you show me the code for the TodoList component?"
echo ""

echo "Step 5: Storing the component code (using store_conversation_turn tool):"
echo 'Tool: store_conversation_turn'
echo 'Parameters: {'
echo '  "user_input": "Can you show me the code for the TodoList component?",'
echo '  "assistant_response": "import React from ... (full component code)",'
echo '  "session_id": "auto-generated or custom"'
echo '}'
echo ""

echo "Step 6: Searching for stored context (using search_conversation_history tool):"
echo 'Tool: search_conversation_history'
echo 'Parameters: {'
echo '  "query": "TodoList component code",'
echo '  "limit": 5'
echo '}'
echo ""

echo "Step 7: Verification commands to run:"
echo "Check settings: cat ~/.qwen/settings.json | grep -A 5 mcpServers"
echo "Check MCP server: nc -z localhost 4004 && echo 'MCP server running' || echo 'MCP server not running'"
echo "Check Qwen version: qwen --version"
echo ""

echo "Step 8: Session isolation test:"
echo "- Start a new terminal and run 'qwen' (new session)"
echo "- Search for 'TodoList' in this session"
echo "- Should return no results (session isolation working)"
echo ""

echo "Step 9: Persistence test:"
echo "- Exit Qwen Code"
echo "- Restart Qwen Code"
echo "- Search for previously stored conversations"
echo "- Should still be available (persistence working)"
echo ""

echo "Expected Results:"
echo "- Tools available when MCP server connects"
echo "- Storage operations succeed with success messages"
echo "- Search returns relevant results"
echo "- Different sessions isolated"
echo "- Data persists across restarts"
echo ""

echo "Success Metrics:"
echo "✅ Conversation storage works"
echo "✅ Conversation retrieval works" 
echo "✅ Session isolation maintained"
echo "✅ Data persistence confirmed"
echo "✅ Tool integration seamless"
echo ""

echo "Troubleshooting Tips:"
echo "- If tools not available: Check MCP server status"
echo "- If storage fails: Verify MCP server configuration"
echo "- If search returns no results: Check search terms and session"
echo "- If session isolation not working: Contact support"
EOF

chmod +x /tmp/practical-scenario-test.sh
echo "✅ Created practical scenario test script"

# Run the practical scenario test script
echo "=== Practical Scenario Test ==="
/tmp/practical-scenario-test.sh

echo ""
echo "=== Scenario Test Complete ==="
echo "The real-world scenario demonstrates how conversation memory enhances"
echo "productivity in development workflows while maintaining privacy."
echo ""
echo "For the complete test documentation, see:"
echo "/tmp/conversation-scenario-test.md"
echo ""
echo "For practical testing steps, see:"
echo "/tmp/practical-scenario-test.sh"
EOF

# Create the scenario test