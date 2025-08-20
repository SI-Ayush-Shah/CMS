import { apiClient } from "./axiosConfig";

/**
 * Social Media API Service for Frontend App
 * 
 * API Endpoints:
 * - GET /content-studio/api/social-media-posts - Fetch social media posts with pagination/filtering
 * 
 * Base URL: Configured in axiosConfig.js (defaults to http://localhost:3001)
 */
export const listSocialPosts = async ({
  platform,
  page = 1,
  pageSize = 10,
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (platform) params.append("platform", platform);
    if (page) params.append("page", String(page));
    if (pageSize) params.append("pageSize", String(pageSize));

    const url = `/content-studio/api/social-media-posts?${params.toString()}`;
    console.log(`🔍 Fetching social media posts: ${url}`);
    
    const { data } = await apiClient.get(url, { skipRetry: false });
    console.log('📡 Social media posts API Response:', data);
    
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
    console.error('❌ Error fetching social media posts:', error);
    throw new Error(error?.response?.data?.message || error?.message || "Failed to fetch social media posts");
  }
};

/**
 * Get social media generation job status
 * If waitMs is provided (>0), server will wait until finished or timeout
 * @param {string} jobId
 * @param {number} [waitMs]
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export const getSocialJobStatus = async (jobId, waitMs) => {
  try {
    const url = waitMs
      ? `/content-studio/api/social-media-generation/status/${encodeURIComponent(jobId)}?wait=${Math.min(Number(waitMs) || 30000, 60000)}`
      : `/content-studio/api/social-media-generation/status/${encodeURIComponent(jobId)}`;
    
    console.log(`🔍 Fetching social media job status: ${url}`);
    const { data } = await apiClient.get(url, { skipRetry: false });
    console.log('📡 Social media job status API Response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching social media job status:', error);
    throw new Error(error?.response?.data?.message || error?.message || "Failed to fetch social media job status");
  }
};

// Export all functions as a service object
export const socialApi = {
  listSocialPosts,
  getSocialJobStatus,
};
