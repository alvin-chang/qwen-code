/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MCPServerConfig } from '../config/config.js';
import { ToolRegistry } from './tool-registry.js';
import type { PromptRegistry } from '../prompts/prompt-registry.js';
import {
  McpClient,
  MCPDiscoveryState,
  populateMcpServerCommand,
} from './mcp-client.js';
import { getErrorMessage } from '../utils/errors.js';
import type { WorkspaceContext } from '../utils/workspaceContext.js';
import { MemoriToolManager } from '../extensions/memori/memori-tool-manager.js';

/**
 * Manages the lifecycle of multiple MCP clients, including local child processes.
 * This class is responsible for starting, stopping, and discovering tools from
 * a collection of MCP servers defined in the configuration.
 */
export class McpClientManager {
  private clients: Map<string, McpClient> = new Map();
  private readonly mcpServers: Record<string, MCPServerConfig>;
  private readonly mcpServerCommand: string | undefined;
  private readonly toolRegistry: ToolRegistry;
  private readonly promptRegistry: PromptRegistry;
  private readonly debugMode: boolean;
  private readonly workspaceContext: WorkspaceContext;
  private memoriToolManager: MemoriToolManager | null = null;
  private discoveryState: MCPDiscoveryState = MCPDiscoveryState.NOT_STARTED;

  constructor(
    mcpServers: Record<string, MCPServerConfig>,
    mcpServerCommand: string | undefined,
    toolRegistry: ToolRegistry,
    promptRegistry: PromptRegistry,
    debugMode: boolean,
    workspaceContext: WorkspaceContext,
  ) {
    this.mcpServers = mcpServers;
    this.mcpServerCommand = mcpServerCommand;
    this.toolRegistry = toolRegistry;
    this.promptRegistry = promptRegistry;
    this.debugMode = debugMode;
    this.workspaceContext = workspaceContext;
    
    // Initialize memori tool manager only if no MCP servers provide conversation tools
    // This prevents duplicate tool registration which can cause hanging at startup
    const hasServerWithConversationTools = this.hasMcpServerWithConversationTools(mcpServers);
    
    if (!hasServerWithConversationTools) {
      // Initialize memori tool manager to provide file-based conversation tools
      // This ensures conversation memory works even without MCP servers
      const directories = workspaceContext.getDirectories();
      const workspacePath = directories.length > 0 ? directories[0] : process.cwd();
      this.memoriToolManager = new MemoriToolManager(toolRegistry, 'qwen-code', workspacePath);
    } else {
      console.debug('Skipping local memori tool manager initialization - MCP server with conversation tools detected');
      this.memoriToolManager = null;
    }
  }
  
  /**
   * Checks if any of the configured MCP servers provide conversation memory tools
   * to prevent duplicate registration that can cause hanging at startup
   */
  private hasMcpServerWithConversationTools(mcpServers: Record<string, MCPServerConfig>): boolean {
    const serverNames = Object.keys(mcpServers);
    
    // Check for servers with names that suggest they provide conversation tools
    for (const serverName of serverNames) {
      const lowerName = serverName.toLowerCase();
      if (lowerName.includes('memori') || 
          lowerName.includes('conversation') || 
          lowerName.includes('memory') ||
          lowerName.includes('chat') ||
          lowerName.includes('history')) {
        return true;
      }
    }
    
    // Additionally, check if any server has configuration that includes conversation tools
    for (const [name, config] of Object.entries(mcpServers)) {
      if (config.includeTools) {
        const lowerIncludeTools = config.includeTools.map(t => t.toLowerCase());
        if (lowerIncludeTools.some(tool => 
          tool.includes('conversation') || 
          tool.includes('memory') || 
          tool.includes('history') ||
          tool === 'store_conversation_turn' ||
          tool === 'search_conversation_history'
        )) {
          console.debug(`MCP server '${name}' configured with conversation tools, skipping local tools`);
          return true;
        }
      }
      
      if (config.excludeTools) {
        // If conversation tools are explicitly excluded, the server might not provide them
        // But generally we don't want to rely on this as the primary check
        const lowerExcludeTools = config.excludeTools.map(t => t.toLowerCase());
        if (lowerExcludeTools.some(tool => 
          tool.includes('conversation') || 
          tool.includes('memory') || 
          tool.includes('history') ||
          tool === 'store_conversation_turn' ||
          tool === 'search_conversation_history'
        )) {
          continue; // This server explicitly excludes conversation tools
        }
      }
    }
    
    return false;
  }

  /**
   * Initiates the tool discovery process for all configured MCP servers.
   * It connects to each server, discovers its available tools, and registers
   * them with the `ToolRegistry`.
   */
  async discoverAllMcpTools(): Promise<void> {
    await this.stop();
    this.discoveryState = MCPDiscoveryState.IN_PROGRESS;
    const servers = populateMcpServerCommand(
      this.mcpServers,
      this.mcpServerCommand,
    );

    const discoveryPromises = Object.entries(servers).map(
      async ([name, config]) => {
        const client = new McpClient(
          name,
          config,
          this.toolRegistry,
          this.promptRegistry,
          this.workspaceContext,
          this.debugMode,
        );
        this.clients.set(name, client);
        try {
          await client.connect();
          await client.discover();
        } catch (error) {
          // Log the error but don't let a single failed server stop the others
          console.error(
            `Error during discovery for server '${name}': ${getErrorMessage(
              error,
            )}`,
          );
        }
      },
    );

    await Promise.all(discoveryPromises);
    
    // Register memori tools only if no MCP server is providing them
    // This prevents duplicate tool registration which can cause hanging at startup
    if (this.memoriToolManager) {
      console.debug('Registering local memori tools since no MCP server was detected for conversation memory');
      this.memoriToolManager.registerTools();
    } else {
      console.debug('Skipping local memori tool registration - MCP server detected');
    }
    
    this.discoveryState = MCPDiscoveryState.COMPLETED;
  }

  /**
   * Stops all running local MCP servers and closes all client connections.
   * This is the cleanup method to be called on application exit.
   */
  async stop(): Promise<void> {
    const disconnectionPromises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
          await client.disconnect();
        } catch (error) {
          console.error(
            `Error stopping client '${name}': ${getErrorMessage(error)}`,
          );
        }
      },
    );

    await Promise.all(disconnectionPromises);
    this.clients.clear();
  }

  getDiscoveryState(): MCPDiscoveryState {
    return this.discoveryState;
  }
}
