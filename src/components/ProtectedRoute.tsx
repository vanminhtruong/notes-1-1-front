import { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = memo(({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
