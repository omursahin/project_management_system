import { Flex, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import CoordinatorLayout from "./components/layout/CoordinatorLayout.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import AdminUniversitiesPage from "./pages/admin/UniversitiesPage.jsx";
import CoordinatorPanel from "./pages/coordinator/CoordinatorPanel.jsx";
import { isAuthenticated, isAdmin, isCoordinator } from "./services/auth.js";

function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function CoordinatorRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isCoordinator()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppLayout() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Navbar />
      <Flex flex="1">
        <Sidebar />
        <Box as="main" flex="1" p={{ base: 4, md: 6, lg: 8 }} maxW="1200px">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
          </Routes>
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route path="universities" element={<AdminUniversitiesPage />} />
          <Route path="settings" element={<AdminPanel />} />
          <Route path="users" element={<AdminPanel />} />
        </Route>


        <Route
          path="coordinator"
          element={
            <CoordinatorRoute>
              <CoordinatorLayout />
            </CoordinatorRoute>
          }
        >
          <Route index element={<CoordinatorPanel />} />
          <Route path="groups" element={<CoordinatorPanel />} />
          <Route path="lessons" element={<CoordinatorPanel />} />
          <Route path="reports" element={<CoordinatorPanel />} />
        </Route>
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
