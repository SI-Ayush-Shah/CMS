/**
 * Simple test file to verify store functionality
 * This is a basic verification, not a full test suite
 */

import { useBlogStore } from '../store/blogStore';
import { useRefinementStore } from '../store/refinementStore';

// Test blog store functionality
export const testBlogStore = () => {
  console.log('Testing Blog Store...');
  
  const store = useBlogStore.getState();
  
  // Test initial state
  console.log('Initial state:', {
    currentBlog: store.currentBlog,
    isLoading: store.isLoading,
    error: store.error,
    canRollback: store.canRollback()
  });
  
  // Test mock content update
  const mockContent = {
    time: Date.now(),
    blocks: [
      {
        id: "test1",
        type: "paragraph",
        data: { text: "Test content" }
      }
    ]
  };
  
  // Simulate loading a blog first
  store.currentBlog = {
    id: "test-blog",
    title: "Test Blog",
    body: { blocks: [] },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Test content update
  store.updateBlogContent(mockContent);
  console.log('After update:', {
    hasContent: !!store.currentBlog,
    canRollback: store.canRollback(),
    versionCount: store.getVersionCount()
  });
  
  // Test rollback
  if (store.canRollback()) {
    const success = store.rollbackToPrevious();
    console.log('Rollback success:', success);
  }
  
  console.log('Blog Store test completed ✓');
};

// Test refinement store functionality  
export const testRefinementStore = () => {
  console.log('Testing Refinement Store...');
  
  const store = useRefinementStore.getState();
  
  // Test initial state
  console.log('Initial state:', {
    messageCount: store.getMessageCount(),
    isProcessing: store.isProcessing,
    error: store.error
  });
  
  // Test adding messages
  store.addUserMessage("Test user message");
  store.addAssistantMessage("Test assistant response");
  
  console.log('After adding messages:', {
    messageCount: store.getMessageCount(),
    lastMessage: store.getLastMessage()?.content
  });
  
  // Test processing states
  store.startRefinement("Test refinement prompt");
  console.log('Processing started:', store.getProcessingState());
  
  store.completeRefinement("Refinement completed successfully");
  console.log('Processing completed:', store.getProcessingState());
  
  // Test error handling
  store.setError("Test error message");
  console.log('Error state:', {
    error: store.error,
    hasErrors: store.hasErrorMessages()
  });
  
  store.clearError();
  console.log('After clearing error:', { error: store.error });
  
  console.log('Refinement Store test completed ✓');
};

// Run all tests
export const runStoreTests = () => {
  console.log('=== Store Tests Starting ===');
  
  try {
    testBlogStore();
    testRefinementStore();
    console.log('=== All Store Tests Passed ✓ ===');
    return true;
  } catch (error) {
    console.error('=== Store Tests Failed ✗ ===');
    console.error(error);
    return false;
  }
};

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  console.log('Store test utilities loaded. Run runStoreTests() to test.');
}