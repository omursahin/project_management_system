import { Flex, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UniversityTable from "./components/university-list/UniversityTable.jsx";
import Groups from "./pages/Groups.jsx";
import Profile from "./pages/Profile.jsx";
import { isAuthenticated } from "./services/auth.js";

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
            <Route path="/profile" element={<Profile />} />
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
          path="/*"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
