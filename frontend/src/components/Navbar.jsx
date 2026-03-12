import { Flex, Box, Text, Button, Link } from "@chakra-ui/react";

const Navbar = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem 2rem"
      bg="teal.500"
      color="white"
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Box>
        <Text fontSize="lg" fontWeight="bold" letterSpacing="wider">
          WEB PROJE
        </Text>
      </Box>

      <Box display="flex" gap="20px">
        <Link href="/">Ana Sayfa</Link>
        <Link href="/dashboard">Panel</Link>
        <Button colorScheme="whiteAlpha" variant="outline" size="sm">
          Çıkış
        </Button>
      </Box>
    </Flex>
  );
};

export default Navbar;