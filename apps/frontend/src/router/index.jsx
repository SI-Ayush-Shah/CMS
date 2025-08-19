import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import LazyPageWrapper from "../components/LazyPageWrapper";
import BaseLayout from "../layouts/BaseLayout";

// Lazy load page components for code splitting
const HomePage = lazy(() => import("../pages/HomePage"));
const ComponentsPage = lazy(() => import("../pages/ComponentsPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContentWizardPage = lazy(() => import("../pages/ContentWizardPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const LoginPage = lazy(() => import('../pages/LoginPage'));

// Router configuration with route definitions
export const router = createBrowserRouter([
  {
    path: "/wizard",
    element: (
      <LazyPageWrapper>
        <ContentWizardPage />
      </LazyPageWrapper>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
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
        path: "components",
        element: (
          <LazyPageWrapper>
            <ComponentsPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: "about",
        element: (
          <LazyPageWrapper>
            <AboutPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <LazyPageWrapper>
            <LoginPage />
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
