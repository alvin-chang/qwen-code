#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Script to fix duplicate MCP server configurations that can cause 
 * hanging at startup due to multiple browser automation servers.
 */

import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

async function fixDuplicateMcpServers() {
  console.log('🔍 Checking for duplicate MCP server configurations...');
  
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
    console.log('ℹ️  No MCP server configurations found. Nothing to fix.');
    return;
  }
  
  console.log('📊 Current MCP server configuration:');
  console.log(JSON.stringify(settings.mcpServers, null, 2));
  
  // Check for duplicate server configurations
  const serverNames = Object.keys(settings.mcpServers);
  const processedServers = {};
  let hasDuplicates = false;
  
  for (const serverName of serverNames) {
    const serverConfig = settings.mcpServers[serverName];
    
    // Create a unique key based on the configuration (excluding names)
    const configKey = JSON.stringify({
      command: serverConfig.command,
      args: serverConfig.args,
      url: serverConfig.url,
      httpUrl: serverConfig.httpUrl,
      cwd: serverConfig.cwd
    });
    
    if (processedServers[configKey]) {
      console.log(`⚠️  Duplicate server configuration found for: ${serverName}`);
      console.log(`   Same configuration as: ${processedServers[configKey]}`);
      hasDuplicates = true;
    } else {
      processedServers[configKey] = serverName;
    }
  }
  
  // Specifically check for multiple Playwright/Chrome browser automation servers
  const browserAutomationServers = serverNames.filter(name => {
    const config = settings.mcpServers[name];
    return name.toLowerCase().includes('playwright') || 
           name.toLowerCase().includes('chrome') || 
           name.toLowerCase().includes('browser') ||
           (config.command && config.command.toLowerCase().includes('playwright')) ||
           (config.args && config.args.some(arg => arg.toLowerCase().includes('browser')));
  });
  
  if (browserAutomationServers.length > 1) {
    console.log(`⚠️  Multiple browser automation servers found:`, browserAutomationServers);
    console.log(`   This can cause hanging due to competing browser instances.`);
    hasDuplicates = true;
  }
  
  if (!hasDuplicates) {
    console.log('✅ No duplicate configurations found. Current configuration looks good!');
    return;
  }
  
  // Suggest a fix by keeping only one of each similar server
  const uniqueServers = {};
  const serverGroups = {};
  
  // Group servers by functionality
  for (const [name, config] of Object.entries(settings.mcpServers)) {
    let groupKey = 'other';
    
    if (name.toLowerCase().includes('playwright') || 
        (config.command && config.command.toLowerCase().includes('playwright'))) {
      groupKey = 'playwright';
    } else if (name.toLowerCase().includes('memori') ||
               (config.httpUrl && config.httpUrl.includes('memori'))) {
      groupKey = 'memori';
    } else if (name.toLowerCase().includes('browser')) {
      groupKey = 'browser';
    }
    
    if (!serverGroups[groupKey]) {
      serverGroups[groupKey] = [];
    }
    serverGroups[groupKey].push({ name, config });
  }
  
  // Keep only the first server in each group
  for (const [groupKey, servers] of Object.entries(serverGroups)) {
    if (servers.length > 1) {
      console.log(`\n📋 Found ${servers.length} servers in "${groupKey}" group:`);
      for (let i = 0; i < servers.length; i++) {
        console.log(`   ${i === 0 ? '✅ Keeping:' : '❌ Removing:'} ${servers[i].name}`);
        if (i === 0) {
          uniqueServers[servers[i].name] = servers[i].config;
        }
      }
    } else {
      // Only one server in this group, keep it
      uniqueServers[servers[0].name] = servers[0].config;
    }
  }
  
  // Ask for user confirmation before making changes
  console.log('\n🤔 Do you want to fix duplicate server configurations?');
  console.log(`   This will keep only one server per functionality group.`);
  console.log(`   Your original settings can be found at: ${settingsPath}.backup`);
  
  // Create a backup before making changes
  try {
    await writeFile(`${settingsPath}.backup`, JSON.stringify(settings, null, 2));
    console.log(`✅ Backup created at: ${settingsPath}.backup`);
  } catch (error) {
    console.error(`❌ Failed to create backup:`, error.message);
    return;
  }
  
  // Update the settings with unique servers
  settings.mcpServers = uniqueServers;
  
  try {
    await writeFile(settingsPath, JSON.stringify(settings, null, 2));
    console.log(`✅ Fixed MCP server configuration at: ${settingsPath}`);
    console.log('📊 New configuration:');
    console.log(JSON.stringify(settings.mcpServers, null, 2));
  } catch (error) {
    console.error(`❌ Failed to update settings:`, error.message);
    return;
  }
  
  console.log('\n🎉 MCP server duplicates have been fixed!');
  console.log('💡 Restart Qwen Code to apply the changes and prevent hanging.');
}

// Run the function
fixDuplicateMcpServers().catch(error => {
  console.error('❌ Error fixing duplicate MCP servers:', error);
  process.exit(1);
});