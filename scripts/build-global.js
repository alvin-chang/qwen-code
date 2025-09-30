/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Build script for global installation that doesn't rely on workspaces
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// npm install if node_modules was removed (e.g. via npm run clean or scripts/clean.js)
if (!existsSync(join(root, 'node_modules'))) {
  execSync('npm install', { stdio: 'inherit', cwd: root });
}

// Run the generate script directly to avoid workspace issues
execSync('node scripts/generate-git-commit-info.js', { stdio: 'inherit', cwd: root });

// Build the TypeScript packages individually to avoid workspace issues
execSync('npx tsc --build packages/core/tsconfig.json', { stdio: 'inherit', cwd: root });
execSync('npx tsc --build packages/cli/tsconfig.json', { stdio: 'inherit', cwd: root });

// Create the final bundle
execSync('node esbuild.config.js', { stdio: 'inherit', cwd: root });

// Also build container image if sandboxing is enabled
try {
  if (
    process.env.BUILD_SANDBOX === '1' ||
    process.env.BUILD_SANDBOX === 'true'
  ) {
    execSync('node scripts/build_sandbox.js --skip-npm-install-build', {
      stdio: 'inherit',
      cwd: root,
    });
  }
} catch {
  // ignore
}