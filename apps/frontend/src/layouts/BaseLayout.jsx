import { Outlet, useNavigation, useLocation } from "react-router-dom";
import LoadingProgress from "../components/LoadingProgress";
import { Leftpanel } from "../components/Leftpanel";
import Aurora from "../components/Aurora";

const BaseLayout = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state === "loading";

  // Hide left panel for login page
  const shouldShowLeftPanel = location.pathname !== "/hackathon-2025-content-studio/login";

  return (
    <div className="min-h-screen  flex isolate relative bg-black">
      <div className="fixed inset-0 z-0 ">
        <Aurora
          colorStops={["#3c1264", "#280c43", "#140621"]}
          blend={1}
          amplitude={1}
          speed={0.5}
        />
      </div>
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
      <main
        className={`relative min-h-screen ${shouldShowLeftPanel ? "flex-1" : "w-full"}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default BaseLayout;
