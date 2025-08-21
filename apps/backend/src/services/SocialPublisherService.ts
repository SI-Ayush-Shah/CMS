import axios from "axios";
import { TwitterApi } from "twitter-api-v2";
import { env } from "../config/env";
import { SocialMediaPost } from "../db/schema/socialMediaPosts";

export interface PublishResult {
  platform: "twitter" | "instagram";
  platformPostId?: string;
  url?: string;
}

export interface SocialPublisherService {
  publish(post: SocialMediaPost): Promise<PublishResult>;
}

export function createSocialPublisherService(): SocialPublisherService {
  function makeStatusError(
    message: string,
    status?: number
  ): Error & { statusCode?: number } {
    const err = new Error(message) as Error & { statusCode?: number };
    if (status) err.statusCode = status;
    return err;
  }

  async function publishToTwitter(
    post: SocialMediaPost
  ): Promise<PublishResult> {
    const apiKey = env.TWITTER_API_KEY;
    const apiSecret = env.TWITTER_API_SECRET;
    const accessToken = env.TWITTER_ACCESS_TOKEN;
    const accessSecret = env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      // Safe debug log (no secret values)
      console.warn("[Twitter] Missing credentials", {
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
        hasAccessToken: !!accessToken,
        hasAccessSecret: !!accessSecret,
      });
      throw makeStatusError("Twitter credentials are not configured", 401);
    }

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret,
    });
    console.log("client", client);

    const hashtagsText =
      Array.isArray(post.hashtags) && post.hashtags.length
        ? " " +
          post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")
        : "";
    const linkText = post.link ? ` ${post.link}` : "";
    let text = `${post.text}${hashtagsText}${linkText}`.trim();
    if (text.length > 280) {
      text = text.slice(0, 277) + "…";
    }

    try {
      const res = await client.v2.tweet(text);
      const id = res?.data?.id;
      const url = id ? `https://twitter.com/i/web/status/${id}` : undefined;
      return { platform: "twitter", platformPostId: id, url };
    } catch (err: any) {
      const status = err?.code || err?.status || err?.response?.status;
      const data = err?.data || err?.response?.data;
      const title = data?.title || data?.error || data?.errors?.[0]?.message;
      const detail = data?.detail || data?.errors?.[0]?.detail || err?.message;
      console.error("[Twitter] publish error", { status, data: data || null });
      throw makeStatusError(
        `[Twitter] ${title || "Request failed"}${status ? ` (status ${status})` : ""}${detail ? `: ${detail}` : ""}`,
        typeof status === "number" ? status : undefined
      );
    }
  }

  async function publishToInstagram(
    post: SocialMediaPost
  ): Promise<PublishResult> {
    const igUserId = env.IG_BUSINESS_ACCOUNT_ID;
    const igAccessToken = env.IG_ACCESS_TOKEN;
    if (!igUserId || !igAccessToken) {
      console.warn("[Instagram] Missing credentials", {
        hasUserId: !!igUserId,
        hasAccessToken: !!igAccessToken,
      });
      throw makeStatusError("Instagram credentials are not configured", 401);
    }
    if (!post.imageUrl) {
      throw makeStatusError("Instagram publishing requires an imageUrl", 400);
    }

    const hashtagsText =
      Array.isArray(post.hashtags) && post.hashtags.length
        ? " " +
          post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")
        : "";
    const caption = `${post.text}${hashtagsText}`.trim().slice(0, 2200);

    // 1) Create media container
    try {
      const creation = await axios.post(
        `https://graph.facebook.com/v19.0/${encodeURIComponent(igUserId)}/media`,
        null,
        {
          params: {
            image_url: post.imageUrl,
            caption,
            access_token: igAccessToken,
          },
        }
      );
      const creationId: string | undefined = creation?.data?.id;
      if (!creationId)
        throw new Error("Failed to create Instagram media container");

      // 2) Publish container
      const publish = await axios.post(
        `https://graph.facebook.com/v19.0/${encodeURIComponent(igUserId)}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: igAccessToken,
          },
        }
      );
      const mediaId: string | undefined = publish?.data?.id;
      return { platform: "instagram", platformPostId: mediaId };
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = data?.error?.message || data?.message || err?.message;
      console.error("[Instagram] publish error", {
        status,
        data: data || null,
      });
      throw makeStatusError(
        `[Instagram] Request failed${status ? ` (status ${status})` : ""}${message ? `: ${message}` : ""}`,
        typeof status === "number" ? status : undefined
      );
    }
  }

  return {
    async publish(post: SocialMediaPost): Promise<PublishResult> {
      if (post.platform === "twitter") return publishToTwitter(post);
      if (post.platform === "instagram") return publishToInstagram(post);
      throw new Error(`Unsupported platform: ${post.platform}`);
    },
  };
}
