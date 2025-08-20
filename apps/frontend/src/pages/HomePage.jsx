import { Link } from 'react-router-dom';
import ProgressToastDemo from '../components/ProgressToastDemo';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-h1 leading-h1 font-bold text-main-high mb-6">
            Welcome to the Component Library
          </h1>
          <p className="text-body leading-body text-main-medium mb-8 max-w-2xl mx-auto">
            A comprehensive React application showcasing reusable UI components built with modern technologies. 
            Explore our component library, learn about the technology stack, and get started with development.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/components" 
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Explore Components
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-4 border border-default rounded-lg hover:bg-surface-low transition-colors font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-h2 leading-h2 font-bold text-main-high mb-8 text-center">
            Project Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-default">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
                </svg>
              </div>
              <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2">
                Modern Components
              </h3>
              <p className="text-body leading-body text-main-medium">
                Built with React 19 and styled with Tailwind CSS 4 for modern, responsive design.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-default">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2">
                Fast Development
              </h3>
              <p className="text-body leading-body text-main-medium">
                Powered by Vite for lightning-fast development and optimized builds.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-default">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2">
                Best Practices
              </h3>
              <p className="text-body leading-body text-main-medium">
                Following React best practices with proper accessibility and responsive design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Toast Demo Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2 leading-h2 font-bold text-main-high mb-8 text-center">
            Progress Toast Demo
          </h2>
          <div className="bg-surface-low p-6 rounded-lg border border-default mb-12">
            <ProgressToastDemo />
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-6 bg-surface-low">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2 leading-h2 font-bold text-main-high mb-8 text-center">
            Quick Links
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              to="/components" 
              className="p-6 bg-white rounded-lg border border-default hover:shadow-md transition-shadow group"
            >
              <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2 group-hover:text-primary transition-colors">
                Component Library →
              </h3>
              <p className="text-body leading-body text-main-medium">
                Explore our collection of reusable UI components including buttons, inputs, badges, and more.
              </p>
            </Link>
            
            <Link 
              to="/about" 
              className="p-6 bg-white rounded-lg border border-default hover:shadow-md transition-shadow group"
            >
              <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2 group-hover:text-primary transition-colors">
                About Project →
              </h3>
              <p className="text-body leading-body text-main-medium">
                Learn about the technology stack, development guidelines, and how to contribute.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;