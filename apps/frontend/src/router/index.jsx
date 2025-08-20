import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import LazyPageWrapper from "../components/LazyPageWrapper";
import BaseLayout from "../layouts/BaseLayout";

// Lazy load page components for code splitting
const HomePage = lazy(() => import("../pages/HomePage"));
const ComponentsPage = lazy(() => import("../pages/ComponentsPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ContentWizardPage = lazy(() => import("../pages/ContentWizardPage"));
const BlogPage = lazy(() => import("../pages/BlogPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ContentEditorPage = lazy(() => import("../pages/ContentEditorPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const FeedManagerPage = lazy(() => import("../pages/FeedManagerPage"));

// Router configuration with route definitions
export const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "editor",
        element: (
          <LazyPageWrapper>
            <ContentEditorPage />
          </LazyPageWrapper>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "editor/:id",
        element: (
          <LazyPageWrapper>
            <ContentEditorPage />
          </LazyPageWrapper>
        ),
        errorElement: <ErrorBoundary />,
      },
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
        path: "/wizard",
        element: <Navigate to="/creative-wizard" replace />,
      },
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
        path: "content-hub",
        element: (
          <LazyPageWrapper>
            <BlogPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: "blog",
        element: <Navigate to="/content-hub" replace />,
      },
      {
        path: "analytics",
        element: (
          <LazyPageWrapper>
            <AnalyticsPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: "feed-manager",
        element: (
          <LazyPageWrapper>
            <FeedManagerPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: "*",
        element: (
          <LazyPageWrapper>
            <NotFoundPage />
          </LazyPageWrapper>
        ),
      },
    ],
  },
  {
    path: "login",
    element: (
      <LazyPageWrapper>
        <LoginPage />
      </LazyPageWrapper>
    ),
  },
]);

export default router;
