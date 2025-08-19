import { Outlet, useNavigation } from "react-router-dom";
import LoadingProgress from "../components/LoadingProgress";
import { Leftpanel } from "../components/Leftpanel";

const BaseLayout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="min-h-screen bg-core-neu-1000 flex">
      <LoadingProgress isLoading={isLoading} />
      {/* Global Left Panel */}
      <aside className="relative z-20">
        <Leftpanel />
      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 min-h-screen">
        {/* Content */}
        <div className="relative z-10">
          {/* <Breadcrumb /> */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BaseLayout;
