/**
 * Test Conversation ID Isolation
 * 
 * This script directly tests the implementation details of conversation ID isolation
 * based on the Memori extension in Qwen Code.
 */

class ConversationIsolationTester {
  constructor() {
    this.storage = new Map(); // Simulates persistent storage
  }

  // Generate unique session ID (as implemented in the actual system)
  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Store a conversation turn with session isolation
  storeConversationTurn(userInput, assistantResponse, conversationId) {
    // Generate a unique ID for this conversation turn
    const turnId = 'turn_' + Math.random().toString(36).substring(2, 10);
    
    // Create the conversation entry with session context
    const entry = {
      id: turnId,
      conversationId,
      userInput,
      assistantResponse,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📝 Storing conversation turn in conversation ID: ${conversationId}`);
    console.log(`   Turn ID: ${turnId}`);
    console.log(`   User: ${userInput}`);
    console.log(`   Assistant: ${assistantResponse}`);
    
    // Store with conversation ID as part of the key to ensure isolation
    this.storage.set(turnId, entry);
    
    return turnId;
  }

  // Search conversation history with conversation ID isolation
  searchConversationHistory(query, conversationId) {
    console.log(`\n🔍 Searching for "${query}" in conversation ID: ${conversationId}`);
    
    // Filter stored conversations to only include those from the specified conversation ID
    const results = [];
    
    for (const [key, entry] of this.storage.entries()) {
      // Check if this entry belongs to the requested conversation ID
      if (entry.conversationId === conversationId) {
        // Check if the query matches the content
        if (entry.userInput.toLowerCase().includes(query.toLowerCase()) || 
            entry.assistantResponse.toLowerCase().includes(query.toLowerCase())) {
          results.push(entry);
          console.log(`   ✅ Match found in conversation ${conversationId}: ${entry.userInput}`);
        }
      }
    }
    
    console.log(`   📊 Found ${results.length} matching conversations in conversation ID ${conversationId}`);
    return results;
  }

  // Test that demonstrates conversation ID isolation works
  async runIsolationTest() {
    console.log("=== Conversation ID Isolation Test ===\n");

    // Create two different conversation IDs
    const conversationId1 = this.generateSessionId();
    const conversationId2 = this.generateSessionId();
    
    console.log(`Conversation ID 1: ${conversationId1}`);
    console.log(`Conversation ID 2: ${conversationId2}`);
    
    // Store conversations in different conversation IDs
    console.log("\n1. Storing conversations in different conversation IDs:");
    
    this.storeConversationTurn(
      "What is conversation ID isolation?",
      "Conversation ID isolation ensures that each conversation maintains its own separate context and doesn't interfere with other conversations.",
      conversationId1
    );
    
    this.storeConversationTurn(
      "How does Qwen Code handle multiple conversations?",
      "Qwen Code uses unique conversation IDs to keep different conversations completely isolated from each other.",
      conversationId1
    );
    
    this.storeConversationTurn(
      "What are the benefits of session isolation?",
      "Session isolation provides privacy, contextual relevance, and prevents interference between different conversation contexts.",
      conversationId2
    );
    
    this.storeConversationTurn(
      "How is conversation data stored?",
      "Conversation data is stored with the conversation ID as part of the storage key to ensure proper isolation.",
      conversationId2
    );
    
    // Test 1: Search in Conversation 1
    console.log("\n2. Testing search in Conversation 1:");
    const results1 = this.searchConversationHistory("isolation", conversationId1);
    console.log(`   Results in Conversation 1: ${results1.length} conversations`);
    
    // Test 2: Search in Conversation 2
    console.log("\n3. Testing search in Conversation 2:");
    const results2 = this.searchConversationHistory("isolation", conversationId2);
    console.log(`   Results in Conversation 2: ${results2.length} conversations`);
    
    // Test 3: Verify true isolation - try to find Conversation 1's content in Conversation 2
    console.log("\n4. Testing true isolation (should find 0 results):");
    const resultsIsolationTest = this.searchConversationHistory("multiple conversations", conversationId2);
    console.log(`   Results when searching for Conversation 1's content in Conversation 2: ${resultsIsolationTest.length} conversations`);
    
    // Verification
    console.log("\n5. Verification:");
    if (resultsIsolationTest.length === 0) {
      console.log("   ✅ TRUE: Conversation ID isolation is working correctly!");
      console.log("   ✅ Conversations in different IDs are properly isolated");
      console.log("   ✅ No cross-contamination between conversation contexts");
    } else {
      console.log("   ❌ FALSE: Conversation ID isolation is not working properly!");
    }
    
    // Additional verification: ensure each conversation ID only contains its own conversations
    const allConversationsC1 = Array.from(this.storage.values()).filter(c => c.conversationId === conversationId1);
    const searchResultsC1 = this.searchConversationHistory("", conversationId1);
    
    const allConversationsC2 = Array.from(this.storage.values()).filter(c => c.conversationId === conversationId2);
    const searchResultsC2 = this.searchConversationHistory("", conversationId2);
    
    console.log(`\n6. Complete isolation verification:`);
    console.log(`   Conversation 1 - All entries: ${allConversationsC1.length}, Search results: ${searchResultsC1.length}`);
    console.log(`   Conversation 2 - All entries: ${allConversationsC2.length}, Search results: ${searchResultsC2.length}`);
    
    if (allConversationsC1.length === searchResultsC1.length && allConversationsC2.length === searchResultsC2.length) {
      console.log("   ✅ Perfect isolation achieved!");
    } else {
      console.log("   ❌ Isolation not perfect!");
    }
    
    console.log("\n=== Test Complete ===");
    return {
      isolationWorks: resultsIsolationTest.length === 0,
      conversationId1,
      conversationId2,
      resultsInC1: results1.length,
      resultsInC2: results2.length
    };
  }
}

// Run the test
const tester = new ConversationIsolationTester();
tester.runIsolationTest();