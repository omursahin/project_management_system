import { Box, VStack, Link, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

const menuItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Panel", href: "/dashboard" },
  { label: "Gruplarım", href: "/groups" },
  { label: "Projelerim", href: "/projects" },
  { label: "Profilim", href: "/profile" },
  { label: "Ayarlar", href: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box
      as="aside"
      w="250px"
      h="calc(100vh - 64px)"
      bg="gray.50"
      borderRight="1px"
      borderColor="gray.200"
      p={5}
      display={{ base: "none", md: "block" }}
    >
      <VStack align="stretch" spacing={1}>
        <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>
          MENÜ
        </Text>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              p={2}
              borderRadius="md"
              fontWeight={isActive ? "semibold" : "normal"}
              bg={isActive ? "teal.50" : "transparent"}
              color={isActive ? "teal.700" : "gray.700"}
              _hover={{ bg: "teal.50", color: "teal.600" }}
              textDecoration="none"
            >
              {item.label}
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Sidebar;