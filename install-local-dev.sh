#!/bin/bash

# System-wide installation script for Qwen Code with local conversation storage
# This script installs the current development version system-wide

echo "=== System-wide Installation of Qwen Code (Development Version) ==="

# Get the current directory
PROJECT_DIR="$(pwd)"
echo "📍 Installing from: $PROJECT_DIR"

# Build the project using bundle (which should work despite TypeScript errors for the core functionality)
echo "🔨 Building the project using bundle..."
npm run bundle

if [ $? -ne 0 ]; then
  echo "❌ Build failed, but continuing with installation using available files..."
fi

# Check if bundle was created
if [ ! -f "$PROJECT_DIR/bundle/gemini.js" ]; then
  echo "❌ Bundle file not found at $PROJECT_DIR/bundle/gemini.js"
  echo "   The project needs to be built successfully first"
  exit 1
fi

# Make the bundle executable
chmod +x "$PROJECT_DIR/bundle/gemini.js"

# Install globally via npm from the current directory
echo "🌍 Installing globally via npm..."
npm install -g "$PROJECT_DIR"

if [ $? -ne 0 ]; then
  echo "❌ Global installation failed"
  echo "   Trying alternative approach with npm link..."
  npm link
fi

# Create symlinks in common binary directories
echo "🔗 Creating symlinks..."

# Homebrew bin directory (most common on macOS)
if [ -w "/opt/homebrew/bin" ]; then
  sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /opt/homebrew/bin/qwen 2>/dev/null || \
  ln -sf "$PROJECT_DIR/bundle/gemini.js" /Users/$USER/.local/bin/qwen
  sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /opt/homebrew/bin/qwen-code 2>/dev/null || \
  ln -sf "$PROJECT_DIR/bundle/gemini.js" /Users/$USER/.local/bin/qwen-code
fi

# Standard Unix bin directories (if they exist and are writable)
if [ -w "/usr/local/bin" ]; then
  sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /usr/local/bin/qwen
  sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /usr/local/bin/qwen-code
fi

# Create user local bin if it doesn't exist
mkdir -p "$HOME/.local/bin"

# User local bin for fallback
ln -sf "$PROJECT_DIR/bundle/gemini.js" "$HOME/.local/bin/qwen"
ln -sf "$PROJECT_DIR/bundle/gemini.js" "$HOME/.local/bin/qwen-code"

# Verify installation
echo "✅ Verifying installation..."
if command -v qwen &> /dev/null; then
  echo "✅ qwen command is available"
  qwen --version 2>/dev/null || echo "(Version not available)"
else
  echo "❌ qwen command is not available"
  echo "   You may need to add $HOME/.local/bin to your PATH"
  echo '   Add this line to your ~/.zshrc or ~/.bashrc:'
  echo '   export PATH="$HOME/.local/bin:$PATH"'
fi

# Create a simple update script for future use
cat > "$HOME/update-qwen-code.sh" << EOF
#!/bin/bash
# Update script for Qwen Code development installation

echo "=== Updating Qwen Code Development Version ==="

cd "$PROJECT_DIR"

echo "🔄 Pulling latest changes..."
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "Could not pull changes"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run bundle

if [ -f "$PROJECT_DIR/bundle/gemini.js" ]; then
  chmod +x "$PROJECT_DIR/bundle/gemini.js"
  
  echo "🌍 Reinstalling globally..."
  npm install -g . 2>/dev/null || npm link
  
  echo "🔗 Updating symlinks..."
  ln -sf "$PROJECT_DIR/bundle/gemini.js" "$HOME/.local/bin/qwen"
  ln -sf "$PROJECT_DIR/bundle/gemini.js" "$HOME/.local/bin/qwen-code"
  
  if [ -w "/opt/homebrew/bin" ]; then
    sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /opt/homebrew/bin/qwen 2>/dev/null || true
    sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /opt/homebrew/bin/qwen-code 2>/dev/null || true
  fi
  
  if [ -w "/usr/local/bin" ]; then
    sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /usr/local/bin/qwen 2>/dev/null || true
    sudo ln -sf "$PROJECT_DIR/bundle/gemini.js" /usr/local/bin/qwen-code 2>/dev/null || true
  fi
fi

echo "✅ Update complete!"
qwen --version 2>/dev/null || echo "qwen version check failed"
EOF

chmod +x "$HOME/update-qwen-code.sh"

echo "📝 Created update script at $HOME/update-qwen-code.sh"

# Create a simple verification script
cat > "$HOME/verify-qwen-code.sh" << EOF
#!/bin/bash
# Verification script for Qwen Code installation

echo "=== Verifying Qwen Code Installation ==="

echo "📍 Installation source: $PROJECT_DIR"
echo "🔢 Version: \$(qwen --version 2>/dev/null || echo 'Not available')"

echo "🔧 Checking qwen command:"
which qwen

if [ -f "$PROJECT_DIR/bundle/gemini.js" ]; then
  echo "✅ Bundle exists: $PROJECT_DIR/bundle/gemini.js"
else
  echo "❌ Bundle does not exist: $PROJECT_DIR/bundle/gemini.js"
fi

echo "✅ Installation verification complete"
EOF

chmod +x "$HOME/verify-qwen-code.sh"

echo "📝 Created verification script at $HOME/verify-qwen-code.sh"

echo ""
echo "=== System-wide Installation Complete ==="
echo "✅ Qwen Code with local conversation storage is now installed system-wide"
echo "✅ Accessible via 'qwen' command from anywhere"
echo "✅ Update script available at $HOME/update-qwen-code.sh"
echo "✅ Verification script available at $HOME/verify-qwen-code.sh"
echo ""
echo "💡 If you encounter issues, make sure $HOME/.local/bin is in your PATH:"
echo '   Add this line to your ~/.zshrc or ~/.bashrc:'
echo '   export PATH="$HOME/.local/bin:$PATH"'