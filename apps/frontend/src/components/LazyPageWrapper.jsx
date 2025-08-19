import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSkeleton from "./LoadingSkeleton";
import RouteTransition from "./RouteTransition";

const LazyPageWrapper = ({ children }) => {
  const location = useLocation();

  // Determine skeleton type based on route
  const getSkeletonType = () => {
    if (location.pathname === "/components") return "components";
    return "page";
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton type={getSkeletonType()} />}>
        <RouteTransition>
          <div className=" w-full h-full isolate relative">
            {/* Aurora Background (behind page content, not the sidebar) */}

            {children}
          </div>
        </RouteTransition>
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyPageWrapper;
