import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";

function ProtectedRoute({ element: Component, ...props }) {
  const { loggedIn } = useContext(AuthContext);

  return loggedIn ? (
    <Component {...props} />
  ) : (
    <Navigate to="/signin" replace />
  );
}

export default ProtectedRoute;
