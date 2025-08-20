import { create } from "zustand";

/**
 * Refinement Store for managing chat messages and processing status
 * Handles simple chat state without complex conversation history
 */
export const useRefinementStore = create((set, get) => ({
  // Chat state
  messages: [],
  isProcessing: false,
  error: null,
  
  // Processing status for UI feedback
  processingStatus: null, // 'refining', 'saving', 'complete', 'error'
  processingMessage: "",
  
  // Add message to chat history
  addMessage: (message) => {
    try {
      const currentMessages = get().messages || [];
      
      // Validate message structure
      if (!message || typeof message !== 'object') {
        console.error("Invalid message format");
        return;
      }
      
      const newMessage = {
        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: message.type || 'user', // 'user' | 'assistant'
        content: message.content || '',
        timestamp: message.timestamp || new Date(),
        status: message.status || 'completed' // 'completed' | 'error' | 'processing'
      };
      
      // Keep only last 10 messages for performance
      const updatedMessages = [
        ...currentMessages.slice(-9), // Keep last 9, add new as 10th
        newMessage
      ];
      
      set({ 
        messages: updatedMessages,
        error: null
      });
      
      console.log("Message added to chat:", newMessage.type, newMessage.content.substring(0, 50));
    } catch (error) {
      console.error("Failed to add message:", error);
      set({ error: "Failed to add message to chat" });
    }
  },
  
  // Add user message
  addUserMessage: (content) => {
    get().addMessage({
      type: 'user',
      content: content.trim(),
      status: 'completed'
    });
  },
  
  // Add assistant message
  addAssistantMessage: (content, status = 'completed') => {
    get().addMessage({
      type: 'assistant',
      content: content.trim(),
      status
    });
  },
  
  // Set processing state
  setProcessing: (isProcessing, status = null, message = "") => {
    set({ 
      isProcessing,
      processingStatus: status,
      processingMessage: message,
      error: isProcessing ? null : get().error // Clear error when starting processing
    });
    
    if (isProcessing) {
      console.log("Processing started:", status, message);
    } else {
      console.log("Processing completed");
    }
  },
  
  // Start refinement processing
  startRefinement: (refinementPrompt) => {
    set({
      isProcessing: true,
      processingStatus: 'refining',
      processingMessage: 'Refining content...',
      error: null
    });
    
    // Add user message to chat
    get().addUserMessage(refinementPrompt);
    
    console.log("Refinement started with prompt:", refinementPrompt.substring(0, 100));
  },
  
  // Complete refinement processing
  completeRefinement: (responseMessage = "Content refined successfully") => {
    set({
      isProcessing: false,
      processingStatus: 'complete',
      processingMessage: '',
      error: null
    });
    
    // Add assistant response to chat
    get().addAssistantMessage(responseMessage, 'completed');
    
    console.log("Refinement completed successfully");
  },
  
  // Handle refinement error
  failRefinement: (errorMessage = "Refinement failed") => {
    set({
      isProcessing: false,
      processingStatus: 'error',
      processingMessage: '',
      error: errorMessage
    });
    
    // Add error message to chat
    get().addAssistantMessage(`Error: ${errorMessage}`, 'error');
    
    console.error("Refinement failed:", errorMessage);
  },
  
  // Set error state
  setError: (error) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
    
    set({ 
      error: errorMessage,
      isProcessing: false,
      processingStatus: 'error'
    });
    
    console.error("Refinement store error:", errorMessage);
  },
  
  // Clear error state
  clearError: () => {
    set({ 
      error: null,
      processingStatus: get().processingStatus === 'error' ? null : get().processingStatus
    });
  },
  
  // Clear all messages
  clearMessages: () => {
    set({ 
      messages: [],
      error: null,
      processingStatus: null,
      processingMessage: ''
    });
    
    console.log("Chat messages cleared");
  },
  
  // Reset entire store state
  reset: () => {
    set({
      messages: [],
      isProcessing: false,
      error: null,
      processingStatus: null,
      processingMessage: ''
    });
    
    console.log("Refinement store reset");
  },
  
  // Get last message for UI display
  getLastMessage: () => {
    const messages = get().messages;
    return messages && messages.length > 0 ? messages[messages.length - 1] : null;
  },
  
  // Get message count for UI display
  getMessageCount: () => {
    return get().messages?.length || 0;
  },
  
  // Check if there are any error messages
  hasErrorMessages: () => {
    const messages = get().messages || [];
    return messages.some(msg => msg.status === 'error');
  },
  
  // Get processing state for UI
  getProcessingState: () => {
    const { isProcessing, processingStatus, processingMessage } = get();
    return {
      isProcessing,
      status: processingStatus,
      message: processingMessage
    };
  },
  
  // Update message status (for retry functionality)
  updateMessageStatus: (messageId, newStatus) => {
    const messages = get().messages || [];
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, status: newStatus } : msg
    );
    
    set({ messages: updatedMessages });
    console.log("Message status updated:", messageId, newStatus);
  }
}));