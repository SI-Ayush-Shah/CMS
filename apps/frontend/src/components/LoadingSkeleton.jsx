const LoadingSkeleton = ({ type = 'page' }) => {
  if (type === 'page') {
    return (
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
          </div>

          {/* Card-like skeleton */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'components') {
    return (
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
        </div>

        {/* Component grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded-md w-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default spinner fallback
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-high"></div>
    </div>
  );
};

export default LoadingSkeleton;