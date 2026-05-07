import { Flex, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

// Bileşenleri import et
import UniversityTable from "./components/university-list/UniversityTable.jsx";
import Groups from "./pages/Groups.jsx";
import FacultyManagement from "./pages/FacultyManagement.jsx"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <Box minH="100vh" display="flex" flexDirection="column">
              <Navbar />
              <Flex flex="1">
                <Sidebar />
                <Box as="main" p={8} flex="1" bg="white">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Box>
                          <h1>Hoş Geldin! Projenin Çakraları açılıyor... 🚀</h1>
                          <p>Burada projelerini yönetmeye başlayabilirsin.</p>
                        </Box>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <Box>
                          <h1>Panel (Dashboard)</h1>
                          <p>İstatistikler ve özet bilgiler burada yer alacak.</p>
                        </Box>
                      }
                    />
                    <Route path="/universities" element={<UniversityTable />} />
                    <Route path="/groups" element={<Groups />} />
                    
                    {/* Fakülte Yönetimi rotası */}
                    <Route path="/faculties" element={<FacultyManagement />} />

                  </Routes>
                </Box>
              </Flex>
              <Footer />
            </Box>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;