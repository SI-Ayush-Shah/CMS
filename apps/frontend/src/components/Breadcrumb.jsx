import { Link, useLocation } from 'react-router-dom';

// Simple SVG icons
const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const Breadcrumb = () => {
  const location = useLocation();
  
  // Define route labels for better breadcrumb display
  const routeLabels = {
    '': 'Home',
    'components': 'Components',
    'about': 'About'
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    
    // Always start with home
    const breadcrumbs = [
      {
        label: 'Home',
        path: '/',
        isActive: pathSegments.length === 0
      }
    ];

    // Add segments for nested paths
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className="flex mb-6" 
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="w-4 h-4 text-gray-400 mx-1" 
                aria-hidden="true"
              />
            )}
            
            {breadcrumb.isActive ? (
              <span 
                className="text-sm font-medium text-gray-900 flex items-center"
                aria-current="page"
              >
                {index === 0 && (
                  <HomeIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                )}
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200"
              >
                {index === 0 && (
                  <HomeIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                )}
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;