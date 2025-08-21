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
    // Navigate to content editor page with RSS item data in state
    navigate("/editor/new", {
      state: {
        rssFeedItem: item,
        mode: "summarize",
      },
    });
  };
  const formatDate = (input) => {
    if (!input) return "";
    const d = new Date(input);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  const [activeTab, setActiveTab] = useState("custom"); // custom | ai | published
  const status = useMemo(
    () => (activeTab === "published" ? "published" : "draft"),
    [activeTab]
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const pageSize = rowsPerPage;

  // Query for blog posts (custom and published tabs)
  const {
    data: blogData,
    isLoading: isBlogLoading,
    isFetching: isBlogFetching,
    isError: isBlogError,
  } = useQuery({
    queryKey: ["blogPosts", { page: currentPage, pageSize, status }],
    queryFn: () =>
      contentApi.fetchBlogPosts({
        page: currentPage,
        pageSize,
        status,
        sort: "desc",
      }),
    keepPreviousData: true,
    enabled: activeTab !== "ai",
  });

  // Query for RSS feed items (ai tab)
  const {
    data: rssData,
    isLoading: isRssLoading,
    isFetching: isRssFetching,
    isError: isRssError,
  } = useQuery({
    queryKey: ["rssItems", { page: currentPage, pageSize }],
    queryFn: () => contentApi.fetchRssItems({ page: currentPage, pageSize }),
    keepPreviousData: true,
    enabled: activeTab === "ai",
  });

  const blogPosts = blogData?.items || [];
  const rssItems = rssData?.items || [];

  // Get total counts for pagination
  const totalBlogPosts = blogData?.total || 0;
  const totalRssItems = rssData?.total || 0;
  const totalItems = activeTab === "ai" ? totalRssItems : totalBlogPosts;
  const totalPages = Math.ceil(totalItems / pageSize);

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
                {activeTab !== "ai"
                  ? // Render blog posts for custom and published tabs
                    blogPosts.map((p) => (
                      <BentoCard
                        key={p.id}
                        enableTilt={false}
                        enableMagnetism={false}
                        enableBorderGlow
                        className="w-full rounded-[15px]"
                      >
                        <BlogCard
                          image={p.bannerUrl || p.image}
                          date={formatDate(p.createdAt)}
                          title={p.title}
                          description={p.summary}
                          onCtaClick={() => navigate(`/editor/${p.id}`)}
                        />
                      </BentoCard>
                    ))
                  : // Render RSS feed items for ai tab
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
                    ))}
                {!isLoading &&
                  !isFetching &&
                  (activeTab !== "ai"
                    ? blogPosts.length === 0 && (
                        <div className="text-invert-low">No posts found.</div>
                      )
                    : rssItems.length === 0 && (
                        <div className="text-invert-low">
                          No RSS items found.
                        </div>
                      ))}
              </div>
            </MagicBento>

            {/* Pagination - only show when not loading and we have content */}
            {!isLoading && !isFetching && totalItems > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 mr-2">
                    Rows Per Page:
                  </span>
                  <select
                    className="bg-gray-800/80 text-white rounded-md px-2 py-1 text-sm border border-gray-700"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors disabled:opacity-50 disabled:hover:bg-gray-800/80"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${currentPage === pageNum ? "bg-purple-600 text-white" : "bg-gray-800/80 text-white hover:bg-gray-700/80"}`}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={
                          currentPage === pageNum ? "page" : undefined
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="text-white">...</span>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${currentPage === totalPages ? "bg-purple-600 text-white" : "bg-gray-800/80 text-white hover:bg-gray-700/80"}`}
                        onClick={() => setCurrentPage(totalPages)}
                        aria-label={`Page ${totalPages}`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors disabled:opacity-50 disabled:hover:bg-gray-800/80"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
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
