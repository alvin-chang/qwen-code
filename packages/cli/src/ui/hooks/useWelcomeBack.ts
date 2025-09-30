/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getProjectSummaryInfo,
  getRecentConversationHistory,
  hasConversationHistory,
  type ProjectSummaryInfo,
  type Config,
} from '@qwen-code/qwen-code-core';
import { type Settings } from '../../config/settingsSchema.js';
import type { HistoryItem } from '../types.js';

export interface WelcomeBackState {
  welcomeBackInfo: ProjectSummaryInfo | null;
  showWelcomeBackDialog: boolean;
  welcomeBackChoice: 'restart' | 'continue' | null;
  shouldFillInput: boolean;
  inputFillText: string | null;
}

export interface WelcomeBackActions {
  handleWelcomeBackSelection: (choice: 'restart' | 'continue') => Promise<void>;
  handleWelcomeBackClose: () => void;
  checkWelcomeBack: () => Promise<void>;
  clearInputFill: () => void;
}

export function useWelcomeBack(
  config: Config,
  submitQuery: (query: string) => void,
  buffer: { setText: (text: string) => void },
  settings: Settings,
  loadHistory?: (history: HistoryItem[]) => void, // Optional parameter for loading history with IDs
  geminiClient?: any // Optional parameter for Gemini client to add history
): WelcomeBackState & WelcomeBackActions {
  const [welcomeBackInfo, setWelcomeBackInfo] =
    useState<ProjectSummaryInfo | null>(null);
  const [showWelcomeBackDialog, setShowWelcomeBackDialog] = useState(false);
  const [welcomeBackChoice, setWelcomeBackChoice] = useState<
    'restart' | 'continue' | null
  >(null);
  const [shouldFillInput, setShouldFillInput] = useState(false);
  const [inputFillText, setInputFillText] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  // Check for conversation history on startup
  const checkWelcomeBack = useCallback(async () => {
    // Check if welcome back is enabled in settings
    if (settings.enableWelcomeBack === false) {
      return;
    }

    // Don't load again if we've already loaded history in this session
    if (hasLoadedHistory) return;

    try {
      const info = await getProjectSummaryInfo();
      const hasConvHistory = await hasConversationHistory();
      
      // Update the info to include conversation history status
      const updatedInfo: ProjectSummaryInfo = {
        ...info,
        hasConversationHistory: hasConvHistory
      };

      // Check if automatic session continuity is enabled
      if (settings.enableAutoSessionContinuity && hasConvHistory && loadHistory) {
        // Automatically load the most recent conversation history without showing dialog
        const conversationHistory = await getRecentConversationHistory();
        
        if (conversationHistory.length > 0) {
          // Convert conversation turns to UI history format with IDs
          let nextId = Date.now(); // Use timestamp as starting point for IDs
          const uiHistory: HistoryItem[] = [];
          for (const turn of conversationHistory) {
            // Add user message with ID
            uiHistory.push({
              type: 'user',
              text: turn.userInput,
              id: nextId++,
            });
            // Add assistant response with ID  
            uiHistory.push({
              type: 'gemini',
              text: turn.assistantResponse,
              id: nextId++,
            });
          }
          
          if (uiHistory.length > 0) {
            loadHistory(uiHistory);
            
            // Also add the history to the Gemini client so it has context for the conversation
            if (geminiClient && typeof geminiClient.addHistory === 'function') {
              for (const item of uiHistory) {
                if (item.type === 'user') {
                  geminiClient.addHistory({
                    role: 'user',
                    parts: [{ text: item.text }]
                  });
                } else if (item.type === 'gemini') {
                  geminiClient.addHistory({
                    role: 'model', 
                    parts: [{ text: item.text }]
                  });
                }
              }
            }
            
            // Mark that we've loaded history to prevent re-loading
            setHasLoadedHistory(true);
            return; // Exit early after loading history automatically
          }
        }
      }
      
      // Show welcome back dialog if there's either project summary or conversation history
      // (and automatic continuity is not enabled or failed to load)
      if (updatedInfo.hasHistory || updatedInfo.hasConversationHistory) {
        setWelcomeBackInfo(updatedInfo);
        setShowWelcomeBackDialog(true);
      }
    } catch (error) {
      // Silently ignore errors - welcome back is not critical
      console.debug('Welcome back check failed:', error);
    }
  }, [settings.enableWelcomeBack, settings.enableAutoSessionContinuity, loadHistory, hasLoadedHistory, geminiClient]);

  // Handle welcome back dialog selection
  const handleWelcomeBackSelection = useCallback(
    async (choice: 'restart' | 'continue') => {
      setWelcomeBackChoice(choice);
      setShowWelcomeBackDialog(false);

      if (choice === 'continue') {
        // Load the most recent conversation history
        const conversationHistory = await getRecentConversationHistory();
        
        if (conversationHistory.length > 0) {
          // Convert conversation turns to UI history format with IDs
          let nextId = Date.now(); // Use timestamp as starting point for IDs
          const uiHistory: HistoryItem[] = [];
          for (const turn of conversationHistory) {
            // Add user message with ID
            uiHistory.push({
              type: 'user',
              text: turn.userInput,
              id: nextId++,
            });
            // Add assistant response with ID
            uiHistory.push({
              type: 'gemini',
              text: turn.assistantResponse,
              id: nextId++,
            });
          }
          
          // Directly load the conversation history if the function is provided
          if (loadHistory && uiHistory.length > 0) {
            loadHistory(uiHistory);
            
            // Also add the history to the Gemini client so it has context for the conversation
            if (geminiClient && typeof geminiClient.addHistory === 'function') {
              for (const item of uiHistory) {
                if (item.type === 'user') {
                  geminiClient.addHistory({
                    role: 'user',
                    parts: [{ text: item.text }]
                  });
                } else if (item.type === 'gemini') {
                  geminiClient.addHistory({
                    role: 'model', 
                    parts: [{ text: item.text }]
                  });
                }
              }
            }
            
            // Mark that we've loaded history to prevent re-loading during auto-load
            setHasLoadedHistory(true);
            return; // Exit early after loading history
          }
        }
        
        // If there's project summary content but no conversation history, 
        // fallback to the original behavior of filling the input
        if (welcomeBackInfo?.content) {
          // Create the context message to fill in the input box
          const contextMessage = `@.qwen/PROJECT_SUMMARY.md, Based on our previous conversation, let's continue?`;

          // Set the input fill state instead of directly submitting
          setInputFillText(contextMessage);
          setShouldFillInput(true);
        }
      }
      // If choice is 'restart', just close the dialog and continue normally
    },
    [welcomeBackInfo, loadHistory, geminiClient],
  );

  const handleWelcomeBackClose = useCallback(() => {
    setWelcomeBackChoice('restart'); // Default to restart when closed
    setShowWelcomeBackDialog(false);
  }, []);

  const clearInputFill = useCallback(() => {
    setShouldFillInput(false);
    setInputFillText(null);
  }, []);

  // Handle input filling from welcome back
  useEffect(() => {
    if (shouldFillInput && inputFillText) {
      buffer.setText(inputFillText);
      clearInputFill();
    }
  }, [shouldFillInput, inputFillText, buffer, clearInputFill]);

  // Check for welcome back on mount
  useEffect(() => {
    checkWelcomeBack();
  }, [checkWelcomeBack]);

  return {
    // State
    welcomeBackInfo,
    showWelcomeBackDialog,
    welcomeBackChoice,
    shouldFillInput,
    inputFillText,
    // Actions
    handleWelcomeBackSelection,
    handleWelcomeBackClose,
    checkWelcomeBack,
    clearInputFill,
  };
}
