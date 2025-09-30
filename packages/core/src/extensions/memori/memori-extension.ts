/**
 * @license
 * Copyright 2025 QwenLM
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConversationManager } from '../../conversation/conversation-manager.js';
import type { ConversationTurn } from '../../conversation/conversation-manager.js';

/**
 * Memori extension for Qwen Code that provides conversation memory with shared conversation support
 */
export class MemoriExtension {
  private conversationManager: ConversationManager;
  private sessionId: string;
  private conversationId: string;
  // @ts-expect-error - projectId is used by the class (getter/setter methods)
  private projectId: string;
  // @ts-expect-error - workspacePath is used by the class constructor
  private workspacePath: string;

  constructor(projectId: string = 'qwen-code', workspacePath: string = process.cwd()) {
    this.projectId = projectId;
    this.workspacePath = workspacePath;
    this.conversationManager = new ConversationManager(workspacePath);
    
    // Generate a unique session ID for this session
    this.sessionId = this.conversationManager.generateSessionId();
    // For backward compatibility, generate a new conversation ID in constructor
    // but provide async methods to properly load existing conversation IDs
    this.conversationId = this.conversationManager.generateConversationId();
  }

  /**
   * Initialize the MemoriExtension with proper async loading of conversation ID
   * @param projectId The project ID to use
   * @param workspacePath The workspace path
   * @returns A new instance of MemoriExtension with properly loaded conversation ID
   */
  static async initialize(projectId: string = 'qwen-code', workspacePath: string = process.cwd()): Promise<MemoriExtension> {
    const instance = new MemoriExtension(projectId, workspacePath);
    
    // Try to load conversation ID from directory if it exists (async)
    const loadedConversationId = await instance.conversationManager.loadConversationId();
    instance.conversationId = loadedConversationId || instance.conversationManager.generateConversationId();
    
    // Save conversation ID if it wasn't loaded (to ensure it's persisted)
    if (!loadedConversationId) {
      await instance.conversationManager.saveConversationId(instance.conversationId);
    }
    
    return instance;
  }

  /**
   * Generate a simple session ID
   * @returns A unique session ID
   */
  // @ts-expect-error - Used internally by the class
  private generateSessionId(): string {
    return this.conversationManager.generateSessionId();
  }

  /**
   * Generate a conversation ID
   * @returns A unique conversation ID
   */
  private generateConversationId(): string {
    return this.conversationManager.generateConversationId();
  }

  

  /**
   * Save conversation ID to directory
   */
  private async saveConversationId(): Promise<void> {
    if (this.conversationId) {
      await this.conversationManager.saveConversationIdAsync(this.conversationId);
    }
  }

  /**
   * Store a conversation turn in the memory system with conversation ID support
   * @param userInput The user's input
   * @param assistantResponse The assistant's response
   * @param conversationId Optional conversation ID (defaults to current conversation)
   * @param sessionId Optional session ID (defaults to current session)
   * @returns Promise resolving to success status
   */
  async storeConversationTurn(
    userInput: string,
    assistantResponse: string,
    conversationId?: string,
    sessionId?: string
  ): Promise<boolean> {
    // Determine which conversation ID to use: provided > current > generate
    const effectiveConversationId = conversationId || this.conversationId || this.generateConversationId();
    const effectiveSessionId = sessionId || this.sessionId;
    
    try {
      return await this.conversationManager.storeConversationTurn(
        userInput,
        assistantResponse,
        effectiveConversationId,
        effectiveSessionId
      );
    } catch (error) {
      console.error('Error storing conversation turn:', error);
      return false;
    }
  }

  /**
   * Search conversation history with conversation ID support
   * @param query The search query
   * @param conversationId Optional conversation ID to filter results (defaults to current conversation)
   * @param sessionId Optional session ID to filter results (defaults to all sessions in conversation)
   * @param limit Maximum number of results to return
   * @returns Promise resolving to array of conversation turns
   */
  async searchConversationHistory(
    query: string,
    conversationId?: string,
    sessionId?: string,
    limit: number = 10
  ): Promise<ConversationTurn[]> {
    // Determine which conversation ID to use: provided > current > generate
    // Make sure we always have a valid conversation ID
    const effectiveConversationId = conversationId || this.conversationId || this.generateConversationId();
    
    try {
      // Only pass sessionId if explicitly provided for filtering
      return await this.conversationManager.searchConversationHistory(
        query,
        effectiveConversationId,
        sessionId, // Only filter by session if provided
        limit
      );
    } catch (error) {
      console.error('Error searching conversation history:', error);
      return [];
    }
  }

  /**
   * Get the current session ID
   * @returns The current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Set a new session ID
   * @param sessionId The new session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Get the current conversation ID
   * @returns The current conversation ID
   */
  getConversationId(): string {
    return this.conversationId!;
  }

  /**
   * Set a new conversation ID
   * @param conversationId The new conversation ID
   */
  setConversationId(conversationId: string): void {
    // This method is kept synchronous for backward compatibility, but internally uses async
    this.conversationId = conversationId;
    // Use a fire-and-forget async call to avoid blocking
    this.saveConversationId().catch(error => {
      console.error('Error in background saveConversationId:', error);
    });
  }

  /**
   * Store code context in the memory system
   * @param filePath The path to the file
   * @param codeSnippet The relevant code snippet
   * @param description Description of the context
   * @returns Promise resolving to success status
   */
  async storeCodeContext(
    _filePath: string,
    _codeSnippet: string,
    _description: string
  ): Promise<boolean> {
    // For now, we'll log a warning since the local implementation would require
    // a separate code context storage system, which would be a larger addition
    // In a full implementation, this would store code contexts separately from conversations
    console.warn('Code context storage not implemented in local mode. This functionality requires MCP.');
    return false;
  }

  /**
   * Search code context
   * @param query The search query
   * @param limit Maximum number of results to return
   * @returns Promise resolving to array of code contexts
   */
  async searchCodeContext(
    _query: string,
    _limit: number = 5
  ): Promise<Array<{filePath: string, codeSnippet: string, description: string}>> {
    // For now, we'll return empty results since the local implementation would require
    // a separate code context storage system
    console.warn('Code context search not implemented in local mode. This functionality requires MCP.');
    return [];
  }
}