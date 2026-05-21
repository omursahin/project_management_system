import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import { isAdmin, isCoordinator } from "./services/auth.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserLayout from "./components/layout/UserLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import CoordinatorLayout from "./components/layout/CoordinatorLayout.jsx";

import AdminPanel from "./pages/admin/AdminPanel.jsx";
import AdminUniversitiesPage from "./pages/admin/UniversitiesPage.jsx";
import CoordinatorPanel from "./pages/coordinator/CoordinatorPanel.jsx";
import NotGirisi from "./pages/coordinator/NotGirisi.jsx";
import Lessons from "./pages/Lessons.jsx";
import GroupProjectPage from "./components/group-project/GroupProjectPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="admin"
          element={
            <ProtectedRoute role={isAdmin}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route path="universities" element={<AdminUniversitiesPage />} />
          <Route path="settings" element={<AdminPanel />} />
          <Route path="users" element={<AdminPanel />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="grades" element={<NotGirisi />} />
        </Route>

        <Route
          path="coordinator"
          element={
            <ProtectedRoute role={isCoordinator}>
              <CoordinatorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CoordinatorPanel />} />
          <Route path="groups" element={<CoordinatorPanel />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="grades" element={<NotGirisi />} />
          <Route path="group-projects" element={<GroupProjectPage />} />
          <Route path="reports" element={<CoordinatorPanel />} />
        </Route>

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="groups" element={<Groups />} />
          <Route path="group-projects" element={<GroupProjectPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
