/**
 * @license
 * Copyright 2025 QwenLM
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ToolRegistry } from '../../tools/tool-registry.js';
import { MemoriExtension } from './index.js';
import { ConversationMemoryTool, SearchConversationTool } from './tools.js';

/**
 * Manages the initialization and registration of memori extension tools
 */
export class MemoriToolManager {
  private memoriExtension: MemoriExtension;
  private toolRegistry: ToolRegistry;

  constructor(toolRegistry: ToolRegistry, projectId: string = 'qwen-code', workspacePath: string = process.cwd()) {
    this.toolRegistry = toolRegistry;
    // Create MemoriExtension with the same project ID and workspace path to ensure
    // it uses the same conversation context as the main client
    this.memoriExtension = new MemoriExtension(projectId, workspacePath);
  }

  /**
   * No initialization needed as the memori extension now uses local storage
   */

  /**
   * Register the memori tools with the tool registry
   */
  registerTools(): void {
    // Register the conversation memory tool
    const conversationMemoryTool = new ConversationMemoryTool(this.memoriExtension);
    this.toolRegistry.registerTool(conversationMemoryTool);
    
    // Register the search conversation tool
    const searchConversationTool = new SearchConversationTool(this.memoriExtension);
    this.toolRegistry.registerTool(searchConversationTool);
  }

  /**
   * Get the memori extension instance
   * @returns The memori extension instance
   */
  getMemoriExtension(): MemoriExtension {
    return this.memoriExtension;
  }
}