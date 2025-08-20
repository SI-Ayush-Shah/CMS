import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlogStore } from "../store/blogStore";
import { useRefinementStore } from "../store/refinementStore";
import EditorJsRenderer from "../components/EditorJsRenderer";
import RefinementChatPanel from "../components/RefinementChatPanel";
import { Button } from "../components/Button";
import LoadingIndicator from "../components/LoadingIndicator";
import SimpleErrorDisplay from "../components/SimpleErrorDisplay";

/**
 * EditorPage - Main editor page with integrated chat interface for content refinement
 * 
 * Features:
 * - Loads blog content from URL params (blogId)
 * - Displays content using EditorJsRenderer
 * - Provides chat interface for content refinement
 * - Responsive layout with content area and right sidebar
 * - Comprehensive error handling for missing/invalid blog IDs
 */
export default function EditorPage() {
    const { blogId } = useParams();
    const navigate = useNavigate();

    // Store hooks
    const {
        currentBlog,
        isLoading,
        error,
        loadBlog,
        clearError,
        canRollback,
        getVersionCount
    } = useBlogStore();

    const {
        reset: resetRefinement
    } = useRefinementStore();

    // Local state
    const [hasLoadAttempted, setHasLoadAttempted] = useState(false);
    const [lastContentUpdate, setLastContentUpdate] = useState(null);

    // Load blog content on mount or blogId change
    useEffect(() => {
        if (!blogId) {
            console.error("No blog ID provided in URL");
            return;
        }

        // Validate blogId format (basic validation)
        if (typeof blogId !== 'string' || blogId.trim().length === 0) {
            console.error("Invalid blog ID format:", blogId);
            return;
        }

        // Load blog content
        const loadBlogContent = async () => {
            try {
                setHasLoadAttempted(true);
                clearError(); // Clear any previous errors
                resetRefinement(); // Reset chat state for new blog

                console.log("Loading blog content for ID:", blogId);
                await loadBlog(blogId);
            } catch (error) {
                console.error("Failed to load blog in EditorPage:", error);
            }
        };

        loadBlogContent();
    }, [blogId, loadBlog, clearError, resetRefinement]);

    // Track content updates for real-time synchronization
    useEffect(() => {
        if (currentBlog?.updatedAt && currentBlog.updatedAt !== lastContentUpdate) {
            setLastContentUpdate(currentBlog.updatedAt);
            console.log("Content updated in real-time:", new Date(currentBlog.updatedAt).toLocaleTimeString());
        }
    }, [currentBlog?.updatedAt, lastContentUpdate]);

    // Handle navigation back to content hub
    const handleBackToHub = () => {
        navigate('/content-hub');
    };

    // Handle navigation to home
    const handleGoHome = () => {
        navigate('/');
    };

    // Retry loading blog content
    const handleRetryLoad = async () => {
        if (!blogId) return;

        try {
            clearError();
            console.log("Retrying blog load for ID:", blogId);
            await loadBlog(blogId);
        } catch (error) {
            console.error("Retry failed:", error);
        }
    };

    // Render loading state
    if (isLoading && !hasLoadAttempted) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <LoadingIndicator message="Loading editor..." />
            </div>
        );
    }

    // Render error state for missing blogId
    if (!blogId) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <SimpleErrorDisplay
                    title="Missing Blog ID"
                    message="No blog ID was provided in the URL. Please navigate to a specific blog to edit."
                    actionLabel="Go to Content Hub"
                    onAction={handleBackToHub}
                    secondaryActionLabel="Go Home"
                    onSecondaryAction={handleGoHome}
                />
            </div>
        );
    }

    // Render error state for failed load
    if (error && hasLoadAttempted) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <SimpleErrorDisplay
                    title="Failed to Load Blog"
                    message={error}
                    actionLabel="Retry"
                    onAction={handleRetryLoad}
                    secondaryActionLabel="Back to Content Hub"
                    onSecondaryAction={handleBackToHub}
                />
            </div>
        );
    }

    // Render loading state during blog load
    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <LoadingIndicator message="Loading blog content..." />
            </div>
        );
    }

    // Render error state for missing blog content
    if (!currentBlog && hasLoadAttempted) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <SimpleErrorDisplay
                    title="Blog Not Found"
                    message={`Blog with ID "${blogId}" could not be found. It may have been deleted or the ID is incorrect.`}
                    actionLabel="Back to Content Hub"
                    onAction={handleBackToHub}
                    secondaryActionLabel="Go Home"
                    onSecondaryAction={handleGoHome}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            {/* Header with blog info and actions - improved mobile layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 rounded-2xl border border-core-prim-300/20 bg-core-neu-1000/40 px-3 sm:px-4 py-3 gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                    <Button
                        variant="outline"
                        onClick={handleBackToHub}
                        className="text-sm px-3 py-2 min-h-[44px] sm:min-h-auto sm:px-4 sm:py-2 self-start"
                        aria-label="Back to content hub"
                    >
                        <span className="sm:hidden">← Hub</span>
                        <span className="hidden sm:inline">← Back to Hub</span>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div className="text-[18px] sm:text-[20px] font-semibold text-invert-high truncate">
                            Content Editor
                        </div>
                        <div className="text-[11px] sm:text-[12px] text-invert-low">
                            <span className="block sm:inline">Blog ID: {blogId}</span>
                            <span className="block sm:inline sm:ml-2">• Version {getVersionCount()}</span>
                            {canRollback() && (
                                <span className="block sm:inline sm:ml-2 text-core-prim-400">• Rollback Available</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-right sm:text-left">
                    {/* Processing indicator */}
                    {useRefinementStore.getState().isProcessing && (
                        <div className="flex items-center justify-end sm:justify-start gap-1 text-[11px] sm:text-[12px] text-core-prim-400">
                            <div className="w-2 h-2 bg-core-prim-400 rounded-full animate-pulse"></div>
                            <span className="hidden sm:inline">Processing...</span>
                            <span className="sm:hidden">Processing</span>
                        </div>
                    )}

                    <div className="text-[11px] sm:text-[12px] text-invert-low">
                        {currentBlog?.updatedAt && (
                            <>
                                <span className="hidden sm:inline">Last updated: </span>
                                <span className="sm:hidden">Updated: </span>
                                {new Date(currentBlog.updatedAt).toLocaleTimeString()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content area with responsive layout - improved mobile experience */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                {/* Content display area - improved mobile scrolling */}
                <section className="lg:col-span-2 space-y-3 sm:space-y-5 overflow-y-auto px-2 sm:px-0">
                    {/* Blog metadata */}
                    {currentBlog && (
                        <>
                            {/* Banner image */}
                            {currentBlog.bannerUrl && (
                                <div>
                                    <p className="text-xs text-invert-low mb-2">Banner Image</p>
                                    <div className="relative w-full overflow-hidden rounded-2xl border border-core-prim-300/20">
                                        <img
                                            src={currentBlog.bannerUrl}
                                            alt="Blog banner"
                                            className="w-full aspect-[16/10] object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <p className="text-xs text-invert-low mb-2">Title</p>
                                <h1 className="font-semibold text-invert-high text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] leading-7 sm:leading-8 break-words">
                                    {currentBlog.title}
                                </h1>
                            </div>

                            {/* Summary */}
                            {currentBlog.summary && (
                                <div>
                                    <p className="text-xs text-invert-low mb-2">Summary</p>
                                    <p className="text-main-medium text-[13px] sm:text-[14px] leading-6 break-words">
                                        {currentBlog.summary}
                                    </p>
                                </div>
                            )}

                            {/* Category and Tags - improved mobile layout */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                                {currentBlog.category && (
                                    <div>
                                        <p className="text-xs text-invert-low mb-1">Category</p>
                                        <span className="inline-block px-2 py-1 text-xs bg-core-prim-400/10 text-core-prim-400 rounded">
                                            {currentBlog.category}
                                        </span>
                                    </div>
                                )}

                                {currentBlog.tags && currentBlog.tags.length > 0 && (
                                    <div className="flex-1">
                                        <p className="text-xs text-invert-low mb-1">Tags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {currentBlog.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-1 text-xs bg-core-neu-800/40 text-invert-medium rounded break-all"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content body - improved mobile readability */}
                            <div>
                                <p className="text-xs text-invert-low mb-2">Content</p>
                                <div className="prose prose-invert prose-sm sm:prose max-w-none break-words">
                                    <EditorJsRenderer data={currentBlog.body} />
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Right sidebar with chat interface - mobile optimization */}
                <section className="lg:col-span-1 min-h-[400px] lg:min-h-0">
                    <RefinementChatPanel
                        blogId={blogId}
                        disabled={!currentBlog || isLoading}
                    />
                </section>
            </div>
        </div>
    );
}