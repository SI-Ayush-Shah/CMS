import { useState, useEffect, useCallback } from "react";
import MagicBento, { BentoCard } from "../components/MagicBento";
import InstagramCard from "../components/InstagramCard";
import TwitterCard from "../components/TwitterCard";
import Loader from "../components/Loader";
import Masonry from "react-masonry-css";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

import { MdRefresh } from "react-icons/md";
  import { Button } from "../components/Button";
import { listSocialPosts, publishSocialPost } from "../services";

// Custom CSS for masonry layout
const masonryStyles = `
.masonry-grid {
  display: flex !important;
  width: 100% !important;
  margin-left: -16px;
}
.masonry-grid-column {
  padding-left: 16px;
  background-clip: padding-box;
  width: 100% !important;
  flex: 1 !important;
}
.masonry-card {
  width: 100%;
  margin-bottom: 16px;
  display: block;
}
`;

const SocialMediaPage = () => {
  const [activeTab, setActiveTab] = useState("instagram"); // instagram | twitter

  // Data state per platform
  const [instagramData, setInstagramData] = useState({
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [twitterData, setTwitterData] = useState({
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchPosts = useCallback(
    async (platform, page = 1, pageSize = 10, append = false) => {
      try {
        setIsError(false);
        setIsLoading(true);
        const result = await listSocialPosts({ platform, page, pageSize });
        if (platform === "instagram") {
          setInstagramData((prev) => ({
            items: append ? [...prev.items, ...result.items] : result.items,
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
          }));
        } else {
          setTwitterData((prev) => ({
            items: append ? [...prev.items, ...result.items] : result.items,
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
          }));
        }
      } catch (e) {
        setIsError(true);
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Failed to fetch social posts", e);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load and on tab change
  useEffect(() => {
    if (activeTab === "instagram" && instagramData.items.length === 0) {
      fetchPosts("instagram", 1, instagramData.pageSize);
    }
    if (activeTab === "twitter" && twitterData.items.length === 0) {
      fetchPosts("twitter", 1, twitterData.pageSize);
    }
  }, [
    activeTab,
    fetchPosts,
    instagramData.items.length,
    instagramData.pageSize,
    twitterData.items.length,
    twitterData.pageSize,
  ]);

  const displayPosts =
    activeTab === "instagram" ? instagramData.items : twitterData.items;
  const canLoadMore =
    activeTab === "instagram"
      ? instagramData.items.length < instagramData.total
      : twitterData.items.length < twitterData.total;
  const handleLoadMore = () => {
    if (activeTab === "instagram") {
      const nextPage = instagramData.page + 1;
      fetchPosts("instagram", nextPage, instagramData.pageSize, true);
    } else {
      const nextPage = twitterData.page + 1;
      fetchPosts("twitter", nextPage, twitterData.pageSize, true);
    }
  };
  const handleRefresh = useCallback(() => {
    if (activeTab === "instagram")
      fetchPosts("instagram", 1, instagramData.pageSize, false);
    else fetchPosts("twitter", 1, twitterData.pageSize, false);
  }, [activeTab, fetchPosts, instagramData.pageSize, twitterData.pageSize]);

  const handlePublish = useCallback(
    async (id) => {
      try {
        const res = await publishSocialPost(id);
        if (res?.success) {
          handleRefresh();
        } else {
          const msg = res?.error || "Failed to publish post";
          alert(msg);
        }
      } catch (e) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Failed to publish social post", e);
        }
        alert(e?.message || "Failed to publish post");
      }
    },
    [handleRefresh]
  );

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Masonry CSS */}
      <style dangerouslySetInnerHTML={{ __html: masonryStyles }} />

      <div className="min-h-screen">
        {/* Page Title + Tabs */}
        <section className="px-6 pt-10 pb-6 w-full">
          <div className="w-full mx-auto">
            <h1 className="text-white text-[28px] font-semibold mb-4">
              Social Media Feed
            </h1>
            <div className="flex items-center gap-3">
              <Tabs active={activeTab} onChange={setActiveTab} />
             
              <button
                className="px-3 py-[6px] h-full inline-flex items-center justify-center rounded-md text-xs font-medium bg-border-main-default/30 text-invert-high"
                onClick={handleRefresh}
                type="button"
              >
                <MdRefresh className="text-2xl" />
              </button>
            </div>
          </div>
        </section>

        {/* Social Media Posts Grid via MagicBento */}
        <section className="pb-16 px-6 w-full">
          <div className="w-full mx-auto min-h-full">
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <Loader text="Loading posts..." />
              </div>
            )}
            <MagicBento
              textAutoHide
              enableStars={false}
              enableSpotlight
              enableBorderGlow
              enableTilt={false}
              enableMagnetism={false}
              clickEffect
              spotlightRadius={300}
              glowColor="132, 0, 255"
              className="w-full"
            >
              <div className="w-full">
                {isError && (
                  <div className="text-error-400">
                    Failed to load posts. Please try again.
                  </div>
                )}

                {activeTab === "instagram" ? (
                  // Instagram posts - regular grid layout
                  <div className="card-responsive grid gap-6 w-full">
                    {displayPosts.map((post) => (
                      <BentoCard
                        key={post.id}
                        enableTilt={false}
                        enableMagnetism={false}
                        enableBorderGlow
                        className="w-full rounded-[15px]"
                      >
                        <InstagramCard
                          id={post.id}
                          image={post.imageUrl}
                          username={"CMS Bot"}
                          date={new Date(post.createdAt).toLocaleDateString()}
                          title={post.text}
                          hashtags={
                            Array.isArray(post.hashtags) ? post.hashtags : []
                          }
                          likes={0}
                          comments={0}
                          status={post.status}
                          onPublished={handlePublish}
                        />
                      </BentoCard>
                    ))}
                  </div>
                ) : (
                  // Twitter posts - masonry layout
                  <div className="w-full">
                    <Masonry
                      breakpointCols={{
                        default: 4,
                        1440: 4,
                        1280: 3,
                        1024: 2,
                        768: 2,
                        640: 1,
                      }}
                      className="masonry-grid"
                      columnClassName="masonry-grid-column"
                    >
                      {displayPosts.map((post) => (
                        <div key={post.id} className="masonry-card">
                          <BentoCard
                            enableTilt={false}
                            enableMagnetism={false}
                            enableBorderGlow
                            className="w-full rounded-[15px]"
                          >
                            <TwitterCard
                              id={post.id}
                              username={"CMS Bot"}
                              handle={"cmsbot"}
                              date={new Date(
                                post.createdAt
                              ).toLocaleDateString()}
                              content={post.text}
                              image={post.imageUrl}
                              status={post.status}
                              onPublished={handlePublish}
                            />
                          </BentoCard>
                        </div>
                      ))}
                    </Masonry>
                  </div>
                )}

                {!isLoading &&
                  (activeTab === "instagram"
                    ? displayPosts.length === 0 && (
                        <div className="text-invert-low">
                          No Instagram posts found.
                        </div>
                      )
                    : displayPosts.length === 0 && (
                        <div className="text-invert-low">
                          No Twitter posts found.
                        </div>
                      ))}

                {/* Load more */}
                {!isLoading && displayPosts.length > 0 && canLoadMore && (
                  <div className="w-full flex justify-center mt-6">
                    <button
                      className="px-4 h-9 inline-flex items-center justify-center rounded-lg text-sm font-medium bg-border-main-default/30 text-invert-high"
                      onClick={handleLoadMore}
                      type="button"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
            </MagicBento>
          </div>
        </section>
      </div>
    </>
  );
};

export default SocialMediaPage;

// Tabs UI component similar to BlogPage
const Tabs = ({ active = "instagram", onChange }) => {
  const base =
    "px-4 h-9 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  return (
    <div className="flex gap-3">
      <button
        className={`${base} ${active === "instagram" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/30 text-invert-high"}`}
        onClick={() => onChange && onChange("instagram")}
        type="button"
      >
        <FaInstagram className="mr-2" size={16} />
        Instagram
      </button>
      <button
        className={`${base} ${active === "twitter" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/30 text-invert-high"}`}
        onClick={() => onChange && onChange("twitter")}
        type="button"
      >
        <FaTwitter className="mr-2" size={16} />
        Twitter
      </button>
    </div>
  );
};
