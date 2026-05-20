import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Groups from "./pages/Groups.jsx";
import { isAuthenticated } from "./services/auth.js";
import NotGirisi from "./pages/NotGirisi.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
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
            <Route path="/universities" element={<UniversityTable />} />
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
            <Route path="not-girisi" element={<NotGirisi />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;