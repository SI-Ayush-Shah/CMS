import { apiClient } from "./axiosConfig";

/**
 * Content API Service for Showcase App
 * 
 * API Endpoints:
 * - GET /content-studio/api/content - Fetch blog posts with pagination/filtering
 * - GET /content-studio/api/content/:id - Fetch individual blog post by ID
 * 
 * Base URL: Configured in axiosConfig.js (defaults to http://localhost:3001)
 */
export const fetchBlogPosts = async ({
  page = 1,
  pageSize = 10,
  status,
  category,
  categories,
  tags,
  sort = "desc",
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (pageSize) params.append("pageSize", String(pageSize));
    if (status) params.append("status", status);
    if (category) params.append("category", category);
    if (Array.isArray(categories))
      categories.forEach((c) => params.append("categories", c));
    if (Array.isArray(tags)) tags.forEach((t) => params.append("tags", t));
    if (sort) params.append("sort", sort);

    const url = `/content-studio/api/content?${params.toString()}`;
    console.log(`🔍 Fetching blog posts: ${url}`);
    
    const { data } = await apiClient.get(url, { skipRetry: false });
    console.log('📡 Blog posts API Response:', data);
    
    // Handle different API response structures
    if (data?.success) {
      // Standard success response: { success: true, data: { items, total, page, pageSize } }
      console.log('✅ Success response structure detected');
      return data.data || { items: [], total: 0, page, pageSize };
    } else if (data?.items) {
      // Direct data response: { items: [...], total: ..., page: ..., pageSize: ... }
      console.log('✅ Direct data response structure detected');
      return data;
    } else {
      // Fallback: return empty result
      console.log('⚠️ Using fallback response structure');
      return { items: [], total: 0, page, pageSize };
    }
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    throw new Error(error?.response?.data?.message || error?.message || "Failed to fetch blog posts");
  }
};

/**
 * Get blog content by ID
 * @param {string} blogId - The blog ID to retrieve
 * @returns {Promise<Object>} Blog content data
 */
export const getBlogContent = async (blogId) => {
  try {
    console.log(`🔍 Fetching blog content for ID: ${blogId}`);
    const { data } = await apiClient.get(`/content-studio/api/content/${blogId}`);
    
    console.log('📡 API Response:', data);
    
    // Handle different API response structures
    if (data?.success) {
      // Standard success response: { success: true, data: {...} }
      console.log('✅ Success response structure detected');
      return data.data;
    } else if (data?.id) {
      // Direct data response: { id: "...", title: "...", ... }
      console.log('✅ Direct data response structure detected');
      return data;
    } else {
      // Fallback: return the entire response
      console.log('⚠️ Using fallback response structure');
      return data;
    }
  } catch (error) {
    console.error('❌ Error fetching blog content:', error);
    throw new Error(error?.response?.data?.message || error?.message || "Failed to retrieve blog content");
  }
};

// Export all functions as a service object
export const contentApi = {
  fetchBlogPosts,
  getBlogContent,
}; 