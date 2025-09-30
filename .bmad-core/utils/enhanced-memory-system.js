// Enhanced Memory System Utility for BMAD
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class EnhancedMemorySystem {
  constructor(config) {
    this.config = config || {};
    this.storagePath = this.config.storage?.location || '.ai/memory';
    this.format = this.config.storage?.format || 'json';
    this.compressionEnabled = this.config.compression?.enabled || false;
    this.prefixes = this.config.prefixes || {};
  }

  /**
   * Store memory with enhanced metadata
   * @param {string} prefix - Memory prefix
   * @param {string} content - Memory content
   * @param {Object} options - Storage options
   * @returns {Object} Stored memory object
   */
  async storeMemory(prefix, content, options = {}) {
    try {
      // Generate unique ID
      const id = this.generateId();
      
      // Create memory object with enhanced metadata
      const memory = {
        id,
        prefix,
        content,
        timestamp: new Date().toISOString(),
        agent_role: options.agent_role || 'unknown',
        project_id: options.project_id || 'default',
        tags: options.tags || [],
        related_memories: options.related_memories || [],
        usage_count: 0,
        last_accessed: new Date().toISOString(),
        confidence: options.confidence || 1.0,
        source: options.source || 'manual',
        access_permissions: options.access_permissions || ['read-only']
      };
      
      // Determine storage path
      let storageDir = this.storagePath;
      if (this.config.isolation?.project) {
        storageDir = path.join(storageDir, 'projects', memory.project_id);
      }
      if (this.config.isolation?.agent) {
        storageDir = path.join(storageDir, 'agents', memory.agent_role);
      }
      
      // Ensure directory exists
      await fs.ensureDir(storageDir);
      
      // Store memory
      const filePath = path.join(storageDir, `${id}.${this.format}`);
      await fs.writeJson(filePath, memory, { spaces: 2 });
      
      return memory;
    } catch (error) {
      throw new Error(`Failed to store memory: ${error.message}`);
    }
  }

  /**
   * Update existing memory with new content
   * @param {string} memoryId - Memory ID to update
   * @param {string} content - New content
   * @param {Object} options - Update options
   * @returns {Object} Updated memory object
   */
  async updateMemory(memoryId, content, options = {}) {
    try {
      // Retrieve existing memory
      const existingMemory = await this.retrieveMemory(memoryId, options);
      if (!existingMemory) {
        throw new Error(`Memory with ID ${memoryId} not found`);
      }
      
      // Update memory content and metadata
      existingMemory.content = content;
      existingMemory.last_updated = new Date().toISOString();
      
      // Update optional fields if provided
      if (options.confidence !== undefined) {
        existingMemory.confidence = options.confidence;
      }
      if (options.tags) {
        existingMemory.tags = options.tags;
      }
      if (options.related_memories) {
        existingMemory.related_memories = options.related_memories;
      }
      
      // Update the memory file
      const memoryPath = this.getMemoryPath(existingMemory);
      if (memoryPath) {
        await fs.writeJson(memoryPath, existingMemory, { spaces: 2 });
        return existingMemory;
      } else {
        throw new Error(`Unable to determine memory path for ID ${memoryId}`);
      }
    } catch (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }
  }

  /**
   * Delete memory by ID
   * @param {string} memoryId - Memory ID to delete
   * @param {Object} options - Delete options
   * @returns {boolean} True if deletion was successful
   */
  async deleteMemory(memoryId, options = {}) {
    try {
      // First retrieve the memory to get its path
      const memory = await this.retrieveMemory(memoryId, options);
      if (!memory) {
        return false; // Memory not found
      }
      
      // Get the file path
      const memoryPath = this.getMemoryPath(memory);
      if (!memoryPath) {
        throw new Error(`Unable to determine memory path for ID ${memoryId}`);
      }
      
      // Delete the file
      if (await fs.pathExists(memoryPath)) {
        await fs.remove(memoryPath);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Search memories with advanced filtering
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of matching memories
   */
  async searchMemory(query, options = {}) {
    try {
      const results = [];
      const searchDirs = this.getSearchDirectories(options);
      
      // Search in each directory
      for (const dir of searchDirs) {
        if (await fs.pathExists(dir)) {
          const files = await fs.readdir(dir);
          for (const file of files) {
            if (file.endsWith(`.${this.format}`)) {
              try {
                const filePath = path.join(dir, file);
                const memory = await fs.readJson(filePath);
                
                // Apply filters
                if (this.matchesQuery(memory, query, options)) {
                  results.push(memory);
                }
              } catch (fileError) {
                // Skip files that can't be read
                continue;
              }
            }
          }
        }
      }
      
      // Sort by relevance and timestamp
      results.sort((a, b) => {
        // Higher confidence first
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        // More recent first
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      // Apply limits
      if (options.limit) {
        return results.slice(0, options.limit);
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to search memory: ${error.message}`);
    }
  }

  /**
   * Share memory with other agents
   * @param {string} memoryId - Memory ID to share
   * @param {Array|string} withAgents - Agents to share with
   * @param {Object} options - Sharing options
   * @returns {Object} Sharing result
   */
  async shareMemory(memoryId, withAgents, options = {}) {
    try {
      // Get the memory to share
      const memory = await this.retrieveMemory(memoryId, options);
      if (!memory) {
        throw new Error(`Memory with ID ${memoryId} not found`);
      }
      
      // Prepare sharing metadata
      const shareRecord = {
        id: this.generateId(),
        memory_id: memoryId,
        from_agent: options.from_agent || 'unknown',
        to_agents: Array.isArray(withAgents) ? withAgents : [withAgents],
        timestamp: new Date().toISOString(),
        context: options.context || '',
        permissions: options.permissions || ['read-only']
      };
      
      // Store sharing record
      const shareDir = path.join(this.storagePath, 'shared');
      await fs.ensureDir(shareDir);
      const sharePath = path.join(shareDir, `${shareRecord.id}.${this.format}`);
      await fs.writeJson(sharePath, shareRecord, { spaces: 2 });
      
      return shareRecord;
    } catch (error) {
      throw new Error(`Failed to share memory: ${error.message}`);
    }
  }

  /**
   * Retrieve specific memory by ID
   * @param {string} memoryId - Memory ID
   * @param {Object} options - Retrieval options
   * @returns {Object} Memory object
   */
  async retrieveMemory(memoryId, options = {}) {
    try {
      const searchDirs = this.getSearchDirectories(options);
      
      // Search for memory in directories
      for (const dir of searchDirs) {
        if (await fs.pathExists(dir)) {
          const filePath = path.join(dir, `${memoryId}.${this.format}`);
          if (await fs.pathExists(filePath)) {
            const memory = await fs.readJson(filePath);
            
            // Update access metadata
            memory.usage_count = (memory.usage_count || 0) + 1;
            memory.last_accessed = new Date().toISOString();
            await fs.writeJson(filePath, memory, { spaces: 2 });
            
            return memory;
          }
        }
      }
      
      return null;
    } catch (error) {
      throw new Error(`Failed to retrieve memory: ${error.message}`);
    }
  }

  /**
   * Detect patterns in memories
   * @param {string} prefix - Memory prefix to analyze
   * @param {Object} options - Analysis options
   * @returns {Array} Array of detected patterns
   */
  async detectPatterns(prefix, options = {}) {
    try {
      // Search for memories with the given prefix
      const memories = await this.searchMemory(prefix, { 
        prefix_only: true,
        limit: options.limit || 100
      });
      
      if (memories.length < 2) {
        return [];
      }
      
      // Simple pattern detection based on content similarity
      const patterns = [];
      const similarityThreshold = options.similarity_threshold || 0.7;
      
      // Compare memories to find similar ones
      for (let i = 0; i < memories.length; i++) {
        for (let j = i + 1; j < memories.length; j++) {
          const similarity = this.calculateSimilarity(
            memories[i].content, 
            memories[j].content
          );
          
          if (similarity >= similarityThreshold) {
            // Check if we already have a pattern for this group
            let patternGroup = patterns.find(p => 
              p.memories.includes(memories[i].id)
            );
            
            if (!patternGroup) {
              patternGroup = {
                id: this.generateId(),
                type: 'content_similarity',
                memories: [memories[i].id, memories[j].id],
                similarity_score: similarity,
                pattern_content: this.extractCommonContent(
                  memories[i].content, 
                  memories[j].content
                )
              };
              patterns.push(patternGroup);
            } else {
              // Add to existing pattern group if not already there
              if (!patternGroup.memories.includes(memories[j].id)) {
                patternGroup.memories.push(memories[j].id);
                patternGroup.similarity_score = Math.min(
                  patternGroup.similarity_score, 
                  similarity
                );
              }
            }
          }
        }
      }
      
      return patterns;
    } catch (error) {
      throw new Error(`Failed to detect patterns: ${error.message}`);
    }
  }

  /**
   * Compress memories based on usage patterns
   * @param {Object} options - Compression options
   * @returns {Object} Compression result
   */
  async compressMemory(options = {}) {
    try {
      if (!this.compressionEnabled) {
        return { compressed: 0, message: 'Compression disabled' };
      }
      
      const threshold = options.threshold || this.config.compression?.threshold || 100;
      const strategy = options.strategy || this.config.compression?.strategy || 'usage_frequency';
      
      // Get all memories
      const allMemories = await this.searchMemory('', { limit: 10000 });
      
      let compressedCount = 0;
      
      for (const memory of allMemories) {
        // Apply compression strategy
        let shouldCompress = false;
        
        switch (strategy) {
          case 'usage_frequency':
            // Compress memories with low usage count
            shouldCompress = (memory.usage_count || 0) < threshold;
            break;
            
          case 'age_based':
            // Compress old memories
            const ageInDays = (Date.now() - new Date(memory.timestamp)) / (1000 * 60 * 60 * 24);
            shouldCompress = ageInDays > (options.days_old || 30);
            break;
            
          case 'size_based':
            // Compress large memories
            shouldCompress = (memory.content.length || 0) > (options.max_size || 10000);
            break;
        }
        
        if (shouldCompress) {
          // In a real implementation, we would compress the memory content
          // For now, we'll just update a compression flag
          memory.compressed = true;
          
          // Update the memory file
          const memoryPath = this.getMemoryPath(memory);
          if (memoryPath) {
            await fs.writeJson(memoryPath, memory, { spaces: 2 });
            compressedCount++;
          }
        }
      }
      
      return {
        compressed: compressedCount,
        total: allMemories.length,
        strategy: strategy,
        message: `Compressed ${compressedCount} out of ${allMemories.length} memories`
      };
    } catch (error) {
      throw new Error(`Failed to compress memory: ${error.message}`);
    }
  }

  // Helper methods
  
  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return crypto.randomUUID();
  }
  
  /**
   * Get directories to search based on options
   * @param {Object} options - Search options
   * @returns {Array} Array of directory paths
   */
  getSearchDirectories(options) {
    const dirs = [];
    
    // Base directory
    dirs.push(this.storagePath);
    
    // Project-specific directories
    if (options.project_id && this.config.isolation?.project) {
      dirs.push(path.join(this.storagePath, 'projects', options.project_id));
    }
    
    // Agent-specific directories
    if (options.agent_role && this.config.isolation?.agent) {
      dirs.push(path.join(this.storagePath, 'agents', options.agent_role));
    }
    
    // Session-specific directories
    if (options.session_id && this.config.isolation?.session) {
      dirs.push(path.join(this.storagePath, 'sessions', options.session_id));
    }
    
    return dirs;
  }
  
  /**
   * Check if memory matches query
   * @param {Object} memory - Memory object
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {boolean} True if memory matches
   */
  matchesQuery(memory, query, options) {
    // Prefix filtering
    if (options.prefix_only && memory.prefix !== query) {
      return false;
    }
    
    // Content matching
    if (query && !memory.content.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    
    // Tag filtering
    if (options.tags && options.tags.length > 0) {
      const memoryTags = memory.tags || [];
      const hasTag = options.tags.some(tag => memoryTags.includes(tag));
      if (!hasTag) return false;
    }
    
    // Date filtering
    if (options.since) {
      const memoryDate = new Date(memory.timestamp);
      const sinceDate = new Date(options.since);
      if (memoryDate < sinceDate) return false;
    }
    
    if (options.until) {
      const memoryDate = new Date(memory.timestamp);
      const untilDate = new Date(options.until);
      if (memoryDate > untilDate) return false;
    }
    
    return true;
  }
  
  /**
   * Calculate similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    // Simple implementation using string length and common substrings
    // In a real implementation, you might use more sophisticated algorithms
    
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;
    
    // Calculate Jaccard similarity of character sets
    const set1 = new Set([...str1.toLowerCase()]);
    const set2 = new Set([...str2.toLowerCase()]);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Extract common content between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {string} Common content
   */
  extractCommonContent(str1, str2) {
    // Simple implementation - in a real system, you might use diff algorithms
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return [...new Set(commonWords)].join(' ');
  }
  
  /**
   * Get file path for a memory object
   * @param {Object} memory - Memory object
   * @returns {string|null} File path or null
   */
  getMemoryPath(memory) {
    try {
      let storageDir = this.storagePath;
      if (this.config.isolation?.project) {
        storageDir = path.join(storageDir, 'projects', memory.project_id);
      }
      if (this.config.isolation?.agent) {
        storageDir = path.join(storageDir, 'agents', memory.agent_role);
      }
      
      return path.join(storageDir, `${memory.id}.${this.format}`);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update existing memory with new content
   * @param {string} memoryId - Memory ID to update
   * @param {string} content - New content
   * @param {Object} options - Update options
   * @returns {Object} Updated memory object
   */
  async updateMemory(memoryId, content, options = {}) {
    try {
      // Retrieve existing memory
      const existingMemory = await this.retrieveMemory(memoryId, options);
      if (!existingMemory) {
        throw new Error(`Memory with ID ${memoryId} not found`);
      }
      
      // Update memory content and metadata
      existingMemory.content = content;
      existingMemory.last_updated = new Date().toISOString();
      
      // Update optional fields if provided
      if (options.confidence !== undefined) {
        existingMemory.confidence = options.confidence;
      }
      if (options.tags) {
        existingMemory.tags = options.tags;
      }
      if (options.related_memories) {
        existingMemory.related_memories = options.related_memories;
      }
      
      // Update the memory file
      const memoryPath = this.getMemoryPath(existingMemory);
      if (memoryPath) {
        await fs.writeJson(memoryPath, existingMemory, { spaces: 2 });
        return existingMemory;
      } else {
        throw new Error(`Unable to determine memory path for ID ${memoryId}`);
      }
    } catch (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }
  }

  /**
   * Delete memory by ID
   * @param {string} memoryId - Memory ID to delete
   * @param {Object} options - Delete options
   * @returns {boolean} True if deletion was successful
   */
  async deleteMemory(memoryId, options = {}) {
    try {
      // First retrieve the memory to get its path
      const memory = await this.retrieveMemory(memoryId, options);
      if (!memory) {
        return false; // Memory not found
      }
      
      // Get the file path
      const memoryPath = this.getMemoryPath(memory);
      if (!memoryPath) {
        throw new Error(`Unable to determine memory path for ID ${memoryId}`);
      }
      
      // Delete the file
      if (await fs.pathExists(memoryPath)) {
        await fs.remove(memoryPath);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  /**
   * Clean up old memories based on retention policies
   * @param {Object} options - Cleanup options
   * @returns {Object} Cleanup result
   */
  async cleanupMemories(options = {}) {
    try {
      const retentionDays = options.retention_days || this.config.retention?.days || 30;
      const maxEntries = options.max_entries || this.config.retention?.maxEntries || 1000;
      
      // Get all memories
      const allMemories = await this.searchMemory('', { limit: 10000 });
      
      // Sort memories by timestamp (oldest first)
      allMemories.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));
      
      let deletedCount = 0;
      let reason = '';
      
      // First check if we need to delete based on max entries
      if (allMemories.length > maxEntries) {
        const excessCount = allMemories.length - maxEntries;
        // Delete the oldest memories
        for (let i = 0; i < excessCount; i++) {
          await this.deleteMemory(allMemories[i].id);
          deletedCount++;
        }
        reason = `Exceeded max entries limit (${maxEntries})`;
      } 
      // Otherwise check based on age
      else {
        for (const memory of allMemories) {
          const memoryDate = new Date(memory.timestamp);
          if (memoryDate < cutoffDate) {
            await this.deleteMemory(memory.id);
            deletedCount++;
          }
        }
        reason = `Older than retention period (${retentionDays} days)`;
      }
      
      return {
        deleted: deletedCount,
        total: allMemories.length,
        reason: reason,
        message: `Cleaned up ${deletedCount} out of ${allMemories.length} memories`
      };
    } catch (error) {
      throw new Error(`Failed to cleanup memories: ${error.message}`);
    }
  }
}

module.exports = EnhancedMemorySystem;