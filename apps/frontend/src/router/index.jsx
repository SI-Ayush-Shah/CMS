import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import LazyPageWrapper from "../components/LazyPageWrapper";
import BaseLayout from "../layouts/BaseLayout";
import ContentWizardPage from "../pages/ContentWizardPage";
import ComponentsPage from "../pages/ComponentsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginWrapper from "../components/LoginWrapper";

// Lazy load page components for code splitting
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const BlogPage = lazy(() => import("../pages/BlogPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ContentEditorPage = lazy(() => import("../pages/ContentEditorPage"));
const EditorPage = lazy(() => import("../pages/EditorPage"));
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
          <ProtectedRoute>
            <LazyPageWrapper>
              <ContentEditorPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "editor/:id",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <ContentEditorPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "editor/:blogId",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <EditorPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/wizard",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <ContentWizardPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/creative-wizard",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <ContentWizardPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        index: true,
        element: <Navigate to="/wizard" replace />,
      },
      {
        path: "components",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <ComponentsPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <AboutPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "content-hub",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <BlogPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "blog",
        element: <Navigate to="/content-hub" replace />,
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <AnalyticsPage />
            </LazyPageWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "feed-manager",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <FeedManagerPage />
            </LazyPageWrapper>
          </ProtectedRoute>
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
        <LoginWrapper />
      </LazyPageWrapper>
    ),
  },
]);

export default router;
