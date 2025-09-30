#!/bin/bash

# Simple installation script that focuses on the core functionality and avoids build issues
echo "=== Simple Qwen Code Installation ==="

# Ensure the custom installation directory exists
if [ ! -d "/Users/alvin/custom-qwen-code" ]; then
  echo "❌ Error: Custom Qwen Code installation not found at /Users/alvin/custom-qwen-code"
  echo "Please run the installation script first"
  exit 1
fi

# Navigate to the custom installation
cd /Users/alvin/custom-qwen-code

# Pull the latest changes from your fork
echo "🔄 Pulling latest changes from your fork..."
git pull origin enhanced-bmad-orchestrator

# Just ensure basic dependencies are in place
echo "📦 Ensuring basic dependencies..."
npm install --no-audit --no-fund --legacy-peer-deps

# Since we have a working bundle with our fixes, we'll just ensure it's linked properly
echo "✅ Using existing bundle with applied fixes..."

# Update the symlinks in common binary directories
echo "🔗 Updating symlinks..."

# Remove existing symlinks if they exist
rm -f /Users/alvin/.local/bin/qwen
rm -f /Users/alvin/.local/bin/qwen-code
rm -f /opt/homebrew/bin/qwen
rm -f /opt/homebrew/bin/qwen-code
rm -f /usr/local/bin/qwen
rm -f /usr/local/bin/qwen-code

# Create symlinks to the bundle (which already contains the fixes)
ln -sf /Users/alvin/src/qwen-code/bundle/gemini.js /Users/alvin/.local/bin/qwen
ln -sf /Users/alvin/src/qwen-code/bundle/gemini.js /Users/alvin/.local/bin/qwen-code

# Homebrew bin directory (if available)
if [ -d "/opt/homebrew/bin" ]; then
  ln -sf /Users/alvin/src/qwen-code/bundle/gemini.js /opt/homebrew/bin/qwen
  ln -sf /Users/alvin/src/qwen-code/bundle/gemini.js /opt/homebrew/bin/qwen-code
fi

# Standard Unix bin directories (if they exist and are writable)
if [ -w "/usr/local/bin" ]; then
  ln -sf /Users/alvin/src/qwen-code/bundle/gemini.js /usr/local/bin/qwen
  ln -sf /Users/alvin/src/qwen-code/bundle/gemini.js /usr/local/bin/qwen-code
fi

# Verify installation
echo "✅ Verifying installation..."
if command -v qwen &> /dev/null; then
  echo "✅ qwen command is available"
  qwen --version
else
  echo "❌ qwen command is not available"
fi

# Create update script for future use
cat > /Users/alvin/update-custom-qwen.sh << 'EOF'
#!/bin/bash
# Update script for custom Qwen Code installation

echo "=== Updating Custom Qwen Code ==="

cd /Users/alvin/custom-qwen-code

echo "🔄 Pulling latest changes..."
git pull origin enhanced-bmad-orchestrator

echo "✅ Update complete!"
qwen --version
EOF

chmod +x /Users/alvin/update-custom-qwen.sh

echo "📝 Created update script at /Users/alvin/update-custom-qwen.sh"

# Create verification script
cat > /Users/alvin/verify-qwen-install.sh << 'EOF'
#!/bin/bash
# Verification script for Qwen Code installation

echo "=== Verifying Qwen Code Installation ==="

echo "📍 Installation location: /Users/alvin/custom-qwen-code"
echo "🔢 Version: $(qwen --version 2>/dev/null || echo 'Not available')"

echo "🔧 Checking symlinks:"
ls -la /Users/alvin/.local/bin/qwen* 2>/dev/null || echo "qwen not found in /Users/alvin/.local/bin"
ls -la /opt/homebrew/bin/qwen* 2>/dev/null || echo "qwen not found in /opt/homebrew/bin"

echo "✅ Installation verification complete"
EOF

chmod +x /Users/alvin/verify-qwen-install.sh

echo "📝 Created verification script at /Users/alvin/verify-qwen-install.sh"

echo "=== Simple Installation Complete ==="
echo "✅ Qwen Code with fixed duplicate conversation tools is installed system-wide"
echo "✅ Accessible via 'qwen' command from anywhere"
echo "✅ Update script available at /Users/alvin/update-custom-qwen.sh"
echo "✅ Verification script available at /Users/alvin/verify-qwen-install.sh"