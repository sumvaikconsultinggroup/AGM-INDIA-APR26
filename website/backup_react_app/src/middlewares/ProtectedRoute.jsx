import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate 
      to="/login" 
      replace 
      state={{ from: window.location.pathname }}
    />
  );
};

export default ProtectedRoute;
