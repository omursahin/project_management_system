import { Box, VStack, Link, Icon, Text } from "@chakra-ui/react";

const Sidebar = () => {
  return (
    <Box
      as="aside"
      w="250px"
      h="calc(100vh - 64px)" // Navbar yüksekliğini çıkardık
      bg="gray.50"
      borderRight="1px"
      borderColor="gray.200"
      p={5}
      display={{ base: "none", md: "block" }} // Mobilde gizle, desktopta göster
    >
      <VStack align="stretch" spacing={4}>
        <Text fontWeight="bold" color="gray.600" fontSize="sm">MENÜ</Text>
        <Link p={2} _hover={{ bg: "teal.50", color: "teal.600" }} borderRadius="md">Profilim</Link>
        <Link p={2} _hover={{ bg: "teal.50", color: "teal.600" }} borderRadius="md">Ayarlar</Link>
        <Link p={2} _hover={{ bg: "teal.50", color: "teal.600" }} borderRadius="md">Mesajlar</Link>
      </VStack>
    </Box>
  );
};

export default Sidebar;