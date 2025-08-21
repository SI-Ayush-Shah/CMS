import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import LazyPageWrapper from "../components/LazyPageWrapper";
import BaseLayout from "../layouts/BaseLayout";
import ContentWizardPage from "../pages/ContentWizardPage";
import ComponentsPage from "../pages/ComponentsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginWrapper from "../components/LoginWrapper";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import BlogPage from "../pages/BlogPage";
import ContentEditorPage from "../pages/ContentEditorPage";
import EditorPage from "../pages/EditorPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import FeedManagerPage from "../pages/FeedManagerPage";
import SocialMediaPage from "../pages/SocialMediaPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

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
        path: "social-media",
        element: (
          <ProtectedRoute>
            <LazyPageWrapper>
              <SocialMediaPage />
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
], {
  basename: "/hackathon-2025-content-studio",
});

export default router;
