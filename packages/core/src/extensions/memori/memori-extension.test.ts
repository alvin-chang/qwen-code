/**
 * @license
 * Copyright 2025 QwenLM
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoriExtension } from './memori-extension.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import os from 'node:os';

describe('MemoriExtension', () => {
  let memoriExtension: MemoriExtension;
  const testWorkspacePath = fs.mkdtempSync(path.join(os.tmpdir(), 'qwen-test-'));

  beforeEach(() => {
    memoriExtension = new MemoriExtension('test-project', testWorkspacePath);
  });

  afterEach(() => {
    // Clean up test directory
    try {
      fs.rmSync(testWorkspacePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with a session ID and conversation ID', () => {
      const sessionId = memoriExtension.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      
      const conversationId = memoriExtension.getConversationId();
      expect(conversationId).toBeTruthy();
      expect(typeof conversationId).toBe('string');
    });
  });

  describe('storeConversationTurn', () => {
    it('should store a conversation turn successfully', async () => {
      const result = await memoriExtension.storeConversationTurn(
        'Hello, how are you?',
        'I am doing well, thank you for asking!'
      );

      expect(result).toBe(true);
      
      // Verify that the conversation was stored in the local file system
      const conversationId = memoriExtension.getConversationId();
      const qwenDir = path.join(testWorkspacePath, '.qwen', 'conversations');
      const conversationFile = path.join(qwenDir, `${conversationId}.json`);
      
      expect(fs.existsSync(conversationFile)).toBe(true);
      
      const fileContent = JSON.parse(fs.readFileSync(conversationFile, 'utf8'));
      expect(fileContent).toHaveLength(1);
      expect(fileContent[0].userInput).toBe('Hello, how are you?');
      expect(fileContent[0].assistantResponse).toBe('I am doing well, thank you for asking!');
      expect(fileContent[0].conversationId).toBe(conversationId);
    });

    it('should use provided conversation ID and session ID when specified', async () => {
      const customConversationId = 'custom-conversation-123';
      const customSessionId = 'custom-session-456';
      
      const result = await memoriExtension.storeConversationTurn(
        'Hello, how are you?',
        'I am doing well, thank you for asking!',
        customConversationId,
        customSessionId
      );

      expect(result).toBe(true);
      
      // Verify that the conversation was stored with the custom IDs
      const qwenDir = path.join(testWorkspacePath, '.qwen', 'conversations');
      const conversationFile = path.join(qwenDir, `${customConversationId}.json`);
      
      expect(fs.existsSync(conversationFile)).toBe(true);
      
      const fileContent = JSON.parse(fs.readFileSync(conversationFile, 'utf8'));
      expect(fileContent).toHaveLength(1);
      expect(fileContent[0].userInput).toBe('Hello, how are you?');
      expect(fileContent[0].assistantResponse).toBe('I am doing well, thank you for asking!');
      expect(fileContent[0].conversationId).toBe(customConversationId);
      expect(fileContent[0].sessionId).toBe(customSessionId);
    });
  });

  describe('searchConversationHistory', () => {
    it('should search conversation history and return results', async () => {
      // First, store some conversation turns
      const conversationId = memoriExtension.getConversationId();
      const sessionId = memoriExtension.getSessionId();
      
      await memoriExtension.storeConversationTurn(
        'Hello',
        'Hi there!',
        conversationId,
        sessionId
      );
      
      await memoriExtension.storeConversationTurn(
        'How are you?',
        "I'm good!",
        conversationId,
        sessionId
      );

      const results = await memoriExtension.searchConversationHistory(
        'hello',
        conversationId ?? undefined,
        sessionId,
        5
      );

      expect(results).toHaveLength(1); // Only one that contains 'hello'
      expect(results[0].userInput).toBe('Hello');
      expect(results[0].assistantResponse).toBe('Hi there!');
      expect(results[0].conversationId).toBe(conversationId);
      expect(results[0].sessionId).toBe(sessionId);
    });

    it('should filter results by conversation ID', async () => {
      const conversationId1 = memoriExtension.getConversationId();
      const sessionId = memoriExtension.getSessionId();
      
      // Store conversations in different conversation IDs
      await memoriExtension.storeConversationTurn(
        'Hello from conversation 1',
        'Hi there from conversation 1!',
        conversationId1,
        sessionId
      );
      
      await memoriExtension.storeConversationTurn(
        'Hello from conversation 2',
        'Hi there from conversation 2!',
        'different-conversation',
        sessionId
      );

      const results = await memoriExtension.searchConversationHistory(
        'Hello',
        conversationId1 ?? undefined,
        undefined,
        5
      );

      // Should only return results from the specific conversation ID
      expect(results).toHaveLength(1);
      expect(results[0].conversationId).toBe(conversationId1);
      expect(results[0].userInput).toBe('Hello from conversation 1');
    });

    it('should return empty array when no results found', async () => {
      const conversationId = memoriExtension.getConversationId();
      
      const results = await memoriExtension.searchConversationHistory(
        'nonexistent',
        conversationId ?? undefined,
        undefined,
        5
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('getSessionId', () => {
    it('should return the current session ID', () => {
      const sessionId = memoriExtension.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
    });
  });

  describe('setSessionId', () => {
    it('should set a new session ID', () => {
      const newSessionId = 'new-session-456';
      memoriExtension.setSessionId(newSessionId);
      expect(memoriExtension.getSessionId()).toBe(newSessionId);
    });
  });

  describe('getConversationId', () => {
    it('should return the current conversation ID', () => {
      const conversationId = memoriExtension.getConversationId();
      expect(conversationId).toBeTruthy();
      expect(typeof conversationId).toBe('string');
    });
  });

  describe('setConversationId', () => {
    it('should set a new conversation ID', () => {
      const newConversationId = 'new-conversation-789';
      memoriExtension.setConversationId(newConversationId);
      expect(memoriExtension.getConversationId()).toBe(newConversationId);
    });
  });

  describe('storeCodeContext', () => {
    it('should return false since code context storage requires MCP in local mode', async () => {
      const result = await memoriExtension.storeCodeContext(
        'src/main.py',
        'print("Hello, World!")',
        'Simple hello world program'
      );

      expect(result).toBe(false);
    });
  });

  describe('searchCodeContext', () => {
    it('should return empty array since code context search requires MCP in local mode', async () => {
      const results = await memoriExtension.searchCodeContext('hello world', 5);

      expect(results).toHaveLength(0);
    });
  });
});