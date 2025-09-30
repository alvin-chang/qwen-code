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
    
    // Initialize memori tool manager only if no MCP servers are configured
    // This prevents duplicate tool registration when MCP servers provide the same tools
    const hasMcpServers = Object.keys(mcpServers).length > 0;
    
    if (!hasMcpServers) {
      // Initialize memori tool manager to provide file-based conversation tools
      // This ensures conversation memory works when no MCP servers are configured
      const directories = workspaceContext.getDirectories();
      const workspacePath = directories.length > 0 ? directories[0] : process.cwd();
      this.memoriToolManager = new MemoriToolManager(toolRegistry, 'qwen-code', workspacePath);
    } else {
      console.debug('Skipping local memori tool manager initialization - MCP servers are configured');
      this.memoriToolManager = null;
    }
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
    
    // Register memori tools only if they haven't been registered by an MCP server
    // This prevents duplicate tool registration which can cause hanging at startup
    if (this.memoriToolManager) {
      // Check if conversation tools have already been registered (e.g. by an MCP server)
      // We check this AFTER MCP discovery to see if MCP servers provided these tools
      const storeTurnToolExists = this.toolRegistry.getTool('store_conversation_turn');
      const searchHistoryToolExists = this.toolRegistry.getTool('search_conversation_history');
      
      if (storeTurnToolExists || searchHistoryToolExists) {
        console.debug('Conversation tools already registered by MCP server, skipping local registration');
      } else {
        console.debug('Registering local memori tools since no MCP server was detected for conversation memory');
        this.memoriToolManager.registerTools();
      }
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
