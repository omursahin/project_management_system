import { Flex, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Box minH="100vh" display="flex" flexDirection="column">
        {/* Üst Kısım: Navbar */}
        <Navbar />

        <Flex flex="1">
          {/* Sol Kısım: Sidebar */}
          <Sidebar />

          {/* Orta Kısım: Ana İçerik */}
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

        {/* Alt Kısım: Footer */}
        <Footer />
      </Box>
    </Router>
  );
}

export default App;