/**
 * @license
 * Copyright 2025 QwenLM
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { MessageType, type HistoryItem } from '../types.js';
import { MemoriExtension } from '@qwen-code/qwen-code-core';

export const useAutoSaveConversation = (
  history: HistoryItem[],
  enabled: boolean
) => {
  const memoriExtensionRef = useRef<MemoriExtension | null>(null);
  const lastSavedIndexRef = useRef<number>(-1);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the memori extension with consistent workspace path
  useEffect(() => {
    if (enabled) {
      // Initialize with consistent workspace path to ensure same conversation ID across sessions
      memoriExtensionRef.current = new MemoriExtension('qwen-code', process.cwd());
    }
    
    // Cleanup function
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [enabled]);

  // Function to save pending conversation turns immediately
  const savePendingTurns = async () => {
    if (!enabled || !memoriExtensionRef.current) {
      return;
    }

    try {
      // Process any new history items that haven't been saved yet
      for (let i = lastSavedIndexRef.current + 1; i < history.length; i++) {
        const item = history[i];
        
        // Skip items that shouldn't be saved (like system messages)
        if (item.type !== MessageType.USER && item.type !== MessageType.GEMINI) {
          continue;
        }

        // If this is a user message, look for the next Gemini response
        if (item.type === MessageType.USER) {
          // Look ahead for the next Gemini response
          for (let j = i + 1; j < history.length; j++) {
            const nextItem = history[j];
            if (nextItem.type === MessageType.GEMINI && nextItem.text) {
              // Save this user-assistant pair as a conversation turn
              const success = await memoriExtensionRef.current!.storeConversationTurn(
                item.text || '',
                nextItem.text,
                memoriExtensionRef.current!.getConversationId(),
                memoriExtensionRef.current!.getSessionId()
              );
              
              if (!success) {
                console.error('Failed to save conversation turn');
              }
              
              break; // Only save with the first Gemini response found
            } else if (nextItem.type === MessageType.USER) {
              // If we encounter another user message, stop looking for a response to the current one
              break;
            }
          }
        }
        // Note: For Gemini responses without a preceding user input, we don't save them
        // This shouldn't typically happen in a normal conversation flow
      }
      
      // Update the last saved index to the current length
      lastSavedIndexRef.current = history.length - 1;
    } catch (error) {
      console.error('Error in savePendingTurns:', error);
    }
  };

  // Auto-save new conversation turns periodically
  useEffect(() => {
    if (!enabled || !memoriExtensionRef.current) {
      return;
    }

    // Clear any existing timer to prevent multiple timers
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Save changes with a debounce to avoid too frequent saves
    saveTimerRef.current = setTimeout(() => {
      savePendingTurns().catch(error => {
        console.error('Error auto-saving conversation:', error);
      });
    }, 1000); // Wait 1 second after history changes to batch saves

    // Cleanup function
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [history, enabled]);

  // Ensure any pending conversations are saved when the component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save immediately when the process is about to exit
      if (enabled && memoriExtensionRef.current) {
        // Clear the debounce timer to prevent it from running after we save
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
        savePendingTurns().catch(error => {
          console.error('Error saving pending conversations on process exit:', error);
        });
      }
    };

    // Listen for process exit events to ensure data is saved
    process.on('beforeExit', handleBeforeUnload);
    process.on('SIGINT', handleBeforeUnload);
    process.on('SIGTERM', handleBeforeUnload);
    process.on('SIGHUP', handleBeforeUnload);

    return () => {
      // Remove event listeners when the component unmounts
      process.off('beforeExit', handleBeforeUnload);
      process.off('SIGINT', handleBeforeUnload);
      process.off('SIGTERM', handleBeforeUnload);
      process.off('SIGHUP', handleBeforeUnload);

      if (enabled && memoriExtensionRef.current && saveTimerRef.current) {
        // Clear the debounce timer and save immediately to ensure no data is lost on unmount
        clearTimeout(saveTimerRef.current);
        savePendingTurns().catch(error => {
          console.error('Error saving pending conversations on unmount:', error);
        });
      }
    };
  }, [enabled]);
};
