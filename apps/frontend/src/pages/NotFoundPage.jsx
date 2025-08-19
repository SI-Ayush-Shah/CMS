import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-24 h-24 text-primary/60" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-h1 leading-h1 font-bold text-main-high mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-body leading-body text-main-medium mb-6 max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, it happens to the best of us. Let's get you back on track.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link 
              to="/" 
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            <Link 
              to="/components" 
              className="px-8 py-4 border border-default rounded-lg hover:bg-surface-low transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View Components
            </Link>
          </div>
        </div>

        {/* Suggested Pages */}
        <div className="border-t border-default pt-8">
          <h2 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
            Suggested Pages
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Link 
              to="/" 
              className="p-4 border border-default rounded-lg hover:bg-surface-low transition-colors text-left group"
            >
              <h3 className="font-medium text-main-high group-hover:text-primary transition-colors mb-1">
                Home
              </h3>
              <p className="text-sm text-main-medium">
                Welcome page with project overview
              </p>
            </Link>
            
            <Link 
              to="/components" 
              className="p-4 border border-default rounded-lg hover:bg-surface-low transition-colors text-left group"
            >
              <h3 className="font-medium text-main-high group-hover:text-primary transition-colors mb-1">
                Components
              </h3>
              <p className="text-sm text-main-medium">
                Interactive component library
              </p>
            </Link>
            
            <Link 
              to="/about" 
              className="p-4 border border-default rounded-lg hover:bg-surface-low transition-colors text-left group"
            >
              <h3 className="font-medium text-main-high group-hover:text-primary transition-colors mb-1">
                About
              </h3>
              <p className="text-sm text-main-medium">
                Project info and tech stack
              </p>
            </Link>
            
            <div className="p-4 border border-default rounded-lg opacity-50">
              <h3 className="font-medium text-main-medium mb-1">
                More Coming Soon
              </h3>
              <p className="text-sm text-main-low">
                Additional pages in development
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-default">
          <p className="text-sm text-main-low">
            If you believe this is an error, please check the URL or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;