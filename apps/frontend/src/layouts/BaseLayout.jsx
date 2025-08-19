import { Outlet, useNavigation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Breadcrumb from '../components/Breadcrumb';
import LoadingProgress from '../components/LoadingProgress';
import Aurora from '../components/Aurora';

const BaseLayout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="min-h-screen bg-[#000] flex flex-col">
      <LoadingProgress isLoading={isLoading} />
      {/* Header with Navigation */}
      {/* <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navigation />
        </div>
      </header> */}

      {/* Main Content Area */}
      <main className="relative min-h-screen">
        {/* Aurora Background */}
        <div className="absolute inset-0 z-0 bg-core-neu-1000">
          <Aurora
            colorStops={["#1e0a32", "#1e0a32", "#1e0a32"]}
            blend={1}
            amplitude={1}
            speed={0.5}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* <Breadcrumb /> */}
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 React Component Library. Built with React & Tailwind CSS.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default BaseLayout;
