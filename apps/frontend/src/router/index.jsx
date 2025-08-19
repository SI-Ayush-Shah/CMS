import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import LazyPageWrapper from '../components/LazyPageWrapper';
import BaseLayout from '../layouts/BaseLayout';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('../pages/HomePage'));
const ComponentsPage = lazy(() => import('../pages/ComponentsPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Router configuration with route definitions
export const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <LazyPageWrapper>
            <HomePage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'components',
        element: (
          <LazyPageWrapper>
            <ComponentsPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'about',
        element: (
          <LazyPageWrapper>
            <AboutPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: '*',
        element: (
          <LazyPageWrapper>
            <NotFoundPage />
          </LazyPageWrapper>
        ),
      },
    ],
  },
]);

export default router;