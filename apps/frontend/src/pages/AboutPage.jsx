const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-12">
        <h1 className="text-h1 leading-h1 font-bold text-main-high mb-4">
          About This Project
        </h1>
        <p className="text-body leading-body text-main-medium">
          A modern React component library built with cutting-edge technologies and best practices. 
          This project demonstrates how to create reusable, accessible, and performant UI components.
        </p>
      </div>

      {/* Technology Stack */}
      <section className="mb-12">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Technology Stack
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Frontend Technologies
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">React</span>
                <span className="text-sm text-main-low">v19.1.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">React Router</span>
                <span className="text-sm text-main-low">v7.1.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">Tailwind CSS</span>
                <span className="text-sm text-main-low">v4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">Vite</span>
                <span className="text-sm text-main-low">v7.1.2</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Development Tools
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">ESLint</span>
                <span className="text-sm text-main-low">v9.33.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">TypeScript</span>
                <span className="text-sm text-main-low">v19.1.10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">Turbo</span>
                <span className="text-sm text-main-low">Monorepo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body leading-body text-main-medium">pnpm</span>
                <span className="text-sm text-main-low">Package Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Guidelines */}
      <section className="mb-12">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Development Guidelines
        </h2>
        <div className="space-y-6">
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Code Standards
            </h3>
            <ul className="space-y-2 text-body leading-body text-main-medium">
              <li>• Use functional components with React hooks</li>
              <li>• Follow PascalCase naming for components</li>
              <li>• Implement proper TypeScript interfaces for props</li>
              <li>• Use Tailwind CSS utility-first approach</li>
              <li>• Follow consistent import ordering (external, internal, relative)</li>
            </ul>
          </div>
          
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Component Development
            </h3>
            <ul className="space-y-2 text-body leading-body text-main-medium">
              <li>• All components must have proper prop validation</li>
              <li>• Implement accessibility features (ARIA labels, keyboard navigation)</li>
              <li>• Use semantic HTML elements</li>
              <li>• Follow responsive design principles</li>
              <li>• Include loading and error states where appropriate</li>
            </ul>
          </div>
          
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Testing Requirements
            </h3>
            <ul className="space-y-2 text-body leading-body text-main-medium">
              <li>• Minimum 80% test coverage for new components</li>
              <li>• Integration tests for all navigation flows</li>
              <li>• Visual regression tests for UI components</li>
              <li>• Performance testing for route transitions</li>
              <li>• Accessibility testing with automated tools</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Project Structure */}
      <section className="mb-12">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Project Structure
        </h2>
        <div className="p-6 border border-default rounded-lg bg-surface-low">
          <pre className="text-sm text-main-medium overflow-x-auto">
{`apps/frontend/src/
├── components/           # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Badge.jsx
│   └── ...
├── pages/               # Route-specific page components
│   ├── HomePage.jsx
│   ├── ComponentsPage.jsx
│   ├── AboutPage.jsx
│   └── NotFoundPage.jsx
├── layouts/             # Layout wrapper components
│   └── BaseLayout.jsx
├── router/              # Router configuration
│   └── index.jsx
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
└── figma/               # Generated Figma components`}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border border-default rounded-lg text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          
          <div className="p-6 border border-default rounded-lg text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2">
              Accessibility First
            </h3>
            <p className="text-body leading-body text-main-medium">
              Built with accessibility in mind, following WCAG guidelines.
            </p>
          </div>
          
          <div className="p-6 border border-default rounded-lg text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
            </div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-2">
              Responsive Design
            </h3>
            <p className="text-body leading-body text-main-medium">
              Mobile-first approach with responsive components.
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Contribution */}
      <section className="mb-12">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Contributing
        </h2>
        <div className="p-6 border border-default rounded-lg">
          <p className="text-body leading-body text-main-medium mb-4">
            We welcome contributions to this project! Whether you're fixing bugs, adding new components, 
            or improving documentation, your help is appreciated.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-main-high mb-2">Getting Started</h4>
              <ol className="list-decimal list-inside space-y-1 text-body leading-body text-main-medium ml-4">
                <li>Fork the repository</li>
                <li>Create a feature branch</li>
                <li>Make your changes following our guidelines</li>
                <li>Add tests for new functionality</li>
                <li>Submit a pull request</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-main-high mb-2">Development Commands</h4>
              <div className="bg-surface-low p-4 rounded-lg">
                <pre className="text-sm text-main-medium">
{`# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;