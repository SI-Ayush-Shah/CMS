import { apiClient } from "./axiosConfig";

/**
 * Blog listing (server-backed)
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
  const { data } = await apiClient.get(url, { skipRetry: false });
  // API returns { success: boolean, data: { items, total, page, pageSize } }
  return data?.data || { items: [], total: 0, page, pageSize };
};

/**
 * Content API service for handling content generation and management
 * Currently implements mock functions for development and testing
 */

// Mock delay function to simulate network latency
const mockDelay = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock error simulation - 20% chance of failure
const shouldSimulateError = () => Math.random() < 0.2;

/**
 * Generate content based on text input and uploaded images
 * @param {string} text - The text content to process
 * @param {string[]} imageIds - Array of uploaded image IDs
 * @returns {Promise<Object>} Generated content response
 */
export const generateContent = async (text, imageIds = []) => {
  // TODO: Replace with real API call to backend content generation endpoint
  // const response = await apiClient.post('/content/generate', {
  //   text,
  //   imageIds,
  //   options: { /* generation options */ }
  // })
  // return response.data

  // Mock implementation
  await mockDelay(import.meta.env.VITE_API_TIMEOUT || 60000); // Simulate processing time

  if (shouldSimulateError()) {
    throw new Error("Content generation failed. Please try again.");
  }

  // Mock successful response
  return {
    id: `content_${Date.now()}`,
    generatedText: `Enhanced content based on: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
    suggestions: [
      "Consider adding more descriptive language",
      "Try including relevant hashtags",
      "Add a call-to-action for better engagement",
    ],
    imageCount: imageIds.length,
    processingTime: 1.5,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Generate content by sending multipart/form-data to the backend
 * Expects fields:
 * - content: string (required)
 * - banner: File (single, optional)
 * - image: File[] (can be multiple)
 *
 * @param {string} text - Content text
 * @param {Array<{file: File}>} images - Images selected in the UI (each item must include a `file`)
 * @returns {Promise<Object>} Backend response with blog ID
 */
export const generateContentViaForm = async (text, images = []) => {
  const formData = new FormData();
  formData.append("content", text ?? "");

  // Banner is single – use the first image if available
  if (images && images.length > 0 && images[0]?.file) {
    formData.append("banner", images[0].file);
  }

  // Append remaining images (excluding banner) as multiple `image` fields
  images.slice(1).forEach((img) => {
    if (img?.file) {
      formData.append("image", img.file);
    }
  });

  const response = await apiClient.post(
    "/content-studio/api/generate-content",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      skipRetry: true,
    }
  );

  return response.data;
};

/**
 * Save content to the backend
 * @param {Object} content - Content object to save
 * @param {string} content.text - The text content
 * @param {string[]} content.imageIds - Array of image IDs
 * @param {Object} content.metadata - Additional metadata
 * @returns {Promise<Object>} Save response
 */
export const saveContent = async (content) => {
  // TODO: Replace with real API call to save content
  // const response = await apiClient.post('/content/save', content)
  // return response.data

  // Mock implementation
  await mockDelay(800);

  if (shouldSimulateError()) {
    throw new Error(
      "Failed to save content. Please check your connection and try again."
    );
  }

  // Validate required fields
  if (!content.text || content.text.trim().length === 0) {
    throw new Error("Content text is required");
  }

  // Mock successful save response
  return {
    id: `saved_${Date.now()}`,
    status: "saved",
    url: `/content/${Date.now()}`,
    timestamp: new Date().toISOString(),
    version: 1,
  };
};

/**
 * Get content by ID
 * @param {string} contentId - The content ID to retrieve
 * @returns {Promise<Object>} Content data
 */
export const getContent = async (contentId) => {
  const { data } = await apiClient.get(
    `/content-studio/api/content/${contentId}`
  );
  if (!data?.success)
    throw new Error(data?.error || "Failed to retrieve content");
  return data.data;
};

/**
 * Delete content by ID
 * @param {string} contentId - The content ID to delete
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteContent = async (contentId) => {
  // TODO: Replace with real API call
  // const response = await apiClient.delete(`/content/${contentId}`)
  // return response.data

  // Mock implementation
  await mockDelay(600);

  if (shouldSimulateError()) {
    throw new Error("Failed to delete content");
  }

  return {
    id: contentId,
    status: "deleted",
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get blog content by ID for editor page
 * @param {string} blogId - The blog ID to retrieve
 * @returns {Promise<Object>} Blog content data
 */
export const getBlogContent = async (blogId) => {
  const { data } = await apiClient.get(`/content-studio/api/content/${blogId}`);
  if (!data?.success)
    throw new Error(data?.error || "Failed to retrieve blog content");
  return data.data;
};

/**
 * Refine existing blog content with AI assistance
 * @param {string} blogId - The blog ID to refine
 * @param {string} refinementPrompt - The refinement instruction
 * @param {string} refinementType - Type of refinement (optional)
 * @returns {Promise<Object>} Refinement response
 */
export const refineContent = async (
  blogId,
  refinementPrompt,
  body,
  refinementType = "custom"
) => {
  const payload = {
    blogId,
    prompt: refinementPrompt,
    body,
    refinementType,
  };
  const { data } = await apiClient.post(
    "/content-studio/api/refine-content",
    payload,
    { skipRetry: false }
  );
  return data;
};

/**
 * Update blog content in database
 * @param {string} blogId - The blog ID to update
 * @param {Object} updatedBody - The updated Editor.js content
 * @returns {Promise<Object>} Update response
 */
export const updateBlogContent = async (blogId, updatedBody) => {
  const response = await apiClient.patch(
    `/content-studio/api/content/${blogId}`,
    { body: updatedBody }
  );
  return response.data;
};

/**
 * Rollback blog content to previous version
 * @param {string} blogId - The blog ID to rollback
 * @param {Object} previousBody - The previous version content
 * @returns {Promise<Object>} Rollback response
 */
export const rollbackBlogContent = async (blogId, previousBody) => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.post(`/content-studio/api/content/${blogId}/rollback`, {
  //   body: previousBody
  // })
  // return response.data

  // Mock implementation for development
  await mockDelay(600);

  if (shouldSimulateError()) {
    throw new Error("Failed to rollback blog content");
  }

  console.log("Rolling back blog content:", {
    blogId,
    bodyBlocks: previousBody?.blocks?.length || 0,
  });

  return {
    success: true,
    data: {
      id: blogId,
      rolledBackAt: new Date().toISOString(),
    },
  };
};

/**
 * Fetch RSS feed items
 * @param {Object} options - Options for fetching RSS feed items
 * @param {number} options.page - Page number
 * @param {number} options.pageSize - Number of items per page
 * @returns {Promise<Object>} RSS feed items response
 */
export const fetchRssItems = async ({
  page = 1,
  pageSize = 10,
} = {}) => {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (pageSize) params.append("pageSize", String(pageSize));

  const url = `/content-studio/api/rss-items?${params.toString()}`;
  const { data } = await apiClient.get(url, { skipRetry: false });
  // API returns { success: boolean, data: { items, total, page, pageSize } }
  return data?.data || { items: [], total: 0, page, pageSize };
};

// Export all functions as a service object
export const contentApi = {
  generateContent,
  generateContentViaForm,
  saveContent,
  getContent,
  deleteContent,
  fetchBlogPosts,
  getBlogContent,
  refineContent,
  updateBlogContent,
  rollbackBlogContent,
  fetchRssItems,
};
