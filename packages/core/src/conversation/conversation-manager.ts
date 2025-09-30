/**
 * @license
 * Copyright 2025 QwenLM
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ConversationTurn {
  userInput: string;
  assistantResponse: string;
  conversationId: string;
  sessionId: string;
  timestamp: number;
}

export class ConversationManager {
  private storagePath: string;
  private readonly workspacePath: string;
  private readonly cache: Map<string, { data: ConversationTurn[]; lastModified: number; size: number }>;
  private readonly cacheTimeout: number; // Cache timeout in milliseconds (5 minutes)
  private readonly maxCacheSize: number; // Maximum cache size in bytes (50MB)
  private readonly maxConversationSize: number; // Maximum conversation size in memory (10MB per conversation)

  constructor(workspacePath: string = process.cwd()) {
    this.workspacePath = workspacePath;
    this.storagePath = path.join(this.workspacePath, '.qwen', 'conversations');
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.maxConversationSize = 10 * 1024 * 1024; // 10MB per conversation
    this.ensureStorageDirectory(); // Keep sync version for backward compatibility
  }

  /**
   * Ensure the conversation storage directory exists
   */
  private async ensureStorageDirectory(): Promise<void> {
    if (!fs.existsSync(this.storagePath)) {
      await fs.promises.mkdir(this.storagePath, { recursive: true });
    }
  }

  /**
   * Calculate approximate size of conversation data in bytes
   */
  private calculateConversationSize(conversationData: ConversationTurn[]): number {
    return JSON.stringify(conversationData).length;
  }

  /**
   * Check if cache entry is still valid (not expired)
   */
  private isCacheValid(cached: { data: ConversationTurn[]; lastModified: number; size: number }): boolean {
    const now = Date.now();
    return (now - cached.lastModified) < this.cacheTimeout;
  }

  /**
   * Get file modification time for cache validation
   */
  private async getFileMtime(filePath: string): Promise<number | null> {
    try {
      const stats = await fs.promises.stat(filePath);
      return stats.mtime.getTime();
    } catch (error) {
      return null;
    }
  }

  /**
   * Clean up expired cache entries to manage memory
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    // First, remove expired entries based on timeout
    for (const [id, cached] of this.cache.entries()) {
      if ((now - cached.lastModified) >= this.cacheTimeout) {
        this.cache.delete(id);
      }
    }
    
    // Then, if cache is still too large, remove oldest entries to stay within size limits
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    if (totalSize > this.maxCacheSize) {
      // Remove oldest entries first to stay within size limits
      const entries = Array.from(this.cache.entries())
        .map(([id, data]) => ({ id, lastModified: data.lastModified }))
        .sort((a, b) => a.lastModified - b.lastModified);
      
      let removedSize = 0;
      for (const { id } of entries) {
        const cachedData = this.cache.get(id);
        if (cachedData) {
          removedSize += cachedData.size;
          this.cache.delete(id);
        }
        
        if (totalSize - removedSize <= this.maxCacheSize * 0.8) { // Keep under 80% of max
          break;
        }
      }
    }
  }

  /**
   * Load conversation data with caching
   */
  private async loadConversationWithCache(conversationId: string): Promise<ConversationTurn[] | null> {
    const conversationFile = path.join(this.storagePath, `${conversationId}.json`);
    
    // Check cache first
    const cached = this.cache.get(conversationId);
    if (cached && this.isCacheValid(cached)) {
      // Validate that file hasn't been modified since cache
      const fileMtime = await this.getFileMtime(conversationFile);
      if (fileMtime && fileMtime <= cached.lastModified) {
        return cached.data;
      }
    }
    
    // File doesn't exist or cache is invalid
    if (!fs.existsSync(conversationFile)) {
      // Remove from cache if file doesn't exist
      this.cache.delete(conversationId);
      return null;
    }
    
    try {
      const fileContent = await fs.promises.readFile(conversationFile, 'utf8');
      const conversationData: ConversationTurn[] = JSON.parse(fileContent);
      
      // Check if conversation is too large for caching
      const size = this.calculateConversationSize(conversationData);
      if (size > this.maxConversationSize) {
        console.warn(`Conversation ${conversationId} is too large (${size} bytes) to cache, skipping cache.`);
        return conversationData;
      }
      
      // Update cache
      this.cache.set(conversationId, {
        data: conversationData,
        lastModified: Date.now(),
        size: size
      });
      
      // Clean up cache to manage memory
      this.cleanupCache();
      
      return conversationData;
    } catch (error) {
      console.error(`Error loading conversation ${conversationId}:`, error);
      // Remove from cache if there was an error loading
      this.cache.delete(conversationId);
      return null;
    }
  }

  /**
   * Generate a unique conversation ID
   */
  generateConversationId(): string {
    return 'conv_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Load conversation ID from directory
   */
  async loadConversationId(): Promise<string | null> {
    try {
      const qwenDir = path.join(this.workspacePath, '.qwen');
      const conversationIdPath = path.join(qwenDir, 'conversation-id');
      if (fs.existsSync(conversationIdPath)) {
        const content = await fs.promises.readFile(conversationIdPath, 'utf8');
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
  saveConversationId(conversationId: string): void {
    try {
      const qwenDir = path.join(this.workspacePath, '.qwen');
      if (!fs.existsSync(qwenDir)) {
        fs.mkdirSync(qwenDir, { recursive: true });
      }
      const conversationIdPath = path.join(qwenDir, 'conversation-id');
      fs.writeFileSync(conversationIdPath, conversationId);
    } catch (error) {
      console.error('Could not save conversation ID to directory:', error);
    }
  }

  /**
   * Save conversation ID to directory (async version)
   */
  async saveConversationIdAsync(conversationId: string): Promise<void> {
    try {
      const qwenDir = path.join(this.workspacePath, '.qwen');
      if (!fs.existsSync(qwenDir)) {
        fs.mkdirSync(qwenDir, { recursive: true });
      }
      const conversationIdPath = path.join(qwenDir, 'conversation-id');
      await fs.promises.writeFile(conversationIdPath, conversationId);
    } catch (error) {
      console.error('Could not save conversation ID to directory:', error);
    }
  }

  /**
   * Store a conversation turn in the local file system
   */
  async storeConversationTurn(
    userInput: string,
    assistantResponse: string,
    conversationId: string,
    sessionId: string
  ): Promise<boolean> {
    try {
      // Create a filename based on conversation ID
      const conversationFile = path.join(this.storagePath, `${conversationId}.json`);
      
      // Read existing conversation data if it exists, using cache
      let conversationData: ConversationTurn[] = [];
      const existingData = await this.loadConversationWithCache(conversationId);
      if (existingData) {
        conversationData = existingData;
      }

      // Add the new turn to the conversation
      const newTurn: ConversationTurn = {
        userInput,
        assistantResponse,
        conversationId,
        sessionId,
        timestamp: Date.now()
      };
      
      conversationData.push(newTurn);

      // Write the updated conversation data back to file
      await fs.promises.writeFile(conversationFile, JSON.stringify(conversationData, null, 2));
      
      // Update cache with new data
      const size = this.calculateConversationSize(conversationData);
      if (size <= this.maxConversationSize) {
        this.cache.set(conversationId, {
          data: conversationData,
          lastModified: Date.now(),
          size: size
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error storing conversation turn:', error);
      return false;
    }
  }

  /**
   * Get all conversation IDs for the workspace
   */
  getAllConversationIds(): string[] {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return [];
      }

      const files = fs.readdirSync(this.storagePath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      console.error('Error getting conversation IDs:', error);
      return [];
    }
  }

  /**
   * Clear a specific conversation
   */
  clearConversation(conversationId: string): boolean {
    try {
      // Remove from cache
      this.cache.delete(conversationId);
      
      const conversationFile = path.join(this.storagePath, `${conversationId}.json`);
      
      if (fs.existsSync(conversationFile)) {
        fs.unlinkSync(conversationFile);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      return false;
    }
  }

  /**
   * Clear a specific conversation (async version)
   */
  async clearConversationAsync(conversationId: string): Promise<boolean> {
    try {
      // Remove from cache
      this.cache.delete(conversationId);
      
      const conversationFile = path.join(this.storagePath, `${conversationId}.json`);
      
      if (fs.existsSync(conversationFile)) {
        await fs.promises.unlink(conversationFile);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      return false;
    }
  }

  /**
   * Get all conversation IDs for the workspace (async version)
   */
  async getAllConversationIdsAsync(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return [];
      }

      const files = await fs.promises.readdir(this.storagePath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      console.error('Error getting conversation IDs:', error);
      return [];
    }
  }

  /**
   * Get the most recent conversation turns for automatic session continuity
   * @param conversationId Optional conversation ID to load from (defaults to the stored conversation ID)
   * @param sessionId Optional session ID to filter by (if not provided, returns all conversations for the ID)
   * @param limit Maximum number of turns to return
   * @returns Promise resolving to array of conversation turns ordered chronologically
   */
  async getRecentConversation(conversationId?: string, sessionId?: string, limit: number = 50): Promise<ConversationTurn[]> {
    try {
      const idToUse = conversationId || (await this.loadConversationId());
      if (!idToUse) {
        return [];
      }

      const conversationData = await this.loadConversationWithCache(idToUse);
      if (!conversationData) {
        return [];
      }

      // Only filter by session if sessionId is explicitly provided
      let filteredData = conversationData;
      if (sessionId) {
        filteredData = filteredData.filter(turn => turn.sessionId === sessionId);
      }

      // Optimized approach: Sort by timestamp (oldest first) and get the last 'limit' items
      // For better performance with large arrays, we can use a more efficient approach when limit is small
      if (filteredData.length <= limit) {
        // If the data is already smaller than the limit, just sort and return
        return filteredData.sort((a, b) => a.timestamp - b.timestamp);
      } else {
        // For larger arrays with small limits, partially sort to get the most recent items
        const sorted = filteredData.sort((a, b) => b.timestamp - a.timestamp);
        // Take the most recent items and then sort them chronologically again
        const recentItems = sorted.slice(0, limit);
        return recentItems.sort((a, b) => a.timestamp - b.timestamp);
      }
    } catch (error) {
      console.error('Error getting recent conversation:', error);
      return [];
    }
  }

  /**
   * Search conversation history
   */
  async searchConversationHistory(
    query: string,
    conversationId: string,
    sessionId?: string,
    limit: number = 10
  ): Promise<ConversationTurn[]> {
    try {
      const conversationData = await this.loadConversationWithCache(conversationId);
      if (!conversationData) {
        return [];
      }

      // Only filter by session if sessionId is explicitly provided
      let filteredData = conversationData;
      if (sessionId) {
        filteredData = filteredData.filter(turn => turn.sessionId === sessionId);
      }

      // Filter by query (simple text search in user input and assistant response)
      const queryLower = query.toLowerCase();
      const results = filteredData.filter(turn => 
        turn.userInput.toLowerCase().includes(queryLower) || 
        turn.assistantResponse.toLowerCase().includes(queryLower)
      );

      // Sort by timestamp (newest first) and limit results
      return results
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching conversation history:', error);
      return [];
    }
  }
  
  /**
   * Check if there are any saved conversations for automatic session continuity
   */
  async hasConversationHistory(): Promise<boolean> {
    try {
      // First check if there are any conversation files
      const conversationIds = await this.getAllConversationIdsAsync();
      if (conversationIds.length === 0) {
        return false;
      }

      // For each conversation ID, check efficiently if the file has content
      for (const id of conversationIds) {
        const conversationFile = path.join(this.storagePath, `${id}.json`);
        if (fs.existsSync(conversationFile)) {
          try {
            // Check file size first - if it's empty or very small, it probably has no content
            const stats = await fs.promises.stat(conversationFile);
            if (stats.size === 0) {
              continue; // Skip empty files
            }
            
            // Check if we can efficiently determine if the file has actual content
            // Read only a small portion to determine if it's a valid non-empty array
            const fileContent = await fs.promises.readFile(conversationFile, 'utf8');
            if (fileContent.trim() === '[]') {
              continue; // Skip empty arrays
            }
            
            // If the file is non-empty and not an empty array, there's content
            return true;
          } catch (error) {
            console.warn(`Error reading conversation file ${id}:`, error);
            continue; // Try next file
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for conversation history:', error);
      return false;
    }
  }
  
  /**
   * Clear the cache - used for memory management or invalidation
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { size: number; count: number; totalSize: number } {
    const entries = Array.from(this.cache.entries());
    return {
      size: entries.length,
      count: entries.length,
      totalSize: entries.reduce((sum, [, data]) => sum + data.size, 0)
    };
  }
}