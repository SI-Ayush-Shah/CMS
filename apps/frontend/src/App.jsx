import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgressProvider } from './contexts/ProgressContext';

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ProgressProvider>
          <RouterProvider router={router} />
        </ProgressProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
