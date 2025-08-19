import LoadingSkeleton from './LoadingSkeleton';
import LoadingSpinner from './LoadingSpinner';

const LoadingState = ({ 
  type = 'spinner', 
  size = 'md',
  message = 'Loading...',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-48',
    xl: 'h-64'
  };

  if (type === 'skeleton') {
    return <LoadingSkeleton />;
  }

  if (type === 'inline') {
    return (
      <div className={`flex items-center justify-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-main-high"></div>
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`border border-gray-200 rounded-lg p-6 ${sizeClasses[size]} ${className}`}>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-high"></div>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  // Default spinner
  return <LoadingSpinner />;
};

export default LoadingState;