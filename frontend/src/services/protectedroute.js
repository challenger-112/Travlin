import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem("access_token");

  return accessToken
    ? children
    : <Navigate to="/login" replace />;
}

export default ProtectedRoute;