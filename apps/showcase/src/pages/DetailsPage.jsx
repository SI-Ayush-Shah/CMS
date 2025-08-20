import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contentApi } from "../services/contentApi";
import Loader from "../components/Loader";
import {
  FaCalendarAlt,
  FaShare,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaCopy,
  FaArrowLeft,
} from "react-icons/fa";

function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch blog content using the API
  const { 
    data: blogPost, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["blogContent", id],
    queryFn: () => contentApi.getBlogContent(id),
    enabled: !!id,
  });

  // Format date helper function
  const formatDate = (input) => {
    if (!input) return "";
    const d = new Date(input);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading post..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Failed to load post</div>
          <div className="text-gray-600 mb-4">{error?.message || "Something went wrong"}</div>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  // If no data, show not found
  if (!blogPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Post not found</div>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  // Use the API data for the current post
  const currentNews = blogPost;

  // Debug: Log the API response to see the data structure
  console.log('📄 Blog post data from API:', blogPost);
  
  // Debug: Log content structure if body exists
  if (blogPost?.body?.blocks) {
    console.log('🔍 Content blocks found:', blogPost.body.blocks.length);
    blogPost.body.blocks.forEach((block, index) => {
      console.log(`📝 Block ${index}:`, { type: block.type, id: block.id, data: block.data });
    });
  }

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = currentNews.title;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        // You could add a toast notification here
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[11px] mb-6 cursor-pointer"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to News
        </button>
        <div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Main Content */}
            <div className="overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={currentNews.coverImageUrl || currentNews.image || "https://imgs.search.brave.com/5qtRzpLD_tho5javBzbwjW8wHDrS_s1SrUDvfE2RwhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTE3/NjY5Mi5qcGc"}
                  alt="Cricket News"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="py-6 text-left">
                {/* Title */}
                <span className="text-2xl text- md:text-3xl font-bold text-gray-900 mb-4 leading-tight text-left">
                  {currentNews.title}
                </span>

                {/* Subtitle/Summary */}
                {currentNews.summary && (
                  <p className="text-lg text-gray-700 my-2 italic text-left">
                    {currentNews.summary}
                  </p>
                )}

                {/* Date and Share */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-medium">
                      {formatDate(currentNews.createdAt)}
                    </span>
                  </div>

                  {/* Share Options */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleShare("facebook")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Share on Facebook"
                      >
                        <FaFacebook className="w-4 h-4 " />
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="p-2 text-blue-400 hover:bg-blue-50 rounded-full transition-colors"
                        title="Share on Twitter"
                      >
                        <FaTwitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("whatsapp")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Share on WhatsApp"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                        title="Copy Link"
                      >
                        <FaCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="prose prose-lg max-w-none text-left">
                  {currentNews.body ? (
                    // Handle Editor.js content structure
                    currentNews.body.blocks ? (
                      currentNews.body.blocks.map((block, index) => {
                        const { id, type, data } = block;
                        
                        switch (type) {
                          case 'paragraph':
                            return (
                              <p key={id || index} className="text-gray-700 leading-relaxed mb-4 text-left">
                                {data?.text || ""}
                              </p>
                            );
                          
                          case 'header': {
                            const level = Math.min(Math.max(data?.level || 2, 1), 6);
                            const Tag = `h${level}`;
                            const headerClasses = {
                              1: "text-3xl font-bold",
                              2: "text-2xl font-bold", 
                              3: "text-xl font-bold",
                              4: "text-lg font-bold",
                              5: "text-base font-bold",
                              6: "text-sm font-bold"
                            };
                            return (
                              <Tag
                                key={id || index}
                                className={`${headerClasses[level]} text-gray-900 mb-4 text-left`}
                              >
                                {data?.text || ""}
                              </Tag>
                            );
                          }
                          
                          case 'list': {
                            const items = Array.isArray(data?.items) ? data.items : [];
                            if (data?.style === "ordered") {
                              return (
                                <ol key={id || index} className="list-decimal pl-5 space-y-1.5 mb-4">
                                  {items.map((item, idx) => (
                                    <li key={`${id || index}-${idx}`} className="text-gray-700">
                                      {item}
                                    </li>
                                  ))}
                                </ol>
                              );
                            }
                            return (
                              <ul key={id || index} className="list-disc pl-5 space-y-1.5 mb-4">
                                {items.map((item, idx) => (
                                  <li key={`${id || index}-${idx}`} className="text-gray-700">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          
                          case 'table': {
                            const content = data?.content;
                            if (!content || !Array.isArray(content)) return null;
                            
                            // Handle different table content structures
                            let tableData = content;
                            if (Array.isArray(content[0])) {
                              tableData = content;
                            } else {
                              tableData = [content];
                            }
                            
                            return (
                              <div key={id || index} className="overflow-x-auto my-4">
                                <table className="min-w-full border border-gray-300">
                                  <tbody>
                                    {tableData.map((row, rowIndex) => (
                                      <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                          <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-gray-700">
                                            {cell}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          
                          case 'code':
                            return (
                              <pre
                                key={id || index}
                                className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm overflow-auto mb-4"
                              >
                                <code className="text-gray-800">{data?.code || ""}</code>
                              </pre>
                            );
                          
                          case 'quote':
                            return (
                              <figure
                                key={id || index}
                                className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-5 bg-blue-50 rounded-r-xl py-3"
                              >
                                <blockquote className="text-lg leading-8">
                                  {data?.text}
                                </blockquote>
                                {data?.caption && (
                                  <figcaption className="text-sm text-gray-600 mt-1">
                                    {data.caption}
                                  </figcaption>
                                )}
                              </figure>
                            );
                          
                          case 'checklist': {
                            const rawItems = Array.isArray(data?.items) ? data.items : [];
                            return (
                              <ul key={id || index} className="space-y-2 mb-4">
                                {rawItems.map((item, idx) => {
                                  const text = typeof item === "string" ? item : item?.text;
                                  const checked = typeof item === "object" ? !!item?.checked : false;
                                  return (
                                    <li key={`${id || index}-${idx}`} className="flex items-start gap-3">
                                      <span
                                        className={`mt-1 inline-flex items-center justify-center w-4 h-4 rounded-full border ${
                                          checked
                                            ? "bg-blue-500 border-blue-500 text-white"
                                            : "border-gray-300 text-gray-300"
                                        }`}
                                      >
                                        {checked ? "✓" : ""}
                                      </span>
                                      <span className="text-gray-700">
                                        {text || ""}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          }
                          
                          case 'warning':
                            return (
                              <div
                                key={id || index}
                                className="rounded-lg bg-yellow-100 border border-yellow-300 p-3 my-3"
                              >
                                {data?.title && (
                                  <div className="font-medium mb-1 text-yellow-800">{data.title}</div>
                                )}
                                <div className="text-sm text-yellow-700">{data?.message}</div>
                              </div>
                            );
                          
                          case 'image': {
                            const url = typeof data?.file === "string" 
                              ? data.file 
                              : data?.file?.url || data?.url;
                            const caption = data?.caption;
                            if (!url) return null;
                            return (
                              <figure key={id || index} className="my-5">
                                <img
                                  src={url}
                                  alt={caption || "image"}
                                  className="w-full object-cover rounded-lg"
                                />
                                {caption && (
                                  <figcaption className="text-sm text-gray-600 mt-1 text-center">
                                    {caption}
                                  </figcaption>
                                )}
                              </figure>
                            );
                          }
                          
                          case 'embed': {
                            const embed = data?.embed || data?.source;
                            if (!embed) return null;
                            return (
                              <div key={id || index} className="my-4">
                                <iframe
                                  src={embed}
                                  title={data?.caption || id}
                                  className="w-full aspect-video rounded-xl border border-gray-300"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            );
                          }
                          
                          case 'linkTool': {
                            const link = data?.link || data?.url;
                            if (!link) return null;
                            return (
                              <a
                                key={id || index}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                {data?.meta?.title || link}
                              </a>
                            );
                          }
                          
                          case 'delimiter':
                            return <hr key={id || index} className="my-6 border-gray-300" />;
                          
                          default:
                            // Fallback for unknown block types
                            console.log('Unknown block type:', type, data);
                            return (
                              <div key={id || index} className="text-gray-500 text-sm mb-4 p-2 bg-gray-100 rounded">
                                <strong>Unsupported content type:</strong> {type}
                                <pre className="mt-2 text-xs overflow-auto">
                                  {JSON.stringify(data, null, 2)}
                                </pre>
                              </div>
                            );
                        }
                      })
                    ) : (
                      // Fallback to plain text content
                      <p className="text-gray-700 leading-relaxed mb-4 text-left">
                        {currentNews.body}
                      </p>
                    )
                  ) : (
                    // Fallback to content field if body doesn't exist
                    currentNews.content ? (
                      currentNews.content.split("\n\n").map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-gray-700 leading-relaxed mb-4 text-left"
                        >
                          {paragraph.includes("**")
                            ? paragraph.split("**").map((part, partIndex) =>
                                partIndex % 2 === 1 ? (
                                  <strong
                                    key={partIndex}
                                    className="font-bold text-gray-900"
                                  >
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                )
                              )
                            : paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-700 leading-relaxed mb-4 text-left">
                        Content not available
                      </p>
                    )
                  )}
                </div>

                {/* Related Tags */}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1C1C27] pt-6 border-t border-gray-200 text-left">
          {/* Related News Section */}
          <div className="max-w-4xl mx-auto px-4  pb-8">
            <h3 className="text-lg font-bold text-white mb-4">Related News</h3>
            <div className="text-center text-gray-400 py-8">
              <p>Related posts feature coming soon!</p>
              <p className="text-sm mt-2">You can browse more posts from the main news page.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetailsPage;
