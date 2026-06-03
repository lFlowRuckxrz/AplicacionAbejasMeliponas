import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { RoleSelection } from "./components/RoleSelection";
import { MapView } from "./components/MapView";
import { Profile } from "./components/Profile";
import { MundoMelipona } from "./components/MundoMelipona";
import { ForgotPassword } from "./components/ForgotPassword";

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
    path: "/forgot-password",
    element: <ForgotPassword />,
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
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/mundo-melipona",
    element: <MundoMelipona />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
