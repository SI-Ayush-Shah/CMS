import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { AiOutlineFile } from "react-icons/ai";
import { BsCheckCircleFill } from "react-icons/bs";

/**
 * ProgressToast Component
 * 
 * A global toast notification component for displaying file upload/download progress
 * that appears in the top right corner of the screen.
 * 
 * Features:
 * - Minimize/expand functionality
 * - Progress bar with percentage
 * - Cancel button
 * - Different states: uploading, in progress, completed
 * - Auto-hide after completion (optional)
 */
const ProgressToast = ({ 
  isVisible = false, 
  onClose, 
  tasks = [],
  title = "Uploading...",
  autoHideDelay = 3000 // Auto-hide after completion (in ms)
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldHide, setShouldHide] = useState(false);

  // Check if all tasks are completed
  const allCompleted = tasks.length > 0 && tasks.every(task => task.progress === 100);
  
  // Auto-hide after completion
  useEffect(() => {
    let timer;
    if (allCompleted && autoHideDelay > 0) {
      timer = setTimeout(() => {
        setShouldHide(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Wait for fade-out animation
      }, autoHideDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [allCompleted, autoHideDelay, onClose]);

  // Don't render if not visible
  if (!isVisible) return null;
  
  // Determine title based on tasks status
  const getTitle = () => {
    if (tasks.length === 0) return title;
    if (allCompleted) return "Upload Completed";
    
    const inProgress = tasks.some(task => task.progress > 0 && task.progress < 100);
    if (inProgress) return "Uploading in Progress";
    
    return "Uploading...";
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${shouldHide ? 'opacity-0 translate-x-4' : 'opacity-100'}`}
      style={{ maxWidth: '400px', width: isExpanded ? '400px' : '300px' }}
    >
      <div className="bg-[#0E0A14] rounded-lg shadow-xl overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-3 bg-[#0E0A14] border-b border-gray-800">
          <h3 className="text-lg font-medium text-purple-300">{getTitle()}</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
              aria-label={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
              aria-label="Close"
            >
              <IoMdClose size={16} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-4 space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-purple-400">
                      <AiOutlineFile size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-300 truncate max-w-[200px]">
                      {task.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-purple-300">{task.progress}%</span>
                    {task.progress === 100 ? (
                      <span className="text-green-400">
                        <BsCheckCircleFill size={16} />
                      </span>
                    ) : (
                      <button 
                        onClick={() => task.onCancel && task.onCancel()}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        aria-label="Cancel upload"
                      >
                        <IoMdClose size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      task.progress === 100 ? 'bg-green-500' : 'bg-purple-600'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Minimized view */}
        {!isExpanded && tasks.length > 0 && (
          <div className="p-3 border-t border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {tasks.length === 1 ? (
                  <>
                    <div className="text-purple-400">
                      <AiOutlineFile size={16} />
                    </div>
                    <span className="text-sm text-gray-300 truncate max-w-[150px]">
                      {tasks[0].fileName}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">
                    {tasks.length} files
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-purple-300">
                {Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)}%
              </span>
            </div>
            
            {/* Combined progress bar */}
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  allCompleted ? 'bg-green-500' : 'bg-purple-600'
                }`}
                style={{ 
                  width: `${Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressToast;
