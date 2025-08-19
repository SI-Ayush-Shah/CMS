import { Outlet, useNavigation, useLocation } from "react-router-dom";
import LoadingProgress from "../components/LoadingProgress";
import { Leftpanel } from "../components/Leftpanel";

const BaseLayout = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state === "loading";
  
  // Hide left panel for login page
  const shouldShowLeftPanel = location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-core-neu-1000 flex">
      <LoadingProgress isLoading={isLoading} />
      
      {/* Global Left Panel - Conditionally rendered */}
      {shouldShowLeftPanel && (
        <aside className="relative z-20">
          <div className="p-2 sticky top-0 h-screen">
            <Leftpanel />
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`relative min-h-screen ${shouldShowLeftPanel ? 'flex-1' : 'w-full'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default BaseLayout;
