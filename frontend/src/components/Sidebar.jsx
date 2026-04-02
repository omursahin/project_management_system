<<<<<<< HEAD
import { Box, VStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom"; // Sayfa yenilenmemesi için şart
=======
import { Box, VStack, Link, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

const menuItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Panel", href: "/dashboard" },
  { label: "Gruplarım", href: "/groups" },
  { label: "Profilim", href: "/profile" },
  { label: "Ayarlar", href: "/settings" },
];
>>>>>>> ee9d2d7 (create grops pages)

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
<<<<<<< HEAD
      <VStack align="stretch" spacing={4}>
        <Text fontWeight="bold" color="gray.600" fontSize="sm">MENÜ</Text>

        {/* YENİ EKLENEN KISIM: Üniversiteler Linki */}
        <ChakraLink
          as={RouterLink}
          to="/universities"
          p={2}
          _hover={{ bg: "teal.50", color: "teal.600" }}
          borderRadius="md"
          fontWeight="medium"
        >
          Üniversiteler
        </ChakraLink>

        <ChakraLink p={2} _hover={{ bg: "teal.50", color: "teal.600" }} borderRadius="md">Profilim</ChakraLink>
        <ChakraLink p={2} _hover={{ bg: "teal.50", color: "teal.600" }} borderRadius="md">Ayarlar</ChakraLink>
        <ChakraLink p={2} _hover={{ bg: "teal.50", color: "teal.600" }} borderRadius="md">Mesajlar</ChakraLink>
=======
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
>>>>>>> ee9d2d7 (create grops pages)
      </VStack>
    </Box>
  );
};

export default Sidebar;