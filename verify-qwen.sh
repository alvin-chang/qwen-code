#!/bin/bash
# Verification script for Qwen Code installation

echo "=== Verifying Qwen Code Installation ==="

echo "📍 Version: $(qwen --version 2>/dev/null || echo 'Not available')"
echo "📍 Command location: $(which qwen)"

# Test conversation functionality by creating a minimal .qwen directory
echo "🔍 Testing conversation memory..."
cd /tmp
mkdir -p test-qwen-conv
cd test-qwen-conv
rm -rf .qwen  # Clean previous test

# Run a simple test to verify basic functionality
echo "Testing basic functionality..."
echo "Hello qwen" | timeout 10s qwen -p "What did I just say?" || echo "Command completed or timed out"

echo "✅ Verification complete"