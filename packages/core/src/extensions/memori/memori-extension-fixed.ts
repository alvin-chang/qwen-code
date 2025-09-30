/**
 * @license
 * Copyright 2025 QwenLM
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Memori extension for Qwen Code that provides conversation memory with shared conversation support
 */
export class MemoriExtension {
  private client: Client | null = null;
  private sessionId: string;
  private conversationId: string | null = null;
  private projectId: string;
  private workspacePath: string;

  constructor(projectId: string = 'qwen-code', workspacePath: string = process.cwd()) {
    this.projectId = projectId;
    this.workspacePath = workspacePath;
    // Generate a unique session ID for this conversation session
    this.sessionId = this.generateSessionId();
    // Try to load conversation ID from directory if it exists
    this.conversationId = this.loadConversationId();
    // If no conversation ID exists, generate a new one and save it
    if (!this.conversationId) {
      this.conversationId = this.generateConversationId();
      this.saveConversationId();
    }
  }

  /**
   * Generate a simple session ID
   * @returns A unique session ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate a conversation ID
   * @returns A unique conversation ID
   */
  private generateConversationId(): string {
    return 'conv_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Load conversation ID from directory
   * @returns The conversation ID if found, null otherwise
   */
  private loadConversationId(): string | null {
    try {
      const qwenDir = path.join(this.workspacePath, '.qwen');
      const conversationIdPath = path.join(qwenDir, 'conversation-id');
      if (fs.existsSync(conversationIdPath)) {
        const content = fs.readFileSync(conversationIdPath, 'utf8');
        return content.trim();
      }
    } catch (error) {
      console.warn('Could not load conversation ID from directory:', error);
    }
    return null;
  }

  /**
   * Save conversation ID to directory
   */
  private saveConversationId(): void {
    try {
      const qwenDir = path.join(this.workspacePath, '.qwen');
      if (!fs.existsSync(qwenDir)) {
        fs.mkdirSync(qwenDir, { recursive: true });
      }
      const conversationIdPath = path.join(qwenDir, 'conversation-id');
      fs.writeFileSync(conversationIdPath, this.conversationId || this.generateConversationId());
    } catch (error) {
      console.error('Could not save conversation ID to directory:', error);
    }
  }

  /**
   * Initialize the Memori extension with an MCP client
   * @param client The MCP client to use for communication
   */
  initialize(client: Client): void {
    this.client = client;
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
    if (!this.client) {
      console.warn('Memori extension not initialized with MCP client');
      return false;
    }

    // Determine which conversation ID to use: provided > current > generate
    const effectiveConversationId = conversationId || this.conversationId || this.generateConversationId();
    const effectiveSessionId = sessionId || this.sessionId;
    
    try {
      const response = await this.client.callTool({
        name: 'store_memory',
        arguments: {
          content: `CONVERSATION_TURN [${effectiveConversationId}][${effectiveSessionId}]: USER: ${userInput} | ASSISTANT: ${assistantResponse}`,
          project_id: this.projectId,
          agent_role: 'conversation'
        }
      });

      if (response.content && Array.isArray(response.content)) {
        const textContent = response.content.find(c => c.type === 'text');
        if (textContent && textContent.text && textContent.text.includes('✅')) {
          return true;
        }
      }
      
      return false;
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
  ): Promise<Array<{userInput: string, assistantResponse: string, conversationId: string, sessionId: string}>> {
    if (!this.client) {
      console.warn('Memori extension not initialized with MCP client');
      return [];
    }

    // Determine which conversation ID to use: provided > current > generate
    const effectiveConversationId = conversationId || this.conversationId || this.generateConversationId();
    
    try {
      const response = await this.client.callTool({
        name: 'search_memory',
        arguments: {
          query: `[${effectiveConversationId}] ${query}`,
          project_id: this.projectId,
          agent_role: 'conversation',
          scope: 'agent',
          limit
        }
      });

      if (response.content && Array.isArray(response.content)) {
        const textContent = response.content.find(c => c.type === 'text');
        if (textContent && textContent.text) {
          // Parse the conversation turns from the response
          return this.parseConversationResults(textContent.text, effectiveConversationId, sessionId);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error searching conversation history:', error);
      return [];
    }
  }

  /**
   * Parse conversation results from the memory system
   * @param text The raw text response from the memory system
   * @param conversationId The conversation ID to filter by
   * @param sessionId Optional session ID to further filter by
   * @returns Array of parsed conversation turns
   */
  private parseConversationResults(
    text: string,
    conversationId: string,
    sessionId?: string
  ): Array<{userInput: string, assistantResponse: string, conversationId: string, sessionId: string}> {
    const results: Array<{userInput: string, assistantResponse: string, conversationId: string, sessionId: string}> = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('Key:') && line.includes('CONVERSATION_TURN')) {
        // Extract conversation data from the line
        // Pattern: [conversationId][sessionId]: USER: ... | ASSISTANT: ...
        const conversationMatch = line.match(/\[([^\]]+)\]\[([^\]]+)\]: USER: (.*?) \| ASSISTANT: (.*)/);
        if (conversationMatch) {
          const [, parsedConversationId, parsedSessionId, userInput, assistantResponse] = conversationMatch;
          // Only include results from the specified conversation
          if (parsedConversationId === conversationId) {
            // If a specific session ID is requested, filter by that too
            if (!sessionId || parsedSessionId === sessionId) {
              results.push({
                userInput,
                assistantResponse,
                conversationId: parsedConversationId,
                sessionId: parsedSessionId
              });
            }
          }
        }
      }
    }
    
    return results;
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
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * Set a new conversation ID
   * @param conversationId The new conversation ID
   */
  setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
    this.saveConversationId();
  }

  /**
   * Store code context in the memory system
   * @param filePath The path to the file
   * @param codeSnippet The relevant code snippet
   * @param description Description of the context
   * @returns Promise resolving to success status
   */
  async storeCodeContext(
    filePath: string,
    codeSnippet: string,
    description: string
  ): Promise<boolean> {
    if (!this.client) {
      console.warn('Memori extension not initialized with MCP client');
      return false;
    }

    try {
      const response = await this.client.callTool({
        name: 'store_memory',
        arguments: {
          content: `CODE_CONTEXT [${filePath}]: ${description}\n${codeSnippet}`,
          project_id: this.projectId,
          agent_role: 'code-context'
        }
      });

      if (response.content && Array.isArray(response.content)) {
        const textContent = response.content.find(c => c.type === 'text');
        if (textContent && textContent.text && textContent.text.includes('✅')) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error storing code context:', error);
      return false;
    }
  }

  /**
   * Search code context
   * @param query The search query
   * @param limit Maximum number of results to return
   * @returns Promise resolving to array of code contexts
   */
  async searchCodeContext(
    query: string,
    limit: number = 5
  ): Promise<Array<{filePath: string, codeSnippet: string, description: string}>> {
    if (!this.client) {
      console.warn('Memori extension not initialized with MCP client');
      return [];
    }

    try {
      const response = await this.client.callTool({
        name: 'search_memory',
        arguments: {
          query,
          project_id: this.projectId,
          agent_role: 'code-context',
          scope: 'project',
          limit
        }
      });

      if (response.content && Array.isArray(response.content)) {
        const textContent = response.content.find(c => c.type === 'text');
        if (textContent && textContent.text) {
          // Parse the code contexts from the response
          return this.parseCodeContextResults(textContent.text);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error searching code context:', error);
      return [];
    }
  }

  /**
   * Parse code context results from the memory system
   * @param text The raw text response from the memory system
   * @returns Array of parsed code contexts
   */
  private parseCodeContextResults(
    text: string
  ): Array<{filePath: string, codeSnippet: string, description: string}> {
    const results: Array<{filePath: string, codeSnippet: string, description: string}> = [];
    const lines = text.split('\n');
    
    let currentContext: {filePath: string, codeSnippet: string, description: string} | null = null;
    
    for (const line of lines) {
      if (line.startsWith('Key:') && line.includes('CODE_CONTEXT')) {
        // Start a new context entry
        if (currentContext) {
          results.push(currentContext);
        }
        
        const contextMatch = line.match(/\[([^\]]+)\]: (.*)/);
        if (contextMatch) {
          const [, filePath, description] = contextMatch;
          currentContext = {
            filePath,
            codeSnippet: '',
            description
          };
        }
      } else if (currentContext && line.trim() !== '' && !line.startsWith('---')) {
        // Append to the current code snippet
        if (currentContext.codeSnippet) {
          currentContext.codeSnippet += '\n' + line;
        } else {
          currentContext.codeSnippet = line;
        }
      }
    }
    
    // Don't forget the last context
    if (currentContext) {
      results.push(currentContext);
    }
    
    return results;
  }
}