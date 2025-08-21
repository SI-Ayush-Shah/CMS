import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingIndicator from './LoadingIndicator';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page, but save the intended destination
      navigate('/hackathon-2025-content-studio/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute; 