import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Checkbox } from '../components/Checkbox';
import { Tabs } from '../components/Tabs';
import { Leftpanel } from '../components/Leftpanel';

const ComponentsPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const tabItems = [
    {
      id: 'overview',
      label: 'Overview',
      panel: (
        <div className="p-4 border border-default rounded-lg">
          <p className="text-body leading-body text-main-medium">
            This tab contains an overview of the component library. Each component is built with accessibility in mind and follows modern React patterns.
          </p>
        </div>
      )
    },
    {
      id: 'usage',
      label: 'Usage',
      panel: (
        <div className="p-4 border border-default rounded-lg">
          <p className="text-body leading-body text-main-medium">
            All components are designed to be easily imported and used in your React applications. They support TypeScript and include proper prop validation.
          </p>
        </div>
      )
    },
    {
      id: 'examples',
      label: 'Examples',
      panel: (
        <div className="p-4 border border-default rounded-lg">
          <p className="text-body leading-body text-main-medium">
            Check out the examples below to see how each component can be used in different scenarios and configurations.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-12">
        <h1 className="text-h1 leading-h1 font-bold text-main-high mb-4">
          Component Library
        </h1>
        <p className="text-body leading-body text-main-medium max-w-3xl">
          Explore our collection of reusable UI components built with React and styled with Tailwind CSS. 
          Each component is designed with accessibility, performance, and developer experience in mind.
        </p>
      </div>

      {/* Buttons Section */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Buttons
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Button Variants
            </h3>
            <div className="flex flex-wrap gap-4 p-6 bg-surface-low rounded-lg">
              <div className="w-1/2">
                <Button variant="solid">Solid Button</Button>
              </div>
              <div className="w-1/2">
                <Button variant="outline">Outline Button</Button>
              </div>
            </div>
          </div>
          
       
          
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Button States
            </h3>
            <div className="flex flex-wrap gap-4 p-6 bg-surface-low rounded-lg">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button isLoading={isLoading} onClick={handleLoadingDemo}>
                {isLoading ? 'Loading...' : 'Click for Loading'}
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Dark Theme Variants
            </h3>
            <div className="flex flex-wrap gap-4 p-6 bg-gray-900 rounded-lg">
              <Button variant="dark">Dark Primary</Button>
              <Button variant="dark-secondary">Dark Secondary</Button>
              <Button variant="dark" disabled>Dark Disabled</Button>
              <Button variant="dark" isLoading={isLoading} onClick={handleLoadingDemo}>
                {isLoading ? 'Loading...' : 'Dark Loading'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Input Fields
        </h2>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-surface-low rounded-lg">
            <div>
              <label className="block text-sm font-medium text-main-high mb-2">
                Basic Input
              </label>
              <Input 
                placeholder="Enter some text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-main-high mb-2">
                Input with Hint
              </label>
              <Input 
                placeholder="Email address"
                hint="We'll never share your email"
                type="email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-main-high mb-2">
                Input with Error
              </label>
              <Input 
                placeholder="Password"
                error="Password must be at least 8 characters"
                invalid
                type="password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-main-high mb-2">
                Disabled Input
              </label>
              <Input 
                placeholder="Disabled input"
                disabled
                value="Cannot edit this"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Dark Theme Inputs
            </h3>
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-900 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dark Input
                </label>
                <Input 
                  placeholder="Dark themed input..."
                  variant="dark"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dark Input with Hint
                </label>
                <Input 
                  placeholder="Email address"
                  hint="This is a dark themed hint"
                  variant="dark"
                  type="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dark Input with Error
                </label>
                <Input 
                  placeholder="Password"
                  error="This is a dark themed error message"
                  variant="dark"
                  invalid
                  type="password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dark Disabled Input
                </label>
                <Input 
                  placeholder="Disabled dark input"
                  variant="dark"
                  disabled
                  value="Cannot edit this"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Badges
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Badge Variants
            </h3>
            <div className="flex flex-wrap gap-4 p-6 bg-surface-low rounded-lg">
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Usage Examples
            </h3>
            <div className="flex flex-wrap gap-4 p-6 bg-surface-low rounded-lg">
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Inactive</Badge>
              <Badge variant="primary">New</Badge>
              <Badge variant="neutral">Draft</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Checkboxes Section */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Checkboxes
        </h2>
        <div className="space-y-6">
          <div className="p-6 bg-surface-low rounded-lg">
            <div className="space-y-4">
              <Checkbox 
                label="I agree to the terms and conditions"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              <Checkbox label="Subscribe to newsletter" />
              <Checkbox label="Enable notifications" defaultChecked />
              <Checkbox label="Disabled option" disabled />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Tabs
        </h2>
        <div className="p-6 bg-surface-low rounded-lg">
          <Tabs items={tabItems} defaultTabId="overview" />
        </div>
      </section>

      {/* Leftpanel Section */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Left Panel Navigation
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-4">
              Interactive Navigation Panel
            </h3>
            <p className="text-body leading-body text-main-medium mb-6">
              A responsive left navigation panel that can be toggled between expanded and collapsed states. 
              Features smooth animations, active state highlighting, and user profile section.
            </p>
            <div className="flex gap-6 p-6 bg-surface-low rounded-lg overflow-hidden">
              <div className="flex-shrink-0">
                <Leftpanel />
              </div>
              <div className="flex-1 p-4">
                <h4 className="text-h3 leading-h3 font-semibold text-main-high mb-3">
                  Features
                </h4>
                <ul className="space-y-2 text-body leading-body text-main-medium">
                  <li>• Toggle between expanded (256px) and collapsed (64px) states</li>
                  <li>• Smooth width transitions with CSS animations</li>
                  <li>• Active state highlighting with purple accent colors</li>
                  <li>• Responsive navigation items with hover effects</li>
                  <li>• User profile section with avatar</li>
                  <li>• Dark theme with proper contrast ratios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="mb-16">
        <h2 className="text-h2 leading-h2 font-bold text-main-high mb-6">
          Usage Guidelines
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-3">
              Accessibility
            </h3>
            <ul className="space-y-2 text-body leading-body text-main-medium">
              <li>• All components include proper ARIA labels</li>
              <li>• Keyboard navigation is supported</li>
              <li>• Color contrast meets WCAG guidelines</li>
              <li>• Screen reader friendly</li>
            </ul>
          </div>
          
          <div className="p-6 border border-default rounded-lg">
            <h3 className="text-h3 leading-h3 font-semibold text-main-high mb-3">
              Best Practices
            </h3>
            <ul className="space-y-2 text-body leading-body text-main-medium">
              <li>• Use semantic HTML elements</li>
              <li>• Follow consistent naming conventions</li>
              <li>• Implement proper error handling</li>
              <li>• Test across different devices</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentsPage;