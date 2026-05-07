import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import AdminSidebar from "../sidebar/AdminSidebar.jsx";
import Footer from "../Footer.jsx";

export default function AdminLayout() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Navbar />
      <Flex flex="1">
        <AdminSidebar />
        <Box as="main" flex="1" p={{ base: 4, md: 6, lg: 8 }} maxW="1200px">
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
}
