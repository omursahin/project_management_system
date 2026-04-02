import { Box, VStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom"; // Sayfa yenilenmemesi için şart

const Sidebar = () => {
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
      </VStack>
    </Box>
  );
};

export default Sidebar;