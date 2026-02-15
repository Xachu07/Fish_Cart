import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Strict role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access (e.g., ['admin', 'partner'])
 * @param {string} props.redirectTo - Path to redirect unauthorized users (default: '/')
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'partner') {
      return <Navigate to="/partner" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
