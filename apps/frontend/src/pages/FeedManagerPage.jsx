import { useState } from "react";
import { Button } from "../components/Button";
import { IoMdClose } from "react-icons/io";
import { IoChevronDownOutline } from "react-icons/io5";

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
    setFormData({
      ...formData,
      updateInterval: value
    });
    setIsDropdownOpen(false);
  };
  
  const handleSubmit = () => {
    // Add new feed to the list
    const newFeed = {
      id: feeds.length + 1,
      name: formData.feedName,
      sourceUrl: formData.sourceUrl,
      sport: "Not specified", // Could be added to form later
      updateInterval: formData.updateInterval,
      status: true
    };
    
    setFeeds([...feeds, newFeed]);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      feedName: "",
      sourceUrl: "",
      updateInterval: ""
    });
  };

  // Mock data for feed items
  const [feeds, setFeeds] = useState([
    {
      id: 1,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 2,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 3,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 4,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 5,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 6,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 7,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 8,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 9,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 10,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 11,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    },
    {
      id: 12,
      name: "NDTV",
      sourceUrl: "mumbai_indian123@adg34",
      sport: "Cricket",
      updateInterval: "5,00,00000",
      status: true
    }
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Toggle feed status
  const toggleFeedStatus = (id) => {
    setFeeds(feeds.map(feed => 
      feed.id === id ? { ...feed, status: !feed.status } : feed
    ));
  };

  // Delete feed
  const deleteFeed = (id) => {
    setFeeds(feeds.filter(feed => feed.id !== id));
  };

  // Calculate pagination
  const totalPages = Math.ceil(feeds.length / rowsPerPage);
  const paginatedFeeds = feeds.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen">
      {/* Add style tag for animations */}
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
      
      {/* Header with title and create button */}
      <div className="bg-[#0E0A14] py-3 px-6 flex justify-between items-center border-b border-gray-800">
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
        

        {/* Feed table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full border-collapse">
            {/* Table header */}
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Feed Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Source URL</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Sport</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Update Interval</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody>
              {paginatedFeeds.map((feed) => (
                <tr key={feed.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                  <td className="py-4 px-4 text-white">{feed.name}</td>
                  <td className="py-4 px-4 text-white">{feed.sourceUrl}</td>
                  <td className="py-4 px-4 text-white">{feed.sport}</td>
                  <td className="py-4 px-4 text-white">{feed.updateInterval}</td>
                  <td className="py-4 px-4">
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id={`toggle-${feed.id}`} 
                        checked={feed.status} 
                        onChange={() => toggleFeedStatus(feed.id)}
                        className="opacity-0 absolute block w-6 h-6 rounded-full appearance-none cursor-pointer"
                      />
                      <label 
                        htmlFor={`toggle-${feed.id}`} 
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in ${feed.status ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in ${feed.status ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      </label>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => deleteFeed(feed.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Delete feed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button 
                        className="text-purple-500 hover:text-purple-700"
                        aria-label="Edit feed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
            <div className="relative w-96 bg-[#0E0A14] rounded-lg overflow-hidden border border-gray-800 m-4 mt-16 mr-8 shadow-xl animate-fadeIn transition-all duration-300">
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
                  <div className="relative">
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
                      <div className="absolute z-10 mt-1 w-full bg-[#1A1625] border border-gray-800 rounded-md shadow-lg">
                        <ul className="py-1 max-h-60 overflow-auto">
                          {["5 minutes", "15 minutes", "30 minutes", "1 hour", "6 hours", "12 hours", "24 hours"].map((interval) => (
                            <li key={interval}>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                                onClick={() => handleIntervalSelect(interval)}
                              >
                                {interval}
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
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
                  disabled={!formData.feedName || !formData.sourceUrl || !formData.updateInterval}
                >
                  Submit
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
