import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSkeleton from "./LoadingSkeleton";
import RouteTransition from "./RouteTransition";
import Aurora from "../components/Aurora";

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
          <div className="bg-core-neu-1000 w-full h-full isolate relative">
            {/* Aurora Background (behind page content, not the sidebar) */}
            <div className="absolute inset-0 -z-10 w-full h-full">
              <Aurora
                colorStops={["#3c1264", "#280c43", "#140621"]}
                blend={1}
                amplitude={1}
                speed={0.5}
              />
            </div>
            {children}
          </div>
        </RouteTransition>
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyPageWrapper;
