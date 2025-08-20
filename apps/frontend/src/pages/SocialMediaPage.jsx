import { useState, useMemo } from "react";
import MagicBento, { BentoCard } from "../components/MagicBento";
import InstagramCard from "../components/InstagramCard";
import TwitterCard from "../components/TwitterCard";
import Loader from "../components/Loader";
import Masonry from "react-masonry-css";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

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

  // Mock data for demonstration
  const instagramPosts = useMemo(() => [
    {
      id: 1,
      username: "devexplorer",
      date: "15 Nov",
      image: "https://images.unsplash.com/photo-1522252234503-e356532cafd5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Building responsive UIs with modern frameworks",
      hashtags: ["webdev", "programming", "reactjs", "frontend"],
      likes: 123,
      comments: 20
    },
    {
      id: 2,
      username: "codeartist",
      date: "14 Nov",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Late night coding session. Working on a new project!",
      hashtags: ["coding", "developer", "nightowl", "javascript"],
      likes: 87,
      comments: 12
    },
    {
      id: 3,
      username: "designninja",
      date: "13 Nov",
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Color palettes that will make your design pop!",
      hashtags: ["design", "uidesign", "colors", "creative"],
      likes: 215,
      comments: 34
    },
    {
      id: 4,
      username: "techguru",
      date: "12 Nov",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "The future of AI in web development",
      hashtags: ["ai", "webdev", "future", "technology"],
      likes: 176,
      comments: 28
    }
  ], []);

  const twitterPosts = useMemo(() => [
    {
      id: 1,
      username: "Dev Explorer",
      handle: "devexplorer",
      date: "15 Nov",
      content: "Just launched a new feature on our platform! Check out how we implemented real-time collaboration using WebSockets and React. #webdev #javascript #reactjs",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      likes: 123,
      retweets: 45,
      comments: 12
    },
    {
      id: 2,
      username: "Code Artist",
      handle: "codeartist",
      date: "14 Nov",
      content: "Spent the weekend refactoring our codebase. Reduced bundle size by 40% and improved load times by 2.5x. Worth every minute! 🚀\n\n#performance #optimization #javascript",
      likes: 87,
      retweets: 23,
      comments: 5
    },
    {
      id: 3,
      username: "Design Ninja",
      handle: "designninja",
      date: "13 Nov",
      content: "Design tip: Always ensure sufficient contrast between text and background. Your users' eyes will thank you! Here's a tool I use to check contrast ratios: contrast-ratio.com #a11y #uidesign #accessibility",
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      likes: 215,
      retweets: 78,
      comments: 18
    },
    {
      id: 4,
      username: "Tech Guru",
      handle: "techguru",
      date: "12 Nov",
      content: "Hot take: TypeScript isn't just about types. It's about creating a better developer experience and catching errors before they reach production. If you're not using it yet, you're missing out.",
      likes: 342,
      retweets: 112,
      comments: 43
    },
    {
      id: 5,
      username: "Frontend Wizard",
      handle: "frontendwiz",
      date: "11 Nov",
      content: "Short tweet.",
      likes: 56,
      retweets: 12,
      comments: 3
    },
    {
      id: 6,
      username: "UX Researcher",
      handle: "uxresearcher",
      date: "10 Nov",
      content: "Just finished analyzing our latest user research study. Key findings:\n\n1. Users struggle with the current navigation structure\n2. The checkout process has too many steps\n3. Mobile users often miss the search functionality\n4. Error messages need to be more descriptive\n\nNext step: Presenting these insights to the product team and brainstorming solutions. #UXResearch #UserTesting",
      likes: 189,
      retweets: 42,
      comments: 23
    },
    {
      id: 7,
      username: "AI Developer",
      handle: "aidev",
      date: "9 Nov",
      content: "Experimenting with different LLM architectures for our new NLP project. The results so far are promising!",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      likes: 231,
      retweets: 67,
      comments: 19
    },
    {
      id: 8,
      username: "Security Expert",
      handle: "securityexpert",
      date: "8 Nov",
      content: "IMPORTANT: If you're using npm packages X, Y, or Z, update immediately. Critical vulnerability discovered that could allow remote code execution. Details in the thread below. #cybersecurity #infosec",
      likes: 512,
      retweets: 328,
      comments: 47
    }
  ], []);

  // Determine which posts to display based on active tab
  const displayPosts = activeTab === "instagram" ? instagramPosts : twitterPosts;
  
  // Loading state (would be replaced with actual data fetching)
  const isLoading = false;
  const isError = false;

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
            <Tabs active={activeTab} onChange={setActiveTab} />
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
                    {instagramPosts.map((post) => (
                      <BentoCard
                        key={post.id}
                        enableTilt={false}
                        enableMagnetism={false}
                        enableBorderGlow
                        className="w-full rounded-[15px]"
                      >
                        <InstagramCard
                          image={post.image}
                          username={post.username}
                          date={post.date}
                          title={post.title}
                          hashtags={post.hashtags}
                          likes={post.likes}
                          comments={post.comments}
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
                        640: 1
                      }}
                      className="masonry-grid"
                      columnClassName="masonry-grid-column"
                    >
                      {twitterPosts.map((post) => (
                        <div key={post.id} className="masonry-card">
                          <BentoCard
                            enableTilt={false}
                            enableMagnetism={false}
                            enableBorderGlow
                            className="w-full rounded-[15px]"
                          >
                            <TwitterCard
                              username={post.username}
                              handle={post.handle}
                              date={post.date}
                              content={post.content}
                              image={post.image}
                              likes={post.likes}
                              retweets={post.retweets}
                              comments={post.comments}
                            />
                          </BentoCard>
                        </div>
                      ))}
                    </Masonry>
                  </div>
                )}
                
                {!isLoading && (
                  activeTab === "instagram" ? 
                    (instagramPosts.length === 0 && <div className="text-invert-low">No Instagram posts found.</div>) :
                    (twitterPosts.length === 0 && <div className="text-invert-low">No Twitter posts found.</div>)
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
