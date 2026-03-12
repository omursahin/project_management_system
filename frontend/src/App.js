import { Flex, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main app routes with layout */}
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