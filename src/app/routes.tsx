import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { RoleSelection } from "./components/RoleSelection";
import { MapView } from "./components/MapView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/role-selection",
    element: <RoleSelection />,
  },
  {
    path: "/map",
    element: <MapView />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
