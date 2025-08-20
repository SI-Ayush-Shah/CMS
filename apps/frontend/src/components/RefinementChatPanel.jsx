import React, { useState, useRef, useEffect } from "react";
import { useBlogStore } from "../store/blogStore";
import { useRefinementStore } from "../store/refinementStore";
import { contentApi } from "../services/contentApi";
import { Button } from "./Button";
import LoadingIndicator from "./LoadingIndicator";

// Hardcoded array of predefined refinement actions
const QUICK_ACTIONS = [
    {
        id: 'shorten',
        label: 'Make it shorter',
        prompt: 'Make this content more concise and remove unnecessary details',
        icon: '✂️'
    },
    {
        id: 'expand',
        label: 'Add more details',
        prompt: 'Add more details and examples to make this content more comprehensive',
        icon: '📝'
    },
    {
        id: 'readability',
        label: 'Improve readability',
        prompt: 'Improve the readability and flow of this content',
        icon: '📖'
    },
    {
        id: 'grammar',
        label: 'Fix grammar',
        prompt: 'Fix any grammar, spelling, and punctuation errors',
        icon: '✏️'
    },
    {
        id: 'engaging',
        label: 'Make it more engaging',
        prompt: 'Make this content more engaging and interesting to read',
        icon: '✨'
    }
];

/**
 * RefinementChatPanel - Chat interface for content refinement
 * 
 * Features:
 * - Simple chat input for refinement requests
 * - Quick action buttons for common refinements
 * - Fast processing with loading indicators
 * - Rollback functionality with confirmation
 * - Responsive design for mobile/desktop
 */
export default function RefinementChatPanel({ blogId, disabled = false }) {
    // Store hooks
    const {
        currentBlog,
        updateBlogContent,
        rollbackToPrevious,
        canRollback,
        saveBlogContent
    } = useBlogStore();

    const {
        messages,
        isProcessing,
        error,
        addUserMessage,
        addAssistantMessage,
        startRefinement,
        completeRefinement,
        failRefinement,
        clearError,
        getProcessingState
    } = useRefinementStore();

    // Local state
    const [inputValue, setInputValue] = useState("");
    const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);
    const [lastFailedRefinement, setLastFailedRefinement] = useState(null);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when component mounts and handle keyboard navigation
    useEffect(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [disabled]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Escape key to clear input or close modals
            if (event.key === 'Escape') {
                if (showRollbackConfirm) {
                    cancelRollback();
                } else if (inputValue.trim()) {
                    setInputValue("");
                } else if (error) {
                    handleClearError();
                }
                return;
            }

            // Ctrl/Cmd + Enter to submit
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                if (inputValue.trim() && !isProcessing && !disabled) {
                    handleSubmit(event);
                }
                return;
            }

            // Arrow keys for quick actions when input is focused and empty
            if (inputRef.current === document.activeElement && !inputValue.trim()) {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    const quickActionButtons = document.querySelectorAll('[data-quick-action]');
                    if (quickActionButtons.length > 0) {
                        const currentIndex = Array.from(quickActionButtons).findIndex(btn => btn === document.activeElement);
                        let nextIndex;

                        if (event.key === 'ArrowDown') {
                            nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % quickActionButtons.length;
                        } else {
                            nextIndex = currentIndex <= 0 ? quickActionButtons.length - 1 : currentIndex - 1;
                        }

                        quickActionButtons[nextIndex].focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [inputValue, showRollbackConfirm, error, isProcessing, disabled, handleSubmit, cancelRollback, handleClearError]);

    // Handle refinement request with real-time updates
    const handleRefinement = async (refinementPrompt, refinementType = 'custom') => {
        if (!blogId || !currentBlog || !refinementPrompt.trim()) {
            return;
        }

        try {
            // Start refinement process
            startRefinement(refinementPrompt);

            // Call refinement API
            const response = await contentApi.refineContent(
                blogId,
                refinementPrompt.trim(),
                refinementType
            );

            if (response.success && response.data?.updatedBody) {
                // Update blog content in store (real-time UI update)
                updateBlogContent(response.data.updatedBody);

                // Save to backend with error handling
                try {
                    await saveBlogContent();

                    // Complete refinement with success message
                    completeRefinement(response.data.message || "Content refined and saved successfully");

                    console.log("Refinement completed and saved successfully");
                } catch (saveError) {
                    console.error("Failed to save refined content:", saveError);

                    // Content was refined but save failed - show warning
                    completeRefinement("Content refined but failed to save. Changes are visible but may not persist.");

                    // Add error message to chat
                    addAssistantMessage(`Warning: ${saveError.message || "Failed to save changes"}`, 'error');
                }
            } else {
                throw new Error("Invalid response from refinement API");
            }
        } catch (error) {
            console.error("Refinement failed:", error);

            // Store failed refinement for retry
            setLastFailedRefinement({ prompt: refinementPrompt, type: refinementType });

            failRefinement(error.message || "Refinement failed. Please try again.");
        }
    };

    // Handle text input submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!inputValue.trim() || isProcessing || disabled) {
            return;
        }

        const prompt = inputValue.trim();
        setInputValue(""); // Clear input immediately

        await handleRefinement(prompt, 'custom');
    };

    // Handle quick action click
    const handleQuickAction = async (action) => {
        if (isProcessing || disabled) {
            return;
        }

        console.log("Quick action triggered:", action.label);
        await handleRefinement(action.prompt, action.id);
    };

    // Handle rollback with confirmation
    const handleRollback = () => {
        if (!canRollback()) {
            return;
        }

        setShowRollbackConfirm(true);
    };

    // Confirm rollback with real-time updates
    const confirmRollback = async () => {
        try {
            // Show processing state
            startRefinement("Rolling back to previous version...");

            const success = await rollbackToPrevious();

            if (success) {
                // Add rollback message to chat
                completeRefinement("Content rolled back to previous version successfully");

                console.log("Rollback completed successfully");
            } else {
                failRefinement("Failed to rollback content");
            }
        } catch (error) {
            console.error("Rollback failed:", error);
            failRefinement("Rollback failed: " + error.message);
        } finally {
            setShowRollbackConfirm(false);
        }
    };

    // Cancel rollback
    const cancelRollback = () => {
        setShowRollbackConfirm(false);
    };

    // Clear error
    const handleClearError = () => {
        clearError();
        setLastFailedRefinement(null);
    };

    // Retry last failed refinement
    const handleRetryRefinement = async () => {
        if (!lastFailedRefinement) return;

        const { prompt, type } = lastFailedRefinement;
        setLastFailedRefinement(null);

        await handleRefinement(prompt, type);
    };

    // Get processing state for UI
    const processingState = getProcessingState();

    return (
        <div
            className="h-full flex flex-col bg-core-neu-1000/40 border border-core-prim-300/20 rounded-2xl"
            role="region"
            aria-label="Content refinement chat interface"
        >
            {/* Screen reader announcements */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {isProcessing && processingState.message}
                {error && `Error: ${error}`}
            </div>
            {/* Header - improved mobile layout */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-core-prim-300/20">
                <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] sm:text-[16px] font-semibold text-invert-high truncate">
                        Content Refinement
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <p className="text-[11px] sm:text-[12px] text-invert-low">
                            Chat with AI to improve your content
                        </p>
                        {/* Version indicator - mobile responsive */}
                        <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] text-core-prim-400 bg-core-prim-400/10 px-1.5 sm:px-2 py-0.5 rounded">
                                v{useBlogStore.getState().getVersionCount()}
                            </span>
                            {canRollback() && (
                                <span className="text-[9px] sm:text-[10px] text-warning-400 bg-warning-400/10 px-1.5 sm:px-2 py-0.5 rounded">
                                    {useBlogStore.getState().previousVersions?.length || 0} rollback{(useBlogStore.getState().previousVersions?.length || 0) !== 1 ? 's' : ''} available
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rollback button - improved mobile touch target */}
                {canRollback() && (
                    <Button
                        variant="outline"
                        onClick={handleRollback}
                        disabled={disabled || isProcessing}
                        className="text-xs px-3 py-2 ml-2 min-h-[44px] sm:min-h-auto sm:px-2 sm:py-1"
                    >
                        <span className="hidden sm:inline">↶ Rollback</span>
                        <span className="sm:hidden">↶</span>
                    </Button>
                )}
            </div>

            {/* Quick Actions - improved mobile touch targets */}
            <div className="p-3 sm:p-4 border-b border-core-prim-300/20">
                <p className="text-[11px] sm:text-[12px] text-invert-low mb-2">Quick Actions</p>
                <div className="grid grid-cols-1 gap-2">
                    {QUICK_ACTIONS.map((action, index) => (
                        <Button
                            key={action.id}
                            variant="outline"
                            onClick={() => handleQuickAction(action)}
                            disabled={disabled || isProcessing}
                            className="text-left text-xs sm:text-sm px-3 py-3 sm:py-2 justify-start min-h-[44px] sm:min-h-auto"
                            data-quick-action={action.id}
                            aria-label={`Quick action: ${action.label}`}
                            tabIndex={0}
                        >
                            <span className="mr-2 text-sm" aria-hidden="true">{action.icon}</span>
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chat Messages - improved mobile scrolling and accessibility */}
            <div
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
                role="log"
                aria-label="Chat conversation"
                aria-live="polite"
            >
                {messages.length === 0 && (
                    <div className="text-center text-invert-low text-[11px] sm:text-[12px] py-6 sm:py-8">
                        <p>Start a conversation to refine your content.</p>
                        <p className="mt-1">Use quick actions above or type your own request.</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        role="article"
                        aria-label={`${message.type === 'user' ? 'Your message' : 'AI response'} at ${new Date(message.timestamp).toLocaleTimeString()}`}
                    >
                        <div
                            className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 rounded-lg text-[11px] sm:text-[12px] ${message.type === 'user'
                                ? 'bg-core-prim-400 text-white'
                                : message.status === 'error'
                                    ? 'bg-error-500/10 border border-error-500/20 text-error-400'
                                    : 'bg-core-neu-800/40 text-invert-medium'
                                }`}
                        >
                            <p>{message.content}</p>
                            <p className="text-[10px] opacity-70 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-core-neu-800/40 text-invert-medium px-3 py-2 rounded-lg text-[12px]">
                            <LoadingIndicator
                                size="sm"
                                message={processingState.message || "Processing..."}
                            />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 border-t border-core-prim-300/20">
                    <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-error-400 text-[12px] font-medium">Error</p>
                                <p className="text-error-400 text-[11px] mt-1">{error}</p>
                                {lastFailedRefinement && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleRetryRefinement}
                                            disabled={isProcessing}
                                            className="text-error-400 text-[10px] px-2 py-1 border-error-400/20 hover:bg-error-400/10"
                                        >
                                            🔄 Retry
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                onClick={handleClearError}
                                className="text-error-400 text-[10px] px-2 py-1"
                            >
                                ✕
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Input - improved mobile touch targets and accessibility */}
            <div className="p-3 sm:p-4 border-t border-core-prim-300/20">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={disabled ? "Load content to start refining..." : "Type your refinement request..."}
                        disabled={disabled || isProcessing}
                        className="flex-1 px-3 py-3 sm:py-2 text-[12px] sm:text-[13px] bg-core-neu-800/40 border border-core-prim-300/20 rounded-lg text-invert-medium placeholder-invert-low focus:outline-none focus:border-core-prim-400 focus:ring-2 focus:ring-core-prim-400/20 disabled:opacity-50 min-h-[44px] sm:min-h-auto"
                        aria-label="Refinement request input"
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        variant="solid"
                        disabled={disabled || isProcessing || !inputValue.trim()}
                        className="px-4 py-3 sm:py-2 text-[12px] sm:text-[13px] min-h-[44px] sm:min-h-auto"
                        aria-label="Send refinement request"
                    >
                        {isProcessing ? "..." : "Send"}
                    </Button>
                </form>
            </div>

            {/* Rollback Confirmation Modal - improved accessibility and mobile */}
            {showRollbackConfirm && (
                <div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="rollback-title"
                    aria-describedby="rollback-description"
                >
                    <div className="bg-core-neu-1000 border border-core-prim-300/20 rounded-lg p-4 sm:p-6 max-w-sm mx-4 w-full">
                        <h4
                            id="rollback-title"
                            className="text-[14px] sm:text-[16px] font-semibold text-invert-high mb-2"
                        >
                            Confirm Rollback
                        </h4>
                        <p
                            id="rollback-description"
                            className="text-[12px] sm:text-[13px] text-invert-medium mb-4"
                        >
                            Are you sure you want to rollback to the previous version? This will undo your latest changes.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={cancelRollback}
                                className="text-[12px] sm:text-[13px] px-4 py-2 min-h-[44px] sm:min-h-auto sm:px-3 sm:py-1"
                                autoFocus
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                onClick={confirmRollback}
                                className="text-[12px] sm:text-[13px] px-4 py-2 min-h-[44px] sm:min-h-auto sm:px-3 sm:py-1 bg-warning-500 hover:bg-warning-600"
                            >
                                Rollback
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}