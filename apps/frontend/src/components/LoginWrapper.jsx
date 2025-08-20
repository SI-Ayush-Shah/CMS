import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoginPage from '../pages/LoginPage';

const LoginWrapper = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/wizard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If already authenticated, don't render login page
  if (isAuthenticated) {
    return null;
  }

  return <LoginPage />;
};

export default LoginWrapper; 