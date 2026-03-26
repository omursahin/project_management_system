import { Box, Text, Center } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" py={5} bg="gray.800" color="white" mt="auto">
      <Center>
        <Text fontSize="sm">
          &copy; {new Date().getFullYear()} Web Programlama Dersi | Tüm Hakları Saklıdır.
        </Text>
      </Center>
    </Box>
  );
};

export default Footer;