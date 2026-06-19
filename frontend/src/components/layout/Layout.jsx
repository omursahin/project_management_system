import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import Footer from "../Footer.jsx";

/**
 * Generic layout component shared across all layout types.
 * Provides the top-level structure: Navbar, sidebar slot, main content, Footer.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.SidebarComponent] - Sidebar component to render
 */
export default function Layout({ SidebarComponent }) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Navbar />
      <Flex flex="1">
        {SidebarComponent && <SidebarComponent />}
        <Box as="main" flex="1" p={{ base: 4, md: 6, lg: 8 }} maxW="1200px">
          <Outlet />
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
}
