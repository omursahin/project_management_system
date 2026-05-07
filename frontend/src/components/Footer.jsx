import { Box, Text, Flex, Separator } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" bg="white" borderTop="1px solid" borderColor="gray.100" mt="auto">
      <Flex
        justify="space-between"
        align="center"
        px={6}
        py={4}
        maxW="1400px"
        mx="auto"
        direction={{ base: "column", sm: "row" }}
        gap={2}
      >
        <Text fontSize="xs" color="gray.400">
          &copy; {new Date().getFullYear()} Proje Yönetim Sistemi
        </Text>
        <Text fontSize="xs" color="gray.400">
          Web Programlama Dersi
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
