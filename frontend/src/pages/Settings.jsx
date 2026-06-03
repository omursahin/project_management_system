import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function Settings() {
  return (
    <Box>
      <PageHeader title="Ayarlar" subtitle="Uygulama tercihleri." />
      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="xl" p={6} maxW="700px">
        <VStack align="start" gap={3}>
          <Heading size="sm" color="gray.700">Yakında</Heading>
          <Text fontSize="sm" color="gray.500">
            Tema seçimi, bildirim tercihleri, dil seçimi gibi ayarlar burada yer alacak.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
