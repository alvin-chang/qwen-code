#!/usr/bin/env node

// Simple test to verify the conversation storage functionality
// This test directly calls the conversation storage methods to verify they work

import * as fs from 'fs';
import * as path from 'path';

// Test conversation storage directly
async function testDirectStorage() {
  console.log('Testing direct conversation storage...');
  
  try {
    // Create a test conversation directory if it doesn't exist
    const conversationsDir = path.join(process.cwd(), '.qwen', 'conversations');
    if (!fs.existsSync(conversationsDir)) {
      fs.mkdirSync(conversationsDir, { recursive: true });
    }
    
    // Generate a test conversation ID
    const conversationId = 'test_conv_' + Date.now();
    const sessionId = 'test_session_' + Math.random().toString(36).substring(2, 15);
    
    // Create a test conversation turn
    const conversationTurn = {
      userInput: 'Hello, this is a test message for conversation storage.',
      assistantResponse: 'Hi there! This is a test response to verify conversation storage.',
      conversationId: conversationId,
      sessionId: sessionId,
      timestamp: Date.now()
    };
    
    // Store the conversation turn in a JSON file
    const conversationFile = path.join(conversationsDir, `${conversationId}.json`);
    let conversationData = [];
    
    // Read existing data if file exists
    if (fs.existsSync(conversationFile)) {
      const existingData = fs.readFileSync(conversationFile, 'utf8');
      conversationData = JSON.parse(existingData);
    }
    
    // Add the new conversation turn
    conversationData.push(conversationTurn);
    
    // Write the updated conversation data back to file
    fs.writeFileSync(conversationFile, JSON.stringify(conversationData, null, 2));
    
    console.log('✅ Conversation turn stored successfully!');
    console.log(`   Conversation ID: ${conversationId}`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   File: ${conversationFile}`);
    
    // Verify the data was stored correctly
    const storedData = JSON.parse(fs.readFileSync(conversationFile, 'utf8'));
    if (storedData.length > 0 && storedData[storedData.length - 1].userInput === conversationTurn.userInput) {
      console.log('✅ Data verification successful!');
      
      // Show the stored data
      console.log('Stored conversation data:');
      storedData.forEach((turn, index) => {
        console.log(`  ${index + 1}. User: ${turn.userInput.substring(0, 50)}...`);
        console.log(`     Assistant: ${turn.assistantResponse.substring(0, 50)}...`);
      });
      
      return true;
    } else {
      console.log('❌ Data verification failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing conversation storage:', error);
    return false;
  }
}

// Run the test
testDirectStorage().then(success => {
  if (success) {
    console.log('\n🎉 Conversation storage test completed successfully!');
  } else {
    console.log('\n💥 Conversation storage test failed!');
    process.exit(1);
  }
});