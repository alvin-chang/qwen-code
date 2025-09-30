#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Script to check and fix browser automation server configurations
 * that can cause hanging at startup due to multiple browser instances.
 */

import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

async function checkAndFixBrowserServerConfig() {
  console.log('🔍 Checking browser automation server configurations...');
  
  const userSettingsPath = join(homedir(), '.qwen', 'settings.json');
  const projectSettingsPath = './.qwen/settings.json';
  
  let settingsPath = null;
  let settings = null;
  
  // Try user settings first, then project settings
  try {
    const userSettings = JSON.parse(await readFile(userSettingsPath, 'utf8'));
    if (userSettings.mcpServers) {
      settingsPath = userSettingsPath;
      settings = userSettings;
      console.log(`📋 Found user settings at: ${userSettingsPath}`);
    }
  } catch (error) {
    console.log(`⚠️  User settings not found at ${userSettingsPath}`);
    
    try {
      const projectSettings = JSON.parse(await readFile(projectSettingsPath, 'utf8'));
      if (projectSettings.mcpServers) {
        settingsPath = projectSettingsPath;
        settings = projectSettings;
        console.log(`📋 Found project settings at: ${projectSettingsPath}`);
      }
    } catch (error) {
      console.log(`⚠️  Project settings not found at ${projectSettingsPath}`);
    }
  }
  
  if (!settings || !settings.mcpServers) {
    console.log('ℹ️  No MCP server configurations found. Nothing to check.');
    return;
  }
  
  console.log('📊 Current MCP server configuration:');
  console.log(JSON.stringify(settings.mcpServers, null, 2));
  
  // Find browser-related server configurations
  const browserServers = [];
  for (const [name, config] of Object.entries(settings.mcpServers)) {
    // Check if this server is related to browser automation
    if (name.toLowerCase().includes('playwright') || 
        name.toLowerCase().includes('chrome') || 
        name.toLowerCase().includes('browser') ||
        name.toLowerCase().includes('puppeteer') ||
        (config.command && (
          config.command.toLowerCase().includes('playwright') ||
          config.command.toLowerCase().includes('chrome') ||
          config.command.toLowerCase().includes('browser') ||
          config.command.toLowerCase().includes('puppeteer')
        )) ||
        (config.args && config.args.some(arg => 
          arg.toLowerCase().includes('playwright') ||
          arg.toLowerCase().includes('browser') ||
          arg.toLowerCase().includes('chrome') ||
          arg.toLowerCase().includes('puppeteer')
        ))) {
      browserServers.push({ name, config });
    }
  }
  
  if (browserServers.length === 0) {
    console.log('✅ No browser automation servers found. Configuration looks good!');
    return;
  }
  
  console.log(`\n🔍 Found ${browserServers.length} browser automation server(s):`);
  for (const server of browserServers) {
    console.log(`   - ${server.name}`);
    console.log(`     Command: ${server.config.command || 'N/A'}`);
    console.log(`     Args: ${server.config.args ? server.config.args.join(' ') : 'N/A'}`);
  }
  
  if (browserServers.length > 1) {
    console.log(`\n⚠️  Multiple browser automation servers detected!`);
    console.log(`   This can cause hanging during startup due to:`);
    console.log(`   - Multiple browser instances competing for resources`);
    console.log(`   - Race conditions during initialization`);
    console.log(`   - Port conflicts if servers use similar configurations`);
    
    // Check for potential conflicts in configurations
    let hasConflicts = false;
    for (let i = 0; i < browserServers.length; i++) {
      for (let j = i + 1; j < browserServers.length; j++) {
        const server1 = browserServers[i];
        const server2 = browserServers[j];
        
        // Check if they have similar configurations that could conflict
        if (server1.config.command === server2.config.command) {
          console.log(`   - Servers '${server1.name}' and '${server2.name}' use the same command`);
          hasConflicts = true;
        }
        
        if (server1.config.cwd === server2.config.cwd) {
          console.log(`   - Servers '${server1.name}' and '${server2.name}' use the same working directory`);
          hasConflicts = true;
        }
        
        // Check for similar args that could indicate duplicate functionality
        if (server1.config.args && server2.config.args) {
          const args1 = server1.config.args.join(' ');
          const args2 = server2.config.args.join(' ');
          
          if (args1 === args2) {
            console.log(`   - Servers '${server1.name}' and '${server2.name}' have identical arguments`);
            hasConflicts = true;
          }
        }
      }
    }
    
    if (hasConflicts) {
      console.log(`\n🤔 Would you like to fix the configuration?`);
      console.log(`   Recommended action: Keep only one browser automation server.`);
      console.log(`   Original settings will be backed up to: ${settingsPath}.backup`);
      
      // Create backup
      try {
        await writeFile(`${settingsPath}.backup`, JSON.stringify(settings, null, 2));
        console.log(`✅ Backup created at: ${settingsPath}.backup`);
        
        // Keep only the first browser server and remove duplicates
        const newMcpServers = { ...settings.mcpServers };
        
        // Remove all browser servers except the first one
        for (let i = 1; i < browserServers.length; i++) {
          const serverToRemove = browserServers[i].name;
          delete newMcpServers[serverToRemove];
          console.log(`❌ Removed duplicate browser server: ${serverToRemove}`);
        }
        
        // Update the settings
        settings.mcpServers = newMcpServers;
        
        // Write back the updated settings
        await writeFile(settingsPath, JSON.stringify(settings, null, 2));
        console.log(`✅ Fixed configuration. Now has only one browser automation server.`);
        console.log(`📊 New configuration:`);
        console.log(JSON.stringify(settings.mcpServers, null, 2));
        
        console.log('\n🎉 Browser server configuration fixed!');
        console.log('💡 Restart Qwen Code to apply the changes and prevent hanging.');
        
      } catch (error) {
        console.error(`❌ Failed to update settings:`, error.message);
      }
    } else {
      console.log(`\n✅ Different browser servers detected, likely serving different purposes.`);
      console.log(`   Configuration seems valid, but monitor for startup hanging.`);
    }
  } else {
    console.log(`\n✅ Single browser automation server detected. Configuration looks good!`);
  }
}

// Run the function
checkAndFixBrowserServerConfig().catch(error => {
  console.error('❌ Error checking browser server configuration:', error);
  process.exit(1);
});