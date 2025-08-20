import { useState } from "react";
import { Button } from "../components/Button";
import { IoMdClose } from "react-icons/io";
import { IoChevronDownOutline } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/axiosConfig";
import Loader from "../components/Loader";

// API functions
const fetchRssFeeds = async () => {
  const response = await apiClient.get("/content-studio/api/rss-feeds/");
  return response.data.data; // Updated to match new response structure
};

const createRssFeed = async (feedData) => {
  const response = await apiClient.post("/content-studio/api/rss-feeds/", feedData);
  return response.data.data;
};

const updateRssFeed = async ({ id, data }) => {
  const response = await apiClient.put(`/content-studio/api/rss-feeds/${id}`, data);
  return response.data.data;
};

// Helper function to format update interval
const formatUpdateInterval = (interval) => {
  if (!interval) return "";
  
  // Convert format like "30_minutes" to "30 minutes"
  return interval.replace('_', ' ');
};

// CSS for modal animations
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

const FeedManagerPage = () => {
  const queryClient = useQueryClient();
  
  // State for tracking which row is being edited and the edited values
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    feedName: "",
    feedSourceUrl: "",
    updateInterval: "",
    isActive: false
  });
  
  // Fetch RSS feeds with TanStack Query
  const { 
    data: feedsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['rssFeeds'],
    queryFn: fetchRssFeeds
  });
  
  // Create mutation for adding new feeds
  const createFeedMutation = useMutation({
    mutationFn: createRssFeed,
    onSuccess: () => {
      // Invalidate and refetch feeds after successful creation
      queryClient.invalidateQueries({ queryKey: ['rssFeeds'] });
      setIsModalOpen(false);
      // Reset form
      setFormData({
        feedName: "",
        sourceUrl: "",
        updateInterval: ""
      });
    },
    onError: (error) => {
      console.error("Error creating feed:", error);
      // You could add error handling here, such as showing an error message
    }
  });
  
  // Toggle feed status mutation
  const toggleFeedStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await apiClient.put(`/content-studio/api/rss-feeds/${id}`, {
        isActive: isActive
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rssFeeds'] });
    },
    onError: (error) => {
      console.error("Error updating feed status:", error);
      alert("Failed to update feed status. Please try again.");
    }
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    feedName: "",
    sourceUrl: "",
    updateInterval: ""
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleIntervalSelect = (value) => {
    // Value is already in API format, no need to convert
    setFormData({
      ...formData,
      updateInterval: value
    });
    setIsDropdownOpen(false);
  };
  
  const handleSubmit = () => {
    // Create feed data object from form with exact payload format
    const payload = {
      feedName: formData.feedName,
      feedSourceUrl: formData.sourceUrl,
      updateInterval: formData.updateInterval,
      isActive: false // Set to false as specified in the requirement
    };
    
    // Submit to API using mutation
    createFeedMutation.mutate(payload);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  



  
  // Toggle feed status function
  const toggleFeedStatus = (id) => {
    const feed = feeds.find(f => f.id === id);
    if (feed) {
      toggleFeedStatusMutation.mutate({ 
        id, 
        isActive: !feed.isActive 
      });
    }
  };
  
  // Delete feed mutation
  const deleteFeedMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/content-studio/api/rss-feeds/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rssFeeds'] });
    },
    onError: (error) => {
      console.error("Error deleting feed:", error);
      alert("Failed to delete feed. Please try again.");
    }
  });

  // Update feed mutation
  const updateFeedMutation = useMutation({
    mutationFn: updateRssFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rssFeeds'] });
      setEditingId(null); // Exit edit mode after successful update
    },
    onError: (error) => {
      console.error("Error updating feed:", error);
    }
  });

  // Start editing a feed
  const startEditing = (feed) => {
    setEditingId(feed.id);
    setEditFormData({
      feedName: feed.feedName,
      feedSourceUrl: feed.feedSourceUrl,
      updateInterval: feed.updateInterval,
      isActive: feed.isActive
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
  };

  // Handle changes in the edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle toggle for isActive in edit mode
  const handleEditToggleChange = () => {
    setEditFormData({
      ...editFormData,
      isActive: !editFormData.isActive
    });
  };

  // Submit the edited feed
  const submitEditedFeed = (id) => {
    updateFeedMutation.mutate({
      id,
      data: editFormData
    });
  };

  // Delete feed
  const deleteFeed = (id) => {
    if (confirm('Are you sure you want to delete this feed?')) {
      deleteFeedMutation.mutate(id);
    }
  };
  
  // Process the feeds data from API
  const feeds = feedsData?.items || [];
  
  // Fallback data for development/testing when API returns empty
  const mockFeeds = [
    {
      id: "52518e3f-1f9b-4184-9bd9-e1f2520b30bc",
      feedName: "TOI",
      feedSourceUrl: "https://timesofindia.indiatimes.com/rssfeeds/54829575.cms",
      updateInterval: "30_minutes",
      isActive: true,
      createdAt: "2025-08-19T18:50:42.468Z",
      updatedAt: "2025-08-19T18:50:42.468Z"
    },
    {
      id: "5e54e95d-6c32-4ed2-bbdb-8872d91e18cd",
      feedName: "NDTV",
      feedSourceUrl: "https://sports.ndtv.com/rss/all",
      updateInterval: "15_minutes",
      isActive: false,
      createdAt: "2025-08-19T17:49:04.408Z",
      updatedAt: "2025-08-19T17:49:04.408Z"
    }
  ];



  // Use feeds from API or fallback to mock data if empty
  const displayFeeds = feeds.length > 0 ? feeds : (isLoading ? [] : mockFeeds);
  
  // Calculate pagination
  const totalPages = Math.ceil(displayFeeds.length / rowsPerPage);
  const paginatedFeeds = displayFeeds.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen">
      {/* Add style tag for animations */}
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
      
      {/* Header with title and create button */}
      <div className=" py-3 px-6 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h1 className="text-purple-300 text-2xl font-medium">Feed Manager</h1>
        </div>
        <button 
          className="bg-[#1E1133] hover:bg-purple-900 text-white rounded-lg py-1.5 px-4 flex items-center gap-1.5 text-sm font-medium transition-colors border border-purple-800"
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Create
        </button>
      </div>
      
      <div className="p-6 max-w-7xl mx-auto">
        

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader text="Loading feeds..." size={180} minHeight={200} />
          </div>
        ) : isError ? (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 my-4 text-center">
            <p className="text-red-300">
              Error loading feeds: {error?.message || "Failed to load feeds"}
            </p>
            <button 
              className="mt-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['rssFeeds'] })}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full border-collapse">
              {/* Table header */}
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Feed Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Source URL</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Update Interval</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              {/* Table body */}
              <tbody>
                {paginatedFeeds.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No feeds found. Add your first feed by clicking the Create button.
                    </td>
                  </tr>
                ) : (
                  paginatedFeeds.map((feed) => (
                    <tr key={feed.id} className={`border-b border-gray-800 ${editingId === feed.id ? 'bg-gray-900/50' : 'hover:bg-gray-900/30'}`}>
                      <td className="py-4 px-4 text-white">
                        {editingId === feed.id ? (
                          <input
                            type="text"
                            name="feedName"
                            value={editFormData.feedName}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-1.5 bg-[#1A1625] border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          feed.feedName
                        )}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {editingId === feed.id ? (
                          <input
                            type="text"
                            name="feedSourceUrl"
                            value={editFormData.feedSourceUrl}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-1.5 bg-[#1A1625] border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
                          />
                        ) : (
                          feed.feedSourceUrl
                        )}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {editingId === feed.id ? (
                          <select
                            name="updateInterval"
                            value={editFormData.updateInterval}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-1.5 bg-[#1A1625] border border-gray-700 rounded-md text-white focus:outline-none focus:border-purple-500"
                          >
                            {["5_minutes", "15_minutes", "30_minutes", "1_hour", "6_hours", "12_hours", "24_hours"].map((interval) => (
                              <option key={interval} value={interval}>
                                {formatUpdateInterval(interval)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          formatUpdateInterval(feed.updateInterval)
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="relative inline-block w-12 align-middle select-none">
                          {editingId === feed.id ? (
                            <div 
                              onClick={handleEditToggleChange}
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${editFormData.isActive ? 'bg-green-500' : 'bg-gray-600'}`}
                            >
                              <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in ${editFormData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </div>
                          ) : (
                            <>
                              {toggleFeedStatusMutation.isPending && toggleFeedStatusMutation.variables?.id === feed.id ? (
                                <div className="flex items-center justify-center w-12 h-6">
                                  <span className="inline-block size-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></span>
                                </div>
                              ) : (
                                <>
                                  <input 
                                    type="checkbox" 
                                    id={`toggle-${feed.id}`} 
                                    checked={feed.isActive} 
                                    onChange={() => toggleFeedStatus(feed.id)}
                                    className="opacity-0 absolute block w-6 h-6 rounded-full appearance-none cursor-pointer"
                                    disabled={toggleFeedStatusMutation.isPending}
                                  />
                                  <label 
                                    htmlFor={`toggle-${feed.id}`} 
                                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${feed.isActive ? 'bg-green-500' : 'bg-gray-600'}`}
                                  >
                                    <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in ${feed.isActive ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                  </label>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-3">
                          {editingId !== feed.id && (
                            <button 
                              onClick={() => deleteFeed(feed.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Delete feed"
                              disabled={deleteFeedMutation.isPending && deleteFeedMutation.variables === feed.id}
                            >
                              {deleteFeedMutation.isPending && deleteFeedMutation.variables === feed.id ? (
                                <span className="inline-block size-5 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></span>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          )}
                          
                          {editingId === feed.id ? (
                            <>
                              {/* Save button */}
                              <button 
                                onClick={() => submitEditedFeed(feed.id)}
                                className="text-green-500 hover:text-green-700"
                                aria-label="Save changes"
                                disabled={updateFeedMutation.isPending}
                              >
                                {updateFeedMutation.isPending && updateFeedMutation.variables?.id === feed.id ? (
                                  <span className="inline-block size-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></span>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              
                              {/* Cancel button */}
                              <button 
                                onClick={cancelEditing}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Cancel editing"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => startEditing(feed)}
                              className="text-purple-500 hover:text-purple-700"
                              aria-label="Edit feed"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - only show when not loading and we have feeds */}
        {!isLoading && displayFeeds.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-400 mr-2">Rows Per Page:</span>
              <select 
                className="bg-gray-800/80 text-white rounded-md px-2 py-1 text-sm border border-gray-700"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700/80'}`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="text-white">...</span>
                  <button 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors"
                    onClick={() => setCurrentPage(totalPages)}
                    aria-label={`Page ${totalPages}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Feed Fetch Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300" 
              onClick={() => setIsModalOpen(false)}
              style={{
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}
            ></div>
            <div className="relative w-96 bg-[#0E0A14] rounded-lg overflow-visible border border-gray-800 m-4 mt-16 mr-8 shadow-xl animate-fadeIn transition-all duration-300">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5">
                <h2 className="text-xl font-semibold text-white">Feed Fetch</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 p-1"
                  aria-label="Close modal"
                >
                  <IoMdClose size={20} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="px-5 pt-2 pb-3 space-y-5">
                {/* Feed Name Input */}
                <div className="space-y-2">
                  <label htmlFor="feedName" className="block text-sm text-white">
                    Feed Name
                  </label>
                  <input
                    type="text"
                    id="feedName"
                    name="feedName"
                    placeholder="Type Name Here..."
                    value={formData.feedName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#1A1625] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                {/* Feed Source URL Input */}
                <div className="space-y-2">
                  <label htmlFor="sourceUrl" className="block text-sm text-white">
                    Feed Source URL
                  </label>
                  <input
                    type="text"
                    id="sourceUrl"
                    name="sourceUrl"
                    placeholder="Source URL"
                    value={formData.sourceUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-[#1A1625] border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                {/* Update Interval Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="updateInterval" className="block text-sm text-white">
                    Update Interval
                  </label>
                  <div className="relative ">
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 bg-[#1A1625] border border-gray-800 rounded-md text-left text-white flex justify-between items-center"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className={formData.updateInterval ? "text-white" : "text-gray-500"}>
                        {formData.updateInterval || "Select Frequency"}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#5D2B8E] flex items-center justify-center">
                        <IoChevronDownOutline size={16} className={`text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute z-[60] mt-1 w-full bg-[#1A1625] border border-gray-800 rounded-md shadow-lg">
                        <ul className="py-1 max-h-60 overflow-auto">
                          {["5_minutes", "15_minutes", "30_minutes", "1_hour", "6_hours", "12_hours", "24_hours"].map((interval) => (
                            <li key={interval}>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                                onClick={() => handleIntervalSelect(interval)}
                              >
                                {formatUpdateInterval(interval)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-5 pb-5 pt-2">
                <button
                  onClick={handleSubmit}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center justify-center"
                  disabled={!formData.feedName || !formData.sourceUrl || !formData.updateInterval || createFeedMutation.isPending}
                >
                  {createFeedMutation.isPending ? (
                    <>
                      <span className="inline-block size-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedManagerPage;
