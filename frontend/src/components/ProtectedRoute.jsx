import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // if not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // if role doesn't match
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" />;
  }

  // allowed
  return children;
}

export default ProtectedRoute;