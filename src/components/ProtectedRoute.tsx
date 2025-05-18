import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useUser();
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render children or outlet (for nested routes)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;