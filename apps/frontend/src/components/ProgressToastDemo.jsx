import { useState } from "react";
import { useProgress } from "../contexts/ProgressContext";
import { Button } from "./Button";

/**
 * ProgressToastDemo Component
 * 
 * A demo component to showcase the ProgressToast functionality
 */
const ProgressToastDemo = () => {
  const { addTask, updateProgress, removeTask } = useProgress();
  const [activeTasks, setActiveTasks] = useState([]);

  // Simulate file upload
  const simulateFileUpload = (fileName) => {
    const taskId = addTask(fileName, () => {
      // Cancel handler
      clearInterval(intervalId);
      removeTask(taskId);
      setActiveTasks(prev => prev.filter(task => task.id !== taskId));
    });
    
    let progress = 0;
    const intervalId = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(intervalId);
        setTimeout(() => {
          setActiveTasks(prev => prev.filter(task => task.id !== taskId));
        }, 3000);
      }
      updateProgress(taskId, Math.round(progress));
    }, 500);
    
    setActiveTasks(prev => [...prev, { id: taskId, intervalId }]);
    
    return taskId;
  };

  // Upload a single file
  const handleSingleUpload = () => {
    simulateFileUpload("document.pdf");
  };

  // Upload multiple files
  const handleMultipleUpload = () => {
    const files = ["report.pdf", "image.jpg", "data.xlsx"];
    files.forEach(file => {
      simulateFileUpload(file);
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Progress Toast Demo</h2>
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleSingleUpload} variant="solid">
          Upload Single File
        </Button>
        <Button onClick={handleMultipleUpload} variant="outline">
          Upload Multiple Files
        </Button>
      </div>
    </div>
  );
};

export default ProgressToastDemo;
