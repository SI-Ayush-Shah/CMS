import { apiClient } from "./axiosConfig";
import { getWithParams } from "./httpUtils";

/**
 * List social media posts from backend
 * @param {{ platform?: 'instagram'|'twitter', page?: number, pageSize?: number }} params
 * @returns {Promise<{ items: any[], total: number, page: number, pageSize: number }>}
 */
export const listSocialPosts = async ({
  platform,
  page = 1,
  pageSize = 10,
} = {}) => {
  const { data } = await getWithParams(
    "/content-studio/api/social-media-posts",
    { platform, page: String(page), pageSize: String(pageSize) },
    { skipRetry: false }
  );
  return data?.data || { items: [], total: 0, page, pageSize };
};

/**
 * Get social media generation job status
 * If waitMs is provided (>0), server will wait until finished or timeout
 * @param {string} jobId
 * @param {number} [waitMs]
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export const getSocialJobStatus = async (jobId, waitMs) => {
  const url = waitMs
    ? `/content-studio/api/social-media-generation/status/${encodeURIComponent(jobId)}?wait=${Math.min(Number(waitMs) || 30000, 60000)}`
    : `/content-studio/api/social-media-generation/status/${encodeURIComponent(jobId)}`;
  const { data } = await apiClient.get(url, { skipRetry: false });
  return data;
};

export const socialApi = {
  listSocialPosts,
  getSocialJobStatus,
};
