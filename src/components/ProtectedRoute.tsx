import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/auth-store';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page and save the location they tried to access
      navigate('/login', { 
        replace: true, 
        state: { from: location.pathname } 
      });
    }
  }, [isAuthenticated, navigate, location]);

  // If they're authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;