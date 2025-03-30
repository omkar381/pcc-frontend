import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, role, requiredRole, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
