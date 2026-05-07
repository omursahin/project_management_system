import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import CoordinatorSidebar from "../sidebar/CoordinatorSidebar.jsx";
import Footer from "../Footer.jsx";

export default function KoordinatorLayout() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Navbar />
      <Flex flex="1">
        <CoordinatorSidebar />
        <Box as="main" flex="1" p={{ base: 4, md: 6, lg: 8 }} maxW="1200px">
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
}
