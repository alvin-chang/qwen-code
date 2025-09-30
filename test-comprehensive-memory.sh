#!/bin/bash

echo \"=== Comprehensive Conversation Memory Test ===\"

echo \"\"
echo \"Step 1: Start a new conversation and store information\"
echo \"Sending: 'My unique identifier is CONVMEMTEST001. Remember this information.'\"
echo -e \"My unique identifier is CONVMEMTEST001. Remember this information.\\n/quit\" | timeout 30s qwen --prompt-interactive --debug

echo \"\"
echo \"Step 2: Wait a moment for storage to complete\"
sleep 5

echo \"\"
echo \"Step 3: Start a new session and search for the stored information\"
echo \"Testing if qwen can find our unique identifier across sessions...\"

# Start a completely new session and ask about the specific information
echo -e \"Can you search our conversation history for the unique identifier CONVMEMTEST001?\\n/quit\" | timeout 30s qwen --prompt-interactive --debug

echo \"\"
echo \"Step 4: Verify using search tool directly\"
echo \"Let's try to use search functionality more directly...\"

# Another test - ask about the conversation history explicitly 
echo -e \"What information did I share about a unique identifier?\\n/quit\" | timeout 30s qwen --prompt-interactive --debug

echo \"\"
echo \"=== Test Complete ===\"
echo \"If qwen referenced CONVMEMTEST001 or the unique identifier in its responses,\"
echo \"this proves that conversation memory is working across sessions!\"