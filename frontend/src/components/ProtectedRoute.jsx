import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth.js";

export default function ProtectedRoute({ children, role }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (role && !role()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
