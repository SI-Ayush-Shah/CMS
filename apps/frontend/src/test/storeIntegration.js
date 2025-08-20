/**
 * Integration test for blog and refinement stores working together
 * This simulates the complete refinement workflow
 */

import { useBlogStore } from '../store/blogStore';
import { useRefinementStore } from '../store/refinementStore';
import { contentApi } from '../services/contentApi';

/**
 * Test the complete refinement workflow
 */
export const testRefinementWorkflow = async () => {
  console.log('=== Testing Complete Refinement Workflow ===');
  
  const blogStore = useBlogStore.getState();
  const refinementStore = useRefinementStore.getState();
  
  try {
    // Step 1: Load a blog
    console.log('1. Loading blog...');
    await blogStore.loadBlog('test-blog-123');
    
    if (!blogStore.currentBlog) {
      throw new Error('Failed to load blog');
    }
    console.log('✓ Blog loaded successfully');
    
    // Step 2: Start refinement process
    console.log('2. Starting refinement...');
    const refinementPrompt = "Make this content more engaging and add examples";
    refinementStore.startRefinement(refinementPrompt);
    
    if (!refinementStore.isProcessing) {
      throw new Error('Refinement processing not started');
    }
    console.log('✓ Refinement processing started');
    
    // Step 3: Simulate API call for refinement
    console.log('3. Processing refinement...');
    const refinementResult = await contentApi.refineContent(
      blogStore.currentBlog.id,
      refinementPrompt,
      'improve'
    );
    
    if (!refinementResult.success) {
      throw new Error('Refinement API call failed');
    }
    console.log('✓ Refinement API call successful');
    
    // Step 4: Update blog content with refined version
    console.log('4. Updating blog content...');
    const originalBlockCount = blogStore.currentBlog.body.blocks.length;
    blogStore.updateBlogContent(refinementResult.data.updatedBody);
    
    if (!blogStore.canRollback()) {
      throw new Error('Rollback not available after content update');
    }
    console.log('✓ Blog content updated with rollback available');
    
    // Step 5: Complete refinement in store
    console.log('5. Completing refinement...');
    refinementStore.completeRefinement(refinementResult.data.message);
    
    if (refinementStore.isProcessing) {
      throw new Error('Refinement still processing after completion');
    }
    console.log('✓ Refinement completed successfully');
    
    // Step 6: Test rollback functionality
    console.log('6. Testing rollback...');
    const rollbackSuccess = blogStore.rollbackToPrevious();
    
    if (!rollbackSuccess) {
      throw new Error('Rollback failed');
    }
    
    const currentBlockCount = blogStore.currentBlog.body.blocks.length;
    if (currentBlockCount !== originalBlockCount) {
      throw new Error('Rollback did not restore original content');
    }
    console.log('✓ Rollback successful');
    
    // Step 7: Verify message history
    console.log('7. Verifying message history...');
    const messageCount = refinementStore.getMessageCount();
    
    if (messageCount < 2) { // Should have user message and assistant response
      throw new Error('Message history incomplete');
    }
    console.log('✓ Message history verified');
    
    // Step 8: Test error handling
    console.log('8. Testing error handling...');
    refinementStore.setError('Test error message');
    
    if (!refinementStore.error) {
      throw new Error('Error state not set');
    }
    
    refinementStore.clearError();
    
    if (refinementStore.error) {
      throw new Error('Error state not cleared');
    }
    console.log('✓ Error handling verified');
    
    console.log('=== All Workflow Tests Passed ✓ ===');
    return true;
    
  } catch (error) {
    console.error('=== Workflow Test Failed ✗ ===');
    console.error('Error:', error.message);
    
    // Clean up stores
    blogStore.clearBlog();
    refinementStore.reset();
    
    return false;
  }
};

/**
 * Test store state synchronization
 */
export const testStoreSynchronization = () => {
  console.log('=== Testing Store Synchronization ===');
  
  const blogStore = useBlogStore.getState();
  const refinementStore = useRefinementStore.getState();
  
  try {
    // Test 1: Verify stores are independent
    console.log('1. Testing store independence...');
    blogStore.clearBlog();
    refinementStore.reset();
    
    if (blogStore.currentBlog !== null || refinementStore.messages.length > 0) {
      throw new Error('Stores not properly reset');
    }
    console.log('✓ Stores are independent');
    
    // Test 2: Test concurrent operations
    console.log('2. Testing concurrent operations...');
    
    // Simulate loading blog while processing refinement
    blogStore.loadBlog('concurrent-test');
    refinementStore.startRefinement('Concurrent test');
    
    // Both should be able to operate independently
    if (!blogStore.isLoading || !refinementStore.isProcessing) {
      throw new Error('Concurrent operations not working');
    }
    console.log('✓ Concurrent operations working');
    
    // Test 3: Test error isolation
    console.log('3. Testing error isolation...');
    blogStore.clearError();
    refinementStore.clearError();
    
    blogStore.setError?.('Blog error') || (blogStore.error = 'Blog error');
    refinementStore.setError('Refinement error');
    
    if (blogStore.error === refinementStore.error) {
      throw new Error('Errors not isolated between stores');
    }
    console.log('✓ Error isolation working');
    
    console.log('=== Store Synchronization Tests Passed ✓ ===');
    return true;
    
  } catch (error) {
    console.error('=== Synchronization Test Failed ✗ ===');
    console.error('Error:', error.message);
    return false;
  }
};

/**
 * Run all integration tests
 */
export const runIntegrationTests = async () => {
  console.log('🚀 Starting Store Integration Tests...');
  
  const results = {
    workflow: false,
    synchronization: false
  };
  
  try {
    results.workflow = await testRefinementWorkflow();
    results.synchronization = testStoreSynchronization();
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('🎉 All Integration Tests Passed!');
    } else {
      console.log('❌ Some Integration Tests Failed');
      console.log('Results:', results);
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('💥 Integration Tests Crashed:', error);
    return false;
  }
};

// Export test utilities
export const integrationTestUtils = {
  testRefinementWorkflow,
  testStoreSynchronization,
  runIntegrationTests
};