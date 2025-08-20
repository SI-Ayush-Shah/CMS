import MagicBento, { BentoCard } from "../components/MagicBento";
import BlogCard from "../components/BlogCard";
import RssFeedCard from "../components/RssFeedCard";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contentApi } from "../services/contentApi";
import Loader from "../components/Loader";

// Using MagicBento for cards

const BlogPage = () => {
  // Function to handle summarize button click
  const handleSummarize = (item) => {
    // For now, just log the item - this would be expanded later
    console.log("Summarize clicked for:", item);
    // Here you would implement the summarization functionality
    // e.g., open a modal, navigate to a detail page, or call an API
  };
  const formatDate = (input) => {
    if (!input) return "";
    const d = new Date(input);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("custom"); // custom | ai | published
  const status = useMemo(
    () => (activeTab === "published" ? "published" : "draft"),
    [activeTab]
  );
  const pageSize = 8;
  
  // Query for blog posts (custom and published tabs)
  const { 
    data: blogData, 
    isLoading: isBlogLoading, 
    isFetching: isBlogFetching, 
    isError: isBlogError 
  } = useQuery({
    queryKey: ["blogPosts", { page, pageSize, status }],
    queryFn: () =>
      contentApi.fetchBlogPosts({ page, pageSize, status, sort: "desc" }),
    keepPreviousData: true,
    enabled: activeTab !== "ai"
  });
  
  // Query for RSS feed items (ai tab)
  const { 
    data: rssData, 
    isLoading: isRssLoading, 
    isFetching: isRssFetching, 
    isError: isRssError 
  } = useQuery({
    queryKey: ["rssItems", { page, pageSize }],
    queryFn: () => contentApi.fetchRssItems({ page, pageSize }),
    keepPreviousData: true,
    enabled: activeTab === "ai"
  });
  
  const blogPosts = blogData?.items || [];
  const rssItems = rssData?.items || [];
  
  // Determine which loading and error states to use based on active tab
  const isLoading = activeTab === "ai" ? isRssLoading : isBlogLoading;
  const isFetching = activeTab === "ai" ? isRssFetching : isBlogFetching;
  const isError = activeTab === "ai" ? isRssError : isBlogError;

  const navigate = useNavigate();

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

      <div className="min-h-screen">
        {/* Page Title + Tabs */}
        <section className="px-6 pt-10 pb-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white text-[28px] font-semibold mb-4">
              Content Hub
            </h1>
            <Tabs active={activeTab} onChange={setActiveTab} />
          </div>
        </section>

        {/* Blog Posts Grid via MagicBento + BentoCard (Figma DOM inside) */}
        <section className="pb-16 px-6">
          <div className="max-w-7xl mx-auto min-h-full">
            {(isLoading || isFetching) && blogPosts.length === 0 && (
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
            >
              <div className="card-responsive grid gap-6">
                {isError && (
                  <div className="text-error-400">
                    Failed to load posts. Please try again.
                  </div>
                )}
                {activeTab !== "ai" ? (
                  // Render blog posts for custom and published tabs
                  blogPosts.map((p) => (
                    <BentoCard
                      key={p.id}
                      enableTilt={false}
                      enableMagnetism={false}
                      enableBorderGlow
                      className="w-full rounded-[15px]"
                    >
                      <BlogCard
                        image={p.coverImageUrl || p.image}
                        date={formatDate(p.createdAt)}
                        title={p.title}
                        description={p.summary}
                        onCtaClick={() => navigate(`/editor/${p.id}`)}
                      />
                    </BentoCard>
                  ))
                ) : (
                  // Render RSS feed items for ai tab
                  rssItems.map((item) => (
                    <BentoCard
                      key={item.id}
                      enableTilt={false}
                      enableMagnetism={false}
                      enableBorderGlow
                      className="w-full rounded-[15px]"
                    >
                      <RssFeedCard
                        image={item.imageUrl}
                        title={item.title}
                        date={item.fetchedAt || item.createdAt}
                        summary={item.summary}
                        onSummarizeClick={() => handleSummarize(item)}
                      />
                    </BentoCard>
                  ))
                )}
                {!isLoading && !isFetching && (
                  activeTab !== "ai" ? 
                    (blogPosts.length === 0 && <div className="text-invert-low">No posts found.</div>) :
                    (rssItems.length === 0 && <div className="text-invert-low">No RSS items found.</div>)
                )}
              </div>
            </MagicBento>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;

// Simple tabs UI to match provided design (left-aligned pills)
const Tabs = ({ active = "custom", onChange }) => {
  const base =
    "px-4 h-9 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  return (
    <div className="flex gap-3">
      <button
        className={`${base} ${active === "custom" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/60 text-invert-high"}`}
        onClick={() => onChange && onChange("custom")}
        type="button"
      >
        Custom drafts
      </button>
      <button
        className={`${base} ${active === "ai" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/60 text-invert-high"}`}
        onClick={() => onChange && onChange("ai")}
        type="button"
      >
        AI drafts
      </button>
      <button
        className={`${base} ${active === "published" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/60 text-invert-high"}`}
        onClick={() => onChange && onChange("published")}
        type="button"
      >
        Published
      </button>
    </div>
  );
};
