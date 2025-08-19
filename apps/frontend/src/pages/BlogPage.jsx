import MagicBento, { BentoCard } from "../components/MagicBento";

// Using MagicBento for cards

const BlogPage = () => {
  // Sample blog data - in a real app, this would come from an API
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with React 19",
      description: "Learn about the latest features and improvements in React 19, including concurrent rendering and new hooks.",
      category: "React",
      date: "Dec 15, 2024",
      author: "John Doe",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 2,
      title: "Modern CSS Grid Layouts",
      description: "Master CSS Grid with practical examples and real-world use cases for responsive web design.",
      category: "CSS",
      date: "Dec 12, 2024",
      author: "Jane Smith",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 3,
      title: "JavaScript Performance Optimization",
      description: "Techniques and best practices for optimizing JavaScript performance in modern web applications.",
      category: "JavaScript",
      date: "Dec 10, 2024",
      author: "Mike Johnson",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 4,
      title: "Building Accessible Web Components",
      description: "Learn how to create inclusive web components that work for everyone, following WCAG guidelines.",
      category: "Accessibility",
      date: "Dec 8, 2024",
      author: "Sarah Wilson",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 5,
      title: "State Management with Zustand",
      description: "A comprehensive guide to managing application state using Zustand in React applications.",
      category: "State Management",
      date: "Dec 5, 2024",
      author: "Tom Brown",
      readTime: "15 min read",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 6,
      title: "TypeScript Best Practices",
      description: "Advanced TypeScript patterns and best practices for building scalable applications.",
      category: "TypeScript",
      date: "Dec 3, 2024",
      author: "Alex Chen",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 7,
      title: "Progressive Web Apps Guide",
      description: "Build fast, reliable, and engaging web apps with Progressive Web App technologies.",
      category: "PWA",
      date: "Nov 30, 2024",
      author: "Lisa Garcia",
      readTime: "20 min read",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop&crop=faces"
    },
    {
      id: 8,
      title: "Advanced React Patterns",
      description: "Explore advanced React patterns including render props, compound components, and custom hooks.",
      category: "React",
      date: "Nov 28, 2024",
      author: "David Lee",
      readTime: "18 min read",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop&crop=faces"
    }
  ];

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div 
        className="min-h-screen"
      >
        {/* Header Section */}
        <section className="py-16 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-white mb-4"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "3rem",
                fontWeight: "700",
                marginBottom: "1rem"
              }}
            >
              Latest Articles
            </h1>
            <p 
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.125rem",
                color: "#a2a2a2",
                maxWidth: "600px",
                margin: "0 auto"
              }}
            >
              Discover insights, tutorials, and stories from the world of technology and development.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid via MagicBento + BentoCard (Figma DOM inside) */}
        <section className="pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <MagicBento
              textAutoHide
              enableStars={false}
              enableSpotlight
              enableBorderGlow
              enableTilt={false}
              enableMagnetism
              clickEffect
              spotlightRadius={300}
              glowColor="132, 0, 255"
            >
              <div className="card-responsive grid gap-2">
                {blogPosts.map((p) => (
                  <BentoCard
                    key={p.id}
                    enableTilt={false}
                    enableMagnetism
                    enableBorderGlow
                  >
                    {/* Figma-styled card content */}
                    <div className="inline-grid leading-[0] place-items-start relative shrink-0" style={{ gridColumns: "max-content", gridRows: "max-content" }}>
                      <div className="overflow-clip relative" style={{ gridArea: "1 / 1", height: "200px", width: "100%", borderRadius: "10px" }}>
                        <img src={p.image} alt={p.title} className="absolute rounded-[10px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-105" style={{ height: "206px", width: "100%" }} />
                      </div>
                      <div className="flex flex-col gap-4 items-start justify-start relative" style={{ gridArea: "1 / 1", marginTop: "200px", padding: "12px", width: "100%" }}>
                        <div className="flex flex-col gap-3 items-center justify-start leading-[0] relative shrink-0 w-full" style={{ height: "149px" }}>
                          <div className="flex flex-col justify-center text-white text-[12px] w-full">
                            <p className="block" style={{ fontFamily: "'Poppins', sans-serif", lineHeight: "1.36", margin: 0 }}>{p.date}</p>
                          </div>
                          <div className="flex flex-col justify-center text-white text-[16px] w-full">
                            <h3 className="block transition-colors duration-200" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, lineHeight: "20px", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</h3>
                          </div>
                          <div className="text-[14px] w-full" style={{ color: "#a2a2a2" }}>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", lineHeight: "20px", margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center justify-start">
                          <button className="transition-all duration-200 hover:shadow-lg hover:scale-105" style={{ background: "#641ea7", borderRadius: 8, padding: "8px 16px", border: "none", cursor: "pointer" }}>
                            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>Read more</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            </MagicBento>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPage;
