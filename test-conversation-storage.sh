#!/bin/bash

# Script to test qwen's conversation memory functionality
# This script runs the expect test and verifies conversation storage

echo "Testing qwen's conversation memory functionality..."

# First, run qwen with a test conversation
echo "Starting first qwen session to create a conversation..."
echo -e "What is your favorite programming language? It's Python.\nquit" | qwen --prompt-interactive --debug

echo "First session completed. Waiting for file system sync..."
sleep 2

# Check if conversations were stored
echo "Checking for stored conversations..."
if [ -d ".qwen/conversations" ]; then
    echo "✓ Conversation directory exists"
    CONV_FILES=$(ls -1 .qwen/conversations/*.json 2>/dev/null | wc -l)
    if [ "$CONV_FILES" -gt 0 ]; then
        echo "✓ Found $CONV_FILES conversation file(s)"
        for file in .qwen/conversations/*.json; do
            echo "  - $file"
            # Show the content of each conversation file
            echo "    Content: $(cat \"$file\" | tr -d '\\n')"
            echo ""
        done
    else
        echo "✗ No conversation files found"
    fi
else
    echo "✗ Conversation directory does not exist"
fi

# Run a second conversation to verify new conversations are added
echo "Starting second qwen session to add another conversation..."
echo -e "What did I say about my favorite programming language?\nquit" | qwen --prompt-interactive --debug

echo "Second session completed. Verifying conversation storage again..."
if [ -d ".qwen/conversations" ]; then
    NEW_CONV_FILES=$(ls -1 .qwen/conversations/*.json 2>/dev/null | wc -l)
    echo "Now there are $NEW_CONV_FILES conversation file(s)"
    
    # Check if content has changed or new entries were added
    for file in .qwen/conversations/*.json; do
        echo "File: $file"
        echo "Content: $(cat \"$file\" | tr -d '\\n')"
        echo ""
    done
else
    echo "✗ Conversation directory does not exist after second session"
fi

echo "Test completed. Conversation memory functionality verification:"
if [ "$CONV_FILES" -gt 0 ] && [ "$NEW_CONV_FILES" -gt 0 ]; then
    echo "✓ Conversations are being stored successfully!"
else
    echo "✗ Conversation storage may not be working as expected."
fi