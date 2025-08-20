import { createContext, useContext, useState, useCallback } from "react";
import ProgressToast from "../components/ProgressToast";

// Create context
const ProgressContext = createContext(null);

/**
 * ProgressProvider Component
 * 
 * Provides global state management for progress notifications
 * and renders the ProgressToast component
 */
export const ProgressProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("Uploading...");

  // Generate a unique ID for each task
  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new task
  const addTask = useCallback((fileName, onCancel) => {
    const id = generateId();
    setTasks(prev => [...prev, { id, fileName, progress: 0, onCancel }]);
    setIsVisible(true);
    return id;
  }, []);

  // Update task progress
  const updateProgress = useCallback((id, progress) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, progress: Math.min(progress, 100) } : task
      )
    );
  }, []);

  // Remove a task
  const removeTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // Clear all completed tasks
  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => task.progress < 100));
  }, []);

  // Reset all tasks
  const resetTasks = useCallback(() => {
    setTasks([]);
    setIsVisible(false);
  }, []);

  // Set custom title
  const setCustomTitle = useCallback((newTitle) => {
    setTitle(newTitle);
  }, []);

  // Close the toast
  const closeToast = useCallback(() => {
    setIsVisible(false);
    // Allow animation to complete before clearing tasks
    setTimeout(() => {
      setTasks([]);
    }, 300);
  }, []);

  // Context value
  const value = {
    addTask,
    updateProgress,
    removeTask,
    clearCompletedTasks,
    resetTasks,
    setCustomTitle,
    closeToast,
    tasks
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
      <ProgressToast 
        isVisible={isVisible && tasks.length > 0}
        onClose={closeToast}
        tasks={tasks}
        title={title}
      />
    </ProgressContext.Provider>
  );
};

// Custom hook to use the progress context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;
