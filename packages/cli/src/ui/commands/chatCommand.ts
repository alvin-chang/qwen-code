/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fsPromises from 'node:fs/promises';
import React from 'react';
import { Text } from 'ink';
import { Colors } from '../colors.js';
import type {
  CommandContext,
  SlashCommand,
  MessageActionReturn,
  SlashCommandActionReturn,
} from './types.js';
import { CommandKind } from './types.js';
import { decodeTagName } from '@qwen-code/qwen-code-core';
import path from 'node:path';
import type { HistoryItemWithoutId } from '../types.js';
import { MessageType } from '../types.js';

interface ChatDetail {
  name: string;
  mtime: Date;
}

const getSavedChatTags = async (
  context: CommandContext,
  mtSortDesc: boolean,
): Promise<ChatDetail[]> => {
  const cfg = context.services.config;
  const geminiDir = cfg?.storage?.getProjectTempDir();
  if (!geminiDir) {
    return [];
  }
  try {
    const file_head = 'checkpoint-';
    const file_tail = '.json';
    const files = await fsPromises.readdir(geminiDir);
    const chatDetails: Array<{ name: string; mtime: Date }> = [];

    for (const file of files) {
      if (file.startsWith(file_head) && file.endsWith(file_tail)) {
        const filePath = path.join(geminiDir, file);
        const stats = await fsPromises.stat(filePath);
        const tagName = file.slice(file_head.length, -file_tail.length);
        chatDetails.push({
          name: decodeTagName(tagName),
          mtime: stats.mtime,
        });
      }
    }

    chatDetails.sort((a, b) =>
      mtSortDesc
        ? b.mtime.getTime() - a.mtime.getTime()
        : a.mtime.getTime() - b.mtime.getTime(),
    );

    return chatDetails;
  } catch (_err) {
    return [];
  }
};

const listCommand: SlashCommand = {
  name: 'list',
  description: 'List saved conversation checkpoints',
  kind: CommandKind.BUILT_IN,
  action: async (context): Promise<MessageActionReturn> => {
    const chatDetails = await getSavedChatTags(context, false);
    if (chatDetails.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: 'No saved conversation checkpoints found.',
      };
    }

    const maxNameLength = Math.max(
      ...chatDetails.map((chat) => chat.name.length),
    );

    let message = 'List of saved conversations:\n\n';
    for (const chat of chatDetails) {
      const paddedName = chat.name.padEnd(maxNameLength, ' ');
      const isoString = chat.mtime.toISOString();
      const match = isoString.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
      const formattedDate = match ? `${match[1]} ${match[2]}` : 'Invalid Date';
      message += `  - \u001b[36m${paddedName}\u001b[0m  \u001b[90m(saved on ${formattedDate})\u001b[0m\n`;
    }
    message += `\n\u001b[90mNote: Newest last, oldest first\u001b[0m`;
    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  },
};

const saveCommand: SlashCommand = {
  name: 'save',
  description:
    'Save the current conversation as a checkpoint. Usage: /chat save <tag>',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<SlashCommandActionReturn | void> => {
    const tag = args.trim();
    if (!tag) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing tag. Usage: /chat save <tag>',
      };
    }

    const { logger, config } = context.services;
    await logger.initialize();

    if (!context.overwriteConfirmed) {
      const exists = await logger.checkpointExists(tag);
      if (exists) {
        return {
          type: 'confirm_action',
          prompt: React.createElement(
            Text,
            null,
            'A checkpoint with the tag ',
            React.createElement(Text, { color: Colors.AccentPurple }, tag),
            ' already exists. Do you want to overwrite it?',
          ),
          originalInvocation: {
            raw: context.invocation?.raw || `/chat save ${tag}`,
          },
        };
      }
    }

    const chat = await config?.getGeminiClient()?.getChat();
    if (!chat) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'No chat client available to save conversation.',
      };
    }

    const history = chat.getHistory();
    if (history.length > 2) {
      await logger.saveCheckpoint(history, tag);
      return {
        type: 'message',
        messageType: 'info',
        content: `Conversation checkpoint saved with tag: ${decodeTagName(tag)}.`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'info',
        content: 'No conversation found to save.',
      };
    }
  },
};

const resumeCommand: SlashCommand = {
  name: 'resume',
  altNames: ['load'],
  description:
    'Resume a conversation from a checkpoint. Usage: /chat resume <tag>',
  kind: CommandKind.BUILT_IN,
  action: async (context, args) => {
    const tag = args.trim();
    if (!tag) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing tag. Usage: /chat resume <tag>',
      };
    }

    const { logger } = context.services;
    await logger.initialize();
    const conversation = await logger.loadCheckpoint(tag);

    if (conversation.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: `No saved checkpoint found with tag: ${decodeTagName(tag)}.`,
      };
    }

    const rolemap: { [key: string]: MessageType } = {
      user: MessageType.USER,
      model: MessageType.GEMINI,
    };

    const uiHistory: HistoryItemWithoutId[] = [];
    let hasSystemPrompt = false;
    let i = 0;

    for (const item of conversation) {
      i += 1;
      const text =
        item.parts
          ?.filter((m) => !!m.text)
          .map((m) => m.text)
          .join('') || '';
      if (!text) {
        continue;
      }
      if (i === 1 && text.match(/context for our chat/)) {
        hasSystemPrompt = true;
      }
      if (i > 2 || !hasSystemPrompt) {
        uiHistory.push({
          type: (item.role && rolemap[item.role]) || MessageType.GEMINI,
          text,
        } as HistoryItemWithoutId);
      }
    }
    return {
      type: 'load_history',
      history: uiHistory,
      clientHistory: conversation,
    };
  },
  completion: async (context, partialArg) => {
    const chatDetails = await getSavedChatTags(context, true);
    return chatDetails
      .map((chat) => chat.name)
      .filter((name) => name.startsWith(partialArg));
  },
};

const deleteCommand: SlashCommand = {
  name: 'delete',
  description: 'Delete a conversation checkpoint. Usage: /chat delete <tag>',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const tag = args.trim();
    if (!tag) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing tag. Usage: /chat delete <tag>',
      };
    }

    const { logger } = context.services;
    await logger.initialize();
    const deleted = await logger.deleteCheckpoint(tag);

    if (deleted) {
      return {
        type: 'message',
        messageType: 'info',
        content: `Conversation checkpoint '${decodeTagName(tag)}' has been deleted.`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: `Error: No checkpoint found with tag '${decodeTagName(tag)}'.`,
      };
    }
  },
  completion: async (context, partialArg) => {
    const chatDetails = await getSavedChatTags(context, true);
    return chatDetails
      .map((chat) => chat.name)
      .filter((name) => name.startsWith(partialArg));
  },
};

const clearCommand: SlashCommand = {
  name: 'clear',
  description: 'Clear the last X conversation turns. Usage: /chat clear <number> or /chat clear all',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const arg = args.trim();
    if (!arg) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Missing argument. Usage: /chat clear <number> or /chat clear all',
      };
    }

    const { config } = context.services;
    if (!config) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Configuration not available.',
      };
    }
    
    const geminiClient = config.getGeminiClient();
    
    if (!geminiClient) {
      return {
        type: 'message',
        messageType: 'error',
        content: 'No chat client available to clear conversation history.',
      };
    }

    let history = geminiClient.getHistory();
    
    if (arg.toLowerCase() === 'all') {
      // Keep the first 2 messages (environment context and model acknowledgment) and clear the rest
      if (history.length > 2) {
        const envContext = history.slice(0, 2);
        geminiClient.setHistory(envContext);
        return {
          type: 'message',
          messageType: 'info',
          content: `Cleared ${history.length - 2} conversation turns. Kept environment context.`,
        };
      } else {
        return {
          type: 'message',
          messageType: 'info',
          content: 'No conversation turns to clear.',
        };
      }
    } else {
      const numTurns = parseInt(arg, 10);
      if (isNaN(numTurns) || numTurns <= 0) {
        return {
          type: 'message',
          messageType: 'error',
          content: 'Invalid number. Usage: /chat clear <number> or /chat clear all',
        };
      }

      if (numTurns >= history.length) {
        // If trying to clear more than available, clear all but keep environment context
        if (history.length > 2) {
          const envContext = history.slice(0, 2);
          geminiClient.setHistory(envContext);
          return {
            type: 'message',
            messageType: 'info',
            content: `Cleared ${history.length - 2} conversation turns (all available). Kept environment context.`,
          };
        } else {
          return {
            type: 'message',
            messageType: 'info',
            content: 'No conversation turns to clear.',
          };
        }
      }

      // Remove the last numTurns from the history
      const newHistory = history.slice(0, -numTurns);
      geminiClient.setHistory(newHistory);
      
      return {
        type: 'message',
        messageType: 'info',
        content: `Cleared the last ${numTurns} conversation turns.`,
      };
    }
  },
};

export const chatCommand: SlashCommand = {
  name: 'chat',
  description: 'Manage conversation history.',
  kind: CommandKind.BUILT_IN,
  subCommands: [listCommand, saveCommand, resumeCommand, deleteCommand, clearCommand],
};
