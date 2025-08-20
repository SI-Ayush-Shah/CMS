import React from 'react';
import { useBlogStore, useRefinementStore } from '../store';

/**
 * Demo component to verify store functionality
 * This component demonstrates how the stores work together
 */
const StoreDemo = () => {
  const {
    currentBlog,
    isLoading,
    error,
    loadBlog,
    updateBlogContent,
    rollbackToPrevious,
    canRollback,
    getVersionCount,
    clearError
  } = useBlogStore();

  const {
    messages,
    isProcessing,
    error: refinementError,
    addUserMessage,
    addAssistantMessage,
    startRefinement,
    completeRefinement,
    getMessageCount,
    clearMessages,
    clearError: clearRefinementError
  } = useRefinementStore();

  // Demo functions
  const handleLoadDemo = async () => {
    await loadBlog('demo-blog-123');
  };

  const handleUpdateContent = () => {
    const newContent = {
      time: Date.now(),
      blocks: [
        {
          id: `block_${Date.now()}`,
          type: "paragraph",
          data: {
            text: `Updated content at ${new Date().toLocaleTimeString()}`
          }
        }
      ]
    };
    updateBlogContent(newContent);
  };

  const handleRefinement = () => {
    const prompt = "Make this content more engaging";
    startRefinement(prompt);

    // Simulate processing completion after 2 seconds
    setTimeout(() => {
      completeRefinement("Content has been made more engaging with better examples and clearer language.");

      // Also update the blog content to simulate the refinement
      if (currentBlog) {
        const refinedContent = {
          ...currentBlog.body,
          blocks: [
            ...currentBlog.body.blocks,
            {
              id: `refined_${Date.now()}`,
              type: "paragraph",
              data: {
                text: "This content has been refined to be more engaging!"
              }
            }
          ]
        };
        updateBlogContent(refinedContent);
      }
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Store Demo</h1>

      {/* Blog Store Demo */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Blog Store Demo</h2>

        <div className="mb-4">
          <button
            onClick={handleLoadDemo}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
          >
            {isLoading ? 'Loading...' : 'Load Demo Blog'}
          </button>

          <button
            onClick={handleUpdateContent}
            disabled={!currentBlog || isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
          >
            Update Content
          </button>

          <button
            onClick={rollbackToPrevious}
            disabled={!canRollback()}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Rollback ({getVersionCount() - 1} versions)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
            <button
              onClick={clearError}
              className="ml-2 text-sm underline"
            >
              Clear
            </button>
          </div>
        )}

        {currentBlog && (
          <div className="p-3 bg-gray-100 rounded">
            <h3 className="font-semibold">Current Blog:</h3>
            <p><strong>ID:</strong> {currentBlog.id}</p>
            <p><strong>Title:</strong> {currentBlog.title}</p>
            <p><strong>Blocks:</strong> {currentBlog.body?.blocks?.length || 0}</p>
            <p><strong>Can Rollback:</strong> {canRollback() ? 'Yes' : 'No'}</p>
            <p><strong>Version Count:</strong> {getVersionCount()}</p>
          </div>
        )}
      </div>

      {/* Refinement Store Demo */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Refinement Store Demo</h2>

        <div className="mb-4">
          <button
            onClick={() => addUserMessage("Hello, can you help me refine this content?")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Add User Message
          </button>

          <button
            onClick={() => addAssistantMessage("Of course! I'd be happy to help you refine your content.")}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2"
          >
            Add Assistant Message
          </button>

          <button
            onClick={handleRefinement}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
          >
            {isProcessing ? 'Processing...' : 'Start Refinement'}
          </button>

          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Messages ({getMessageCount()})
          </button>
        </div>

        {refinementError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {refinementError}
            <button
              onClick={clearRefinementError}
              className="ml-2 text-sm underline"
            >
              Clear
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            Processing refinement...
          </div>
        )}

        <div className="p-3 bg-gray-100 rounded max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Chat Messages ({getMessageCount()}):</h3>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 p-2 rounded ${message.type === 'user'
                  ? 'bg-blue-200 ml-4'
                  : 'bg-green-200 mr-4'
                  } ${message.status === 'error' ? 'border-red-500 border' : ''}`}
              >
                <div className="text-sm font-medium">
                  {message.type === 'user' ? 'You' : 'Assistant'}
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm">{message.content}</div>
                {message.status === 'error' && (
                  <div className="text-xs text-red-600 mt-1">Failed to send</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>This demo shows how the blog and refinement stores work together.</p>
        <p>Try loading a blog, updating content, and running refinements to see the state management in action.</p>
      </div>
    </div>
  );
};

export default StoreDemo;