import { create } from "zustand";
import { contentApi } from "../services/contentApi";

/**
 * Blog Store for managing current blog content and loading states
 * Handles content versioning system for rollback functionality
 */
export const useBlogStore = create((set, get) => ({
  // Current blog state
  currentBlog: null,
  previousVersions: [],
  isLoading: false,
  error: null,
  
  // Actions for loading blog content
  loadBlog: async (blogId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use the new getBlogContent API function
      const blog = await contentApi.getBlogContent(blogId);
      
      // Transform to expected blog structure
      const blogData = {
        id: blogId,
        title: blog.title || "Untitled Blog",
        summary: blog.summary || "",
        category: blog.category || "General",
        tags: blog.tags || [],
        bannerUrl: blog.bannerUrl || null,
        images: blog.images || [],
        body: blog.body || { blocks: [] }, // Editor.js format
        createdAt: blog.createdAt || new Date(),
        updatedAt: blog.updatedAt || new Date()
      };
      
      set({ 
        currentBlog: blogData, 
        isLoading: false,
        error: null,
        previousVersions: [] // Reset versions when loading new blog
      });
    } catch (error) {
      console.error("Failed to load blog:", error);
      set({ 
        error: error.message || "Failed to load blog content", 
        isLoading: false,
        currentBlog: null
      });
    }
  },
  
  // Update blog content and store previous version for rollback
  updateBlogContent: (updatedBody) => {
    const currentBlog = get().currentBlog;
    
    if (!currentBlog) {
      console.error("No current blog to update");
      set({ error: "No blog loaded to update" });
      return;
    }
    
    try {
      // Store previous version for rollback (keep last 5 versions)
      const previousVersions = get().previousVersions || [];
      const newPreviousVersions = [
        ...previousVersions.slice(-4), // Keep last 4, add current as 5th
        { 
          body: currentBlog.body, 
          timestamp: new Date(),
          version: previousVersions.length + 1
        }
      ];
      
      // Update current blog with new content
      const updatedBlog = {
        ...currentBlog,
        body: updatedBody,
        updatedAt: new Date()
      };
      
      set({ 
        currentBlog: updatedBlog,
        previousVersions: newPreviousVersions,
        error: null
      });
      
      console.log("Blog content updated successfully");
    } catch (error) {
      console.error("Failed to update blog content:", error);
      set({ error: "Failed to update blog content" });
    }
  },
  
  // Rollback to previous version with backend sync
  rollbackToPrevious: async () => {
    const { currentBlog, previousVersions } = get();
    
    if (!currentBlog) {
      set({ error: "No blog loaded to rollback" });
      return false;
    }
    
    if (!previousVersions || previousVersions.length === 0) {
      set({ error: "No previous versions available for rollback" });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Get the most recent previous version
      const previousVersion = previousVersions[previousVersions.length - 1];
      const remainingVersions = previousVersions.slice(0, -1);
      
      // Call rollback API to sync with backend
      await contentApi.rollbackBlogContent(currentBlog.id, previousVersion.body);
      
      // Update current blog with previous version content
      const rolledBackBlog = {
        ...currentBlog,
        body: previousVersion.body,
        updatedAt: new Date()
      };
      
      set({
        currentBlog: rolledBackBlog,
        previousVersions: remainingVersions,
        isLoading: false,
        error: null
      });
      
      console.log("Successfully rolled back to previous version");
      return true;
    } catch (error) {
      console.error("Failed to rollback:", error);
      set({ 
        error: error.message || "Failed to rollback to previous version",
        isLoading: false 
      });
      return false;
    }
  },
  
  // Save current blog content to backend
  saveBlogContent: async () => {
    const currentBlog = get().currentBlog;
    
    if (!currentBlog) {
      set({ error: "No blog content to save" });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Use the updateBlogContent API function
      await contentApi.updateBlogContent(currentBlog.id, currentBlog.body);
      
      set({ isLoading: false });
      console.log("Blog content saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save blog content:", error);
      set({ 
        error: error.message || "Failed to save blog content", 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Clear current blog and reset state
  clearBlog: () => {
    set({
      currentBlog: null,
      previousVersions: [],
      isLoading: false,
      error: null
    });
  },
  
  // Clear error state
  clearError: () => {
    set({ error: null });
  },
  
  // Get rollback availability
  canRollback: () => {
    const { previousVersions } = get();
    return previousVersions && previousVersions.length > 0;
  },
  
  // Get version count for UI display
  getVersionCount: () => {
    const { previousVersions } = get();
    return (previousVersions?.length || 0) + 1; // +1 for current version
  }
}));