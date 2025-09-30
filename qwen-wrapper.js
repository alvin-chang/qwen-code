#!/usr/bin/env node

// This is a wrapper for the qwen-code binary
// It ensures the bundled version runs without hanging issues
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the actual binary
const geminiPath = join(__dirname, 'bundle', 'gemini.js');
import(geminiPath).catch(err => {
  console.error('Error loading qwen binary:', err.message);
  process.exit(1);
});