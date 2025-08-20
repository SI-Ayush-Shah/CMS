/**
 * Store exports for content refinement chat system
 */

// Export existing stores
export { useProcessingStore } from './processingStore';

// Export new stores for content refinement
export { useBlogStore } from './blogStore';
export { useRefinementStore } from './refinementStore';

// Store utilities and helpers
export const storeUtils = {
  // Helper to reset all refinement-related stores
  resetRefinementStores: () => {
    // Import stores dynamically to avoid circular dependencies
    import('./blogStore').then(({ useBlogStore }) => {
      useBlogStore.getState().clearBlog();
    });
    
    import('./refinementStore').then(({ useRefinementStore }) => {
      useRefinementStore.getState().reset();
    });
  },
  
  // Helper to check if any store has errors
  hasAnyErrors: () => {
    // This would need to be called from components that have access to store state
    // Keeping as utility for future use
    return false;
  }
};