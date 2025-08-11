/* src/router.tsx */
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import HouseyBuddy from "./pages/HouseyBuddy";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/houseybuddy", element: <HouseyBuddy /> },
    ],
  },
]);

export default router;
