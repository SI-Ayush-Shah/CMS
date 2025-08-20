import { apiClient } from "./axiosConfig";

/**
 * Build a URL by appending query parameters. Skips undefined/null/false values.
 * Arrays are appended as repeated keys per value.
 */
export const buildUrlWithParams = (path, params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
      return;
    }

    if (typeof value === "boolean") {
      searchParams.append(key, value ? "true" : "false");
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

/**
 * Convenience helper for multipart/form-data POST requests.
 */
export const postMultipart = (url, formData, config = {}) => {
  return apiClient.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};

/**
 * Convenience helper for GET with params.
 */
export const getWithParams = (path, params = {}, config = {}) => {
  const url = buildUrlWithParams(path, params);
  return apiClient.get(url, config);
};
