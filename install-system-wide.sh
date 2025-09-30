#!/bin/bash

# System-wide installation script for custom Qwen Code with Memori extension

echo "=== System-wide Installation of Custom Qwen Code ==="

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

# Install dependencies with workspace errors handled
echo "📦 Installing dependencies..."
# Use a simple npm install that doesn't force workspace behavior
npm install --legacy-peer-deps || npm install

# Build the project using workspace-free build
echo "🔨 Building the project..."
node scripts/build-global.js

# Make sure the binary is executable
echo "🔧 Setting executable permissions..."
chmod +x /Users/alvin/custom-qwen-code/packages/cli/dist/index.js

# Install globally via npm
echo "🌍 Installing globally via npm..."
npm install -g .

# Create symlinks in common binary directories
echo "🔗 Creating symlinks..."

# Homebrew bin directory
ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /opt/homebrew/bin/qwen
ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /opt/homebrew/bin/qwen-code

# Standard Unix bin directories (if they exist and are writable)
if [ -w "/usr/local/bin" ]; then
  ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /usr/local/bin/qwen
  ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /usr/local/bin/qwen-code
fi

if [ -w "/usr/bin" ]; then
  ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /usr/bin/qwen
  ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /usr/bin/qwen-code
fi

# Verify installation
echo "✅ Verifying installation..."
if command -v qwen &> /dev/null; then
  echo "✅ qwen command is available"
  qwen --version
else
  echo "❌ qwen command is not available"
fi

# Create a simple update script for future use
cat > /Users/alvin/update-custom-qwen.sh << 'EOF'
#!/bin/bash
# Update script for custom Qwen Code installation

echo "=== Updating Custom Qwen Code ==="

cd /Users/alvin/custom-qwen-code

echo "🔄 Pulling latest changes..."
git pull origin enhanced-bmad-orchestrator

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "🔧 Setting permissions..."
chmod +x /Users/alvin/custom-qwen-code/packages/cli/dist/index.js

echo "🌍 Installing globally..."
npm install -g .

echo "🔗 Updating symlinks..."
ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /opt/homebrew/bin/qwen
ln -sf /Users/alvin/custom-qwen-code/packages/cli/dist/index.js /opt/homebrew/bin/qwen-code

echo "✅ Update complete!"
qwen --version
EOF

chmod +x /Users/alvin/update-custom-qwen.sh

echo "📝 Created update script at /Users/alvin/update-custom-qwen.sh"

# Create a simple verification script
cat > /Users/alvin/verify-qwen-install.sh << 'EOF'
#!/bin/bash
# Verification script for Qwen Code installation

echo "=== Verifying Qwen Code Installation ==="

echo "📍 Installation location: /Users/alvin/custom-qwen-code"
echo "🔢 Version: $(qwen --version 2>/dev/null || echo 'Not available')"

echo "🔧 Checking symlinks:"
ls -la /opt/homebrew/bin/qwen* 2>/dev/null || echo "No symlinks found in /opt/homebrew/bin"

echo "✅ Installation verification complete"
EOF

chmod +x /Users/alvin/verify-qwen-install.sh

echo "📝 Created verification script at /Users/alvin/verify-qwen-install.sh"

echo "=== System-wide Installation Complete ==="
echo "✅ Qwen Code with Memori extension is now installed system-wide"
echo "✅ Accessible via 'qwen' command from anywhere"
echo "✅ Update script available at /Users/alvin/update-custom-qwen.sh"
echo "✅ Verification script available at /Users/alvin/verify-qwen-install.sh"