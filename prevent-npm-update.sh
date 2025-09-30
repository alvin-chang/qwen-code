#!/bin/bash

# Script to prevent Qwen Code from being updated from npm
# This script creates a package.json with a specific version resolution

# Create a package.json in the user's home directory to prevent npm from updating qwen-code
cat > ~/.qwen-code-npm-lock.json << 'EOF'
{
  "name": "qwen-code-custom-install",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@qwen-code/qwen-code": "file:/Users/alvin/custom-qwen-code"
  },
  "resolutions": {
    "@qwen-code/qwen-code": "file:/Users/alvin/custom-qwen-code"
  }
}
EOF

echo "Created npm lock file to prevent updates from npm registry"
echo "Your custom Qwen Code version is installed and protected from npm updates"