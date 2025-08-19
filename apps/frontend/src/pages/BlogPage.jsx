import MagicBento, { BentoCard } from "../components/MagicBento";
import BlogCard from "../components/FigmaBlogCard";
import { useState } from "react";

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
        {/* Page Title + Tabs */}
        <section className="px-6 pt-10 pb-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white text-[28px] font-semibold mb-4">Content Hub</h1>
            <Tabs />
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
              enableMagnetism={false}
              clickEffect
              spotlightRadius={300}
              glowColor="132, 0, 255"
            >
              <div className="card-responsive grid gap-2">
                {blogPosts.slice(0, 8).map((p) => (
                  <BentoCard
                    key={p.id}
                    enableTilt={false}
                    enableMagnetism={false}
                    enableBorderGlow
                    className="w-full rounded-[15px]"
                  >
                    <BlogCard
                      image={p.image}
                      date={p.date}
                      title={p.title}
                      description={p.description}
                      onCtaClick={() => {}}
                    />
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

// Simple tabs UI to match provided design (left-aligned pills)
const Tabs = () => {
  const [active, setActive] = useState("custom");
  const base = "px-4 h-9 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  return (
    <div className="flex gap-3">
      <button
        className={`${base} ${active === "custom" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/60 text-invert-high"}`}
        onClick={() => setActive("custom")}
        type="button"
      >
        Custom drafts
      </button>
      <button
        className={`${base} ${active === "ai" ? "bg-core-prim-500 text-invert-high" : "bg-border-main-default/60 text-invert-high"}`}
        onClick={() => setActive("ai")}
        type="button"
      >
        AI drafts
      </button>
    </div>
  );
};
